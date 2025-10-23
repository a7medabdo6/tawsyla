import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderStatusHistoryDto } from './dto/create-order-status-history.dto';

import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { CouponService } from '../offer/coupon.service';
import { Address } from '../address/entities/address.entity';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PointsSource } from '../loyalty/entities/loyalty-points.entity';
import { PushNotificationService } from '../push-notifications/push-notification.service';
import { UsersService } from '../users/users.service';
import {
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private couponService: CouponService,
    private loyaltyService: LoyaltyService,
    private pushNotificationService: PushNotificationService,
    private usersService: UsersService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: number,
  ): Promise<Order> {
    // Validate shipping address if provided
    if (createOrderDto.shippingAddressId) {
      const address = await this.addressRepository.findOne({
        where: { id: createOrderDto.shippingAddressId, userId },
      });
      if (!address) {
        throw new BadRequestException(
          'Shipping address not found or does not belong to user',
        );
      }
    }

    // Validate and calculate order items
    const orderItems = await this.validateAndCalculateItems(
      createOrderDto.items,
    );

    // Calculate subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Apply coupon if provided
    let discountAmount = 0;
    let couponUsageId: string | undefined;

    if (createOrderDto.couponCode) {
      const validation = await this.couponService.validateCoupon(
        { code: createOrderDto.couponCode, orderAmount: subtotal },
        userId,
      );

      if (!validation.isValid) {
        throw new BadRequestException(validation.message);
      }

      // Apply coupon and create usage record
      const usage = await this.couponService.applyCoupon(
        validation.coupon!.id,
        userId,
        subtotal,
        undefined, // orderId will be set after order creation
      );

      discountAmount = usage.discountAmount;
      couponUsageId = usage.id;
    }

    // Apply loyalty reward if provided
    let loyaltyRewardDiscount = 0;
    let finalShippingCost = createOrderDto.shippingCost || 0;

    if (createOrderDto.loyaltyRewardId) {
      try {
        // Get reward details first to validate and apply benefits
        const rewardDetails = await this.loyaltyService.getRewardById(
          createOrderDto.loyaltyRewardId,
        );

        // Redeem the reward (this deducts points)
        await this.loyaltyService.redeemReward(
          userId,
          createOrderDto.loyaltyRewardId,
        );

        if (rewardDetails.type === 'free_shipping') {
          // Apply free shipping if order meets minimum amount
          if (subtotal >= (rewardDetails.minimumOrderAmount || 0)) {
            finalShippingCost = 0;
          }
        } else if (
          rewardDetails.type === 'discount' ||
          rewardDetails.type === 'birthday_gift' ||
          rewardDetails.type === 'cashback'
        ) {
          // Calculate discount amount
          if (rewardDetails.discountAmount) {
            loyaltyRewardDiscount = rewardDetails.discountAmount;
          } else if (rewardDetails.discountPercentage) {
            const percentageDiscount =
              (subtotal * rewardDetails.discountPercentage) / 100;
            loyaltyRewardDiscount = rewardDetails.maximumDiscountAmount
              ? Math.min(
                  percentageDiscount,
                  rewardDetails.maximumDiscountAmount,
                )
              : percentageDiscount;
          }
        } else if (rewardDetails.type === 'free_product') {
          // For free product rewards, we'll add the product to the order items
          // The product will be added with 0 price, so no discount calculation needed
          // The free product will be added to orderItems array later
        }
      } catch (error) {
        throw new BadRequestException(`Loyalty reward error: ${error.message}`);
      }
    }

    // Calculate final total
    const taxAmount = createOrderDto.taxAmount || 0;
    const totalDiscount = discountAmount + loyaltyRewardDiscount;
    const total = subtotal + finalShippingCost + taxAmount - totalDiscount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      shippingAddressId: createOrderDto.shippingAddressId,
      paymentMethod: createOrderDto.paymentMethod,
      subtotal,
      shippingCost: finalShippingCost,
      taxAmount,
      discountAmount: totalDiscount,
      total,
      couponUsageId,
      loyaltyRewardId: createOrderDto.loyaltyRewardId,
      notes: createOrderDto.notes,
      isActive: true,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Update coupon usage with order ID
    if (couponUsageId) {
      await this.couponService.updateCouponUsageOrderId(
        couponUsageId,
        savedOrder.id,
      );
    }

    // Create order items
    const orderItemsToSave = orderItems.map((item) => ({
      ...item,
      orderId: savedOrder.id,
    }));

    // Add free product if loyalty reward is free_product type
    if (createOrderDto.loyaltyRewardId) {
      const rewardDetails = await this.loyaltyService.getRewardById(
        createOrderDto.loyaltyRewardId,
      );

      if (
        rewardDetails.type === 'free_product' &&
        rewardDetails.freeProductId
      ) {
        // Get the free product details
        const freeProduct = await this.productRepository.findOne({
          where: { id: rewardDetails.freeProductId },
        });

        if (freeProduct) {
          let freeProductVariantName: string | null = null;
          if (rewardDetails.freeProductVariantId) {
            const freeProductVariant =
              await this.productVariantRepository.findOne({
                where: { id: rewardDetails.freeProductVariantId },
              });
            // Use size or SKU as variant name
            freeProductVariantName =
              freeProductVariant?.size || freeProductVariant?.sku || null;
          }

          // Create free product order item
          const freeProductItem = {
            orderId: savedOrder.id,
            productId: rewardDetails.freeProductId,
            variantId: rewardDetails.freeProductVariantId || null,
            productName: freeProduct.nameEn,
            variantName: freeProductVariantName,
            quantity: rewardDetails.freeProductQuantity || 1,
            unitPrice: 0, // Free product has 0 price
            totalPrice: 0, // Free product has 0 total
            isActive: true,
          };

          orderItemsToSave.push(freeProductItem);
        }
      }
    }

    await this.orderItemRepository.save(orderItemsToSave);

    // Award loyalty points for the order
    const userTier = await this.loyaltyService.getUserCurrentTier(userId);
    if (userTier) {
      const pointsToAward = Math.floor(
        subtotal * userTier.tier.pointsEarningRate,
      );
      if (pointsToAward > 0) {
        await this.loyaltyService.addPoints(
          userId,
          pointsToAward,
          PointsSource.ORDER,
          savedOrder.id,
          subtotal,
          `Points earned from order ${savedOrder.orderNumber}`,
        );
      }
    }
    await this.createStatusHistoryEntry(
      savedOrder?.id,
      OrderStatus?.PENDING,
      `${userId}`,
      'User',
      'Auto-generated Pending status',
      'Automatically created whne order created',
    );

    // Send push notification for order creation
    try {
      const userPushTokens = await this.usersService.getUserPushTokens(userId);
      if (userPushTokens.length > 0) {
        // Send notification to all user's devices
        await this.pushNotificationService.sendToMultipleDevices(
          userPushTokens,
          {
            title: 'Order Confirmed! 🎉',
            body: `Your order ${savedOrder.orderNumber} has been created successfully. Total: $${savedOrder.total.toFixed(2)}`,
            data: {
              type: 'order_created',
              orderId: savedOrder.id,
              orderNumber: savedOrder.orderNumber,
              total: savedOrder.total,
            },
            sound: 'default',
            badge: 1,
          },
        );
      }
    } catch (error) {
      // Log error but don't fail the order creation
      console.error(
        'Failed to send push notification for order creation:',
        error,
      );
    }

    // Return order with items
    return this.getOrderById(savedOrder.id, userId);
  }

  async getOrderById(id: string, user: any): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'user',
        'items',
        'items.product',
        'items.variant',
        'shippingAddress',
        'couponUsage',
      ],
    });
    console.log(order?.userId, user, 'orderorderorderorder');

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    // if (user?.role?.id == 1) {
    //   return order;
    // }
    // if (order.userId !== user) {
    //   throw new ForbiddenException('You can only view your own orders');
    // }

    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'shippingAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserOrdersPaginated(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<OrderListResponseDto> {
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: ['items', 'shippingAddress'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Get total count for this user
    const total = await this.orderRepository.count({
      where: { userId },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map to response DTOs
    const data = orders.map((order) => this.mapOrderToResponseDto(order));

    return {
      data,
      total,
      page,
      totalPages,
      limit,
      hasNextPage,
      hasPreviousPage,
    };
  }

  async getAllOrders(query: OrderQueryDto): Promise<OrderListResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      paymentMethod,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Create query builder
    let queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user');

    // Apply search filter
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(order.orderNumber ILIKE :search OR "user"."firstName" ILIKE :search OR items.productName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      queryBuilder = queryBuilder.andWhere('order.status = :status', {
        status,
      });
    }

    // Apply payment status filter
    if (paymentStatus) {
      queryBuilder = queryBuilder.andWhere(
        'order.paymentStatus = :paymentStatus',
        { paymentStatus },
      );
    }

    // Apply payment method filter
    if (paymentMethod) {
      queryBuilder = queryBuilder.andWhere(
        'order.paymentMethod = :paymentMethod',
        { paymentMethod },
      );
    }

    // Apply sorting
    queryBuilder = queryBuilder.orderBy(
      `order.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    // Execute query
    const orders = await queryBuilder.getMany();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map to response DTOs
    const data = orders.map((order) => this.mapOrderToResponseDto(order));

    return {
      data,
      total,
      page,
      totalPages,
      limit,
      hasNextPage,
      hasPreviousPage,
    };
  }

  // Helper method to map Order entity to OrderResponseDto
  private mapOrderToResponseDto(order: Order): any {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      statusHistory: order['statusHistory'] || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    changedByUserId?: string,
    changedByUserRole?: string,
    changeReason?: string,
    notes?: string,
  ): Promise<any> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const previousStatus = order.status;

    // Update status and related timestamps
    const updateData: any = { status };

    switch (status) {
      case OrderStatus.CONFIRMED:
        updateData.confirmedAt = new Date();
        updateData.cancelledAt = null;
        break;
      case OrderStatus.SHIPPED:
        updateData.shippedAt = new Date();
        updateData.cancelledAt = null;
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        updateData.cancelledAt = null;
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        break;
    }

    // Update the order
    await this.orderRepository.update(id, updateData);

    // Ensure all intermediate statuses exist in history for proper flow (except CANCELLED and REFUNDED)
    if (status !== OrderStatus.CANCELLED && status !== OrderStatus.REFUNDED) {
      await this.ensureIntermediateStatusesExist(
        id,
        status, // Pass the target status to check what intermediate statuses are needed
        changedByUserId,
        changedByUserRole,
      );
    }

    // // Create status history entry for the current status change
    // await this.createStatusHistoryEntry(
    //   id,
    //   status,
    //   changedByUserId,
    //   changedByUserRole,
    //   changeReason,
    //   notes,
    // );

    // Send push notification for order status update
    try {
      const userPushTokens = await this.usersService.getUserPushTokens(
        order.userId,
      );
      if (userPushTokens.length > 0) {
        const statusMessages = {
          confirmed: 'Your order has been confirmed!',
          processing: 'Your order is being processed.',
          shipped: 'Your order has been shipped!',
          delivered: 'Your order has been delivered!',
          cancelled: 'Your order has been cancelled.',
          refunded: 'Your order has been refunded.',
        };

        const message =
          statusMessages[status] ||
          `Your order status has been updated to ${status}`;

        await this.pushNotificationService.sendToMultipleDevices(
          userPushTokens,
          {
            title: `Order ${order.orderNumber} Update`,
            body: message,
            data: {
              type: 'order_status_update',
              orderId: order.id,
              orderNumber: order.orderNumber,
              status,
            },
            sound: 'default',
          },
        );
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error(
        'Failed to send push notification for order status update:',
        error,
      );
    }

    return this.getOrderById(id, order.userId);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.update(id, { paymentStatus });

    return this.getOrderById(id, order.userId);
  }

  async updateTrackingInfo(
    id: string,
    trackingNumber: string,
    trackingUrl?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.update(id, { trackingNumber, trackingUrl });

    return this.getOrderById(id, order.userId);
  }

  async addAdminNotes(id: string, adminNotes: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.update(id, { adminNotes });

    return this.getOrderById(id, order.userId);
  }

  async cancelOrder(
    id: string,
    user: any,
    reason?: string,
    notes?: string,
  ): Promise<Order> {
    const order = await this.getOrderById(id, user);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid orders');
    }

    return this.updateOrderStatus(
      id,
      OrderStatus.CANCELLED,
      user.id,
      user.role?.name || 'user',
      reason || 'Order cancelled by user',
      notes,
    );
  }

  private async validateAndCalculateItems(items: any[]): Promise<any[]> {
    const validatedItems: any[] = [];

    for (const item of items) {
      // Validate product exists
      const product = await this.productRepository.findOne({
        where: { id: item.productId, isActive: true },
        relations: ['variants'],
      });

      if (!product) {
        throw new BadRequestException(
          `Product with ID ${item.productId} not found or inactive`,
        );
      }

      let variant: ProductVariant | null = null;
      let unitPrice: number;

      if (item.variantId) {
        // Validate variant exists and belongs to product
        variant = await this.productVariantRepository.findOne({
          where: { id: item.variantId, productId: item.productId },
        });

        if (!variant) {
          throw new BadRequestException(
            `Variant with ID ${item.variantId} not found for this product`,
          );
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.sku || variant.ean}`,
          );
        }

        unitPrice = variant.price;
      } else {
        // All products require variant selection in current structure
        throw new BadRequestException(
          `Product ${product.nameEn} requires variant selection`,
        );
      }

      const totalPrice = unitPrice * item.quantity;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: product.nameEn,
        variantName: variant?.sku || variant?.ean,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        discountAmount: 0, // Will be calculated later if needed
        finalPrice: totalPrice,
        notes: item.notes,
      });
    }

    return validatedItems;
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const count = await this.orderRepository.count({
      where: {
        createdAt: Between(startOfYear, endOfYear),
      },
    });

    return `ORD-${year}-${(count + 1).toString().padStart(3, '0')}`;
  }

  private isValidStatusTransition(
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): boolean {
    // Define valid status transitions with more flexibility
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PROCESSING,
        OrderStatus.CANCELLED,
        OrderStatus.PENDING,
      ],
      [OrderStatus.PROCESSING]: [
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
        OrderStatus.CONFIRMED,
      ],
      [OrderStatus.SHIPPED]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.PROCESSING,
      ],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED, OrderStatus.SHIPPED],
      [OrderStatus.CANCELLED]: [OrderStatus.CONFIRMED, OrderStatus.PENDING], // Allow reactivation
      [OrderStatus.REFUNDED]: [OrderStatus.CANCELLED, OrderStatus.DELIVERED],
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
  }

  private getRequiredIntermediateStatuses(
    lastRecordedStatus: OrderStatus,
    targetStatus: OrderStatus,
    existingStatuses: Set<OrderStatus>,
  ): Array<{ fromStatus: OrderStatus; toStatus: OrderStatus }> {
    // Get the status progression (could be configurable in the future)
    const statusProgression = this.getStatusProgression();

    // If target status is not in progression, no intermediate statuses needed
    const targetIndex = statusProgression.indexOf(targetStatus);
    if (targetIndex === -1) {
      return [];
    }

    // Find the last recorded status in progression
    const lastRecordedIndex = statusProgression.indexOf(lastRecordedStatus);
    if (lastRecordedIndex === -1) {
      // Last recorded status not in progression, start from beginning
      return this.generateStatusTransitions(
        statusProgression,
        0,
        targetIndex,
        existingStatuses,
      );
    }

    // If target is before or equal to last recorded, no intermediate statuses needed
    if (targetIndex <= lastRecordedIndex) {
      return [];
    }

    // Generate transitions from last recorded status to target status
    return this.generateStatusTransitions(
      statusProgression,
      lastRecordedIndex,
      targetIndex,
      existingStatuses,
    );
  }

  private getStatusProgression(): OrderStatus[] {
    // This method could be made configurable in the future
    // For now, return the standard progression
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
  }

  private generateStatusTransitions(
    statusProgression: OrderStatus[],
    startIndex: number,
    endIndex: number,
    existingStatuses: Set<OrderStatus>,
  ): Array<{ fromStatus: OrderStatus; toStatus: OrderStatus }> {
    const transitions: Array<{
      fromStatus: OrderStatus;
      toStatus: OrderStatus;
    }> = [];

    // Start from the next status after the last recorded status
    for (let i = startIndex; i < endIndex; i++) {
      const fromStatus = statusProgression[i];
      const toStatus = statusProgression[i + 1];

      // Skip if the target status already exists
      if (existingStatuses.has(toStatus)) {
        continue;
      }

      // Additional validation: ensure we're not creating impossible transitions
      if (this.isValidStatusTransition(fromStatus, toStatus)) {
        transitions.push({ fromStatus, toStatus });
      } else {
        console.warn(
          `Skipping invalid transition from ${fromStatus} to ${toStatus} for order`,
        );
      }
    }

    return transitions;
  }

  private async ensureIntermediateStatusesExist(
    orderId: string,
    targetStatus: OrderStatus,
    changedByUserId?: string,
    changedByUserRole?: string,
  ): Promise<void> {
    // Get existing status history for this order
    const existingHistory = await this.orderStatusHistoryRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });

    // Create a set of existing statuses for quick lookup
    const existingStatuses = new Set(
      existingHistory.map((entry) => entry.newStatus),
    );

    // Determine the last recorded status from history (or use PENDING if no history exists)
    let lastRecordedStatus: OrderStatus = OrderStatus.PENDING;
    if (existingHistory.length > 0) {
      // Get the last status that was actually recorded in history
      const lastHistoryEntry = existingHistory[existingHistory.length - 1];
      lastRecordedStatus = lastHistoryEntry.newStatus;

      console.log(
        `Order ${orderId}: Last recorded status in history is ${lastRecordedStatus}`,
      );
    } else {
      console.log(
        `Order ${orderId}: No history found, starting from ${lastRecordedStatus}`,
      );
    }

    // Dynamically determine the status flow based on the last recorded status and target status
    const requiredStatuses = this.getRequiredIntermediateStatuses(
      lastRecordedStatus,
      targetStatus,
      existingStatuses,
    );

    if (requiredStatuses.length === 0) {
      console.log(
        `No intermediate status entries needed for order ${orderId} - flow integrity already maintained`,
      );
      return;
    }

    // Log what we're about to create
    console.log(
      `Order ${orderId}: Need to create ${requiredStatuses.length} intermediate statuses`,
    );
    console.log(`Starting from: ${lastRecordedStatus}`);
    console.log(`Target: ${targetStatus}`);
    console.log(
      `Missing transitions:`,
      requiredStatuses.map((t) => `${t.fromStatus} → ${t.toStatus}`),
    );

    console.log(
      `Order ${orderId}: Creating ${requiredStatuses.length} intermediate statuses from ${lastRecordedStatus} to ${targetStatus}`,
    );
    console.log(
      `Required transitions:`,
      requiredStatuses.map((t) => `${t.fromStatus} → ${t.toStatus}`),
    );

    // Create missing intermediate statuses and update order timestamps
    const timestampUpdates: any = {};
    let createdEntries = 0;

    // First, create the transition from last recorded status to first intermediate status if needed
    if (requiredStatuses.length > 0) {
      const firstRequiredStatus = requiredStatuses[0];
      const lastRecordedInProgression =
        this.getStatusProgression().indexOf(lastRecordedStatus);
      const firstRequiredIndex = this.getStatusProgression().indexOf(
        firstRequiredStatus.fromStatus,
      );

      // If there's a gap between last recorded and first required, create the bridge
      if (
        lastRecordedInProgression !== -1 &&
        firstRequiredIndex !== -1 &&
        firstRequiredIndex > lastRecordedInProgression + 1
      ) {
        const bridgeStatus =
          this.getStatusProgression()[lastRecordedInProgression + 1];
        if (
          bridgeStatus &&
          this.isValidStatusTransition(lastRecordedStatus, bridgeStatus)
        ) {
          await this.createStatusHistoryEntry(
            orderId,

            bridgeStatus,
            changedByUserId,
            changedByUserRole,
            'Auto-generated bridge status',
            'Automatically created to bridge gap in status flow',
          );
          createdEntries++;
          console.log(
            `Created bridge status: ${lastRecordedStatus} → ${bridgeStatus}`,
          );
        }
      }
    }

    for (const statusTransition of requiredStatuses) {
      const { fromStatus, toStatus } = statusTransition;

      // Set appropriate timestamps for intermediate statuses
      switch (toStatus) {
        case OrderStatus.CONFIRMED:
          timestampUpdates.confirmedAt = new Date();
          break;
        case OrderStatus.PROCESSING:
          // Processing doesn't have a specific timestamp field, but we'll record it in history
          break;
        case OrderStatus.SHIPPED:
          timestampUpdates.shippedAt = new Date();
          break;
      }

      // Create the missing status history entry
      await this.createStatusHistoryEntry(
        orderId,
        toStatus,
        changedByUserId,
        changedByUserRole,
        'Auto-generated intermediate status',
        'Automatically created to maintain status flow integrity',
      );

      createdEntries++;
    }

    // Update order with intermediate timestamps if any
    if (Object.keys(timestampUpdates).length > 0) {
      await this.orderRepository.update(orderId, timestampUpdates);
    }

    // Log the operation for audit purposes
    console.log(
      `Created ${createdEntries} intermediate status entries for order ${orderId} to maintain flow integrity up to ${targetStatus}`,
    );
    if (Object.keys(timestampUpdates).length > 0) {
      console.log(
        `Updated order timestamps: ${Object.keys(timestampUpdates).join(', ')}`,
      );
    }
  }

  private async createStatusHistoryEntry(
    orderId: string,
    newStatus: OrderStatus,
    changedByUserId?: string,
    changedByUserRole?: string,
    changeReason?: string,
    notes?: string,
  ): Promise<OrderStatusHistory> {
    const statusHistory = this.orderStatusHistoryRepository.create({
      orderId,
      newStatus,
      changedByUserId,
      changedByUserRole,
      changeReason,
      notes,
    });

    return this.orderStatusHistoryRepository.save(statusHistory);
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return this.orderStatusHistoryRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}
