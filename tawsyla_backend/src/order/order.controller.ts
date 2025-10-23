import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './entities/order.entity';
import { OrderQueryDto } from './dto/order-query.dto';
import { UserOrderQueryDto } from './dto/user-order-query.dto';
import { OrderStatusHistoryResponseDto } from './dto/order-status-history-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Order status filter',
  })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    enum: PaymentStatus,
    description: 'Payment status filter',
  })
  @ApiQuery({
    name: 'paymentMethod',
    required: false,
    enum: PaymentMethod,
    description: 'Payment method filter',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort by field',
  })
  async getAllOrders(
    @Query() query: OrderQueryDto,
  ): Promise<OrderListResponseDto> {
    return this.orderService.getAllOrders(query);
  }

  @Get('my-orders')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Get user orders with pagination' })
  @ApiResponse({
    status: 200,
    description: 'User orders retrieved successfully',
    type: OrderListResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  async getUserOrders(
    @Request() req: any,
    @Query() query: UserOrderQueryDto,
  ): Promise<OrderListResponseDto> {
    const { page = 1, limit = 10 } = query;
    return this.orderService.getUserOrdersPaginated(req.user.id, page, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.user)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrderById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    const order = await this.orderService.getOrderById(id, req.user);
    return order;
  }

  @Post()
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data',
  })
  async createOrder(
    @Request() req: any,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.createOrder(
      createOrderDto,
      req.user.id,
    );
    return this.mapOrderToResponseDto(order);
  }

  @Put(':id/status')
  @Roles(RoleEnum.admin, RoleEnum.user)
  @ApiOperation({ summary: 'Update order status (Admin and User)' })
  @ApiBody({
    type: UpdateOrderStatusDto,
    description: 'Order status update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: any,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
      req.user.id,
      req.user.role?.name || 'admin',
      updateOrderStatusDto.changeReason,
      updateOrderStatusDto.notes,
    );
    return order;
  }

  @Get(':id/status-history')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.user)
  @ApiOperation({ summary: 'Get order status history' })
  @ApiResponse({
    status: 200,
    description: 'Order status history retrieved successfully',
    type: [OrderStatusHistoryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrderStatusHistory(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    // First verify the order exists and user has access
    await this.orderService.getOrderById(id, req.user);

    // Get the status history
    const history = await this.orderService.getOrderStatusHistory(id);

    return history.map((entry) => ({
      id: entry.id,
      orderId: entry.orderId,
      newStatus: entry.newStatus,
      notes: entry.notes,
      changedByUserId: entry.changedByUserId,
      changedByUserRole: entry.changedByUserRole,
      changeReason: entry.changeReason,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
  }

  @Put(':id/payment-status')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update payment status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: PaymentStatus },
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.updatePaymentStatus(
      id,
      body.paymentStatus,
    );
    return this.mapOrderToResponseDto(order);
  }

  @Put(':id/tracking')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update tracking information (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tracking information updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updateTrackingInfo(
    @Param('id') id: string,
    @Body() body: { trackingNumber: string; trackingUrl?: string },
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.updateTrackingInfo(
      id,
      body.trackingNumber,
      body.trackingUrl,
    );
    return this.mapOrderToResponseDto(order);
  }

  @Put(':id/admin-notes')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Add admin notes (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin notes added successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async addAdminNotes(
    @Param('id') id: string,
    @Body() body: { adminNotes: string },
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.addAdminNotes(id, body.adminNotes);
    return this.mapOrderToResponseDto(order);
  }

  @Post(':id/cancel')
  @Roles(RoleEnum.user, RoleEnum.admin)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel this order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async cancelOrder(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body?: { reason?: string; notes?: string },
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.cancelOrder(
      id,
      req.user,
      body?.reason,
      body?.notes,
    );
    return this.mapOrderToResponseDto(order);
  }

  private mapOrderToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      shippingAddressId: order.shippingAddressId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      couponUsageId: order.couponUsageId,
      notes: order.notes,
      adminNotes: order.adminNotes,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      isActive: order.isActive,
      items:
        order.items?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          discountAmount: item.discountAmount,
          finalPrice: item.finalPrice,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [],
      statusHistory: order.statusHistory || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
