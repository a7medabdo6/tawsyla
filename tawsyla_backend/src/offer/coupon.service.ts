import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Like } from 'typeorm';
import { Coupon, CouponType, CouponStatus } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponValidationResponseDto } from './dto/coupon-response.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private couponUsageRepository: Repository<CouponUsage>,
  ) {}

  async createCoupon(
    createCouponDto: CreateCouponDto,
    createdById?: number,
  ): Promise<Coupon> {
    // Check if coupon code already exists
    const existingCoupon = await this.couponRepository.findOne({
      where: { code: createCouponDto.code },
    });

    if (existingCoupon) {
      throw new ConflictException('Coupon code already exists');
    }

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      expiresAt: new Date(createCouponDto.expiresAt),
      createdById,
    });

    return this.couponRepository.save(coupon);
  }

  async updateCoupon(
    id: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check if code is being updated and if it already exists
    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existingCoupon = await this.couponRepository.findOne({
        where: { code: updateCouponDto.code },
      });

      if (existingCoupon) {
        throw new ConflictException('Coupon code already exists');
      }
    }

    Object.assign(coupon, updateCouponDto);

    if (updateCouponDto.expiresAt) {
      coupon.expiresAt = new Date(updateCouponDto.expiresAt);
    }

    return this.couponRepository.save(coupon);
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.couponRepository.remove(coupon);
  }

  async getAllCoupons(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: CouponType,
    status?: CouponStatus,
  ): Promise<{
    data: Coupon[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    if (search) {
      whereConditions.code = Like(`%${search}%`);
    }

    if (type) {
      whereConditions.type = type;
    }

    if (status) {
      if (status === CouponStatus.EXPIRED) {
        whereConditions.expiresAt = LessThan(new Date());
      } else if (status === CouponStatus.ACTIVE) {
        whereConditions.isActive = true;
        whereConditions.expiresAt = MoreThan(new Date());
      } else if (status === CouponStatus.DISABLED) {
        whereConditions.isActive = false;
      }
    }

    const [data, total] = await this.couponRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['usages', 'usages.user'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }
  async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { code } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async validateCoupon(
    validateCouponDto: ValidateCouponDto,
    userId: number,
  ): Promise<CouponValidationResponseDto> {
    const { code, orderAmount } = validateCouponDto;

    try {
      const coupon = await this.getCouponByCode(code);

      // Check if coupon is active
      if (!coupon.isActive || coupon.status !== CouponStatus.ACTIVE) {
        return {
          isValid: false,
          message: 'Coupon is not active',
        };
      }

      // Check if coupon has expired
      if (new Date() > coupon.expiresAt) {
        return {
          isValid: false,
          message: 'Coupon has expired',
        };
      }

      // Check if coupon usage limit has been reached
      if (coupon.usageCount >= coupon.usageLimit) {
        return {
          isValid: false,
          message: 'Coupon usage limit has been reached',
        };
      }

      // Check minimum order amount
      if (
        coupon.minimumOrderAmount &&
        orderAmount < coupon.minimumOrderAmount
      ) {
        return {
          isValid: false,
          message: `Minimum order amount of $${coupon.minimumOrderAmount} required`,
        };
      }

      // Check user usage limit
      const userUsageCount = await this.couponUsageRepository.count({
        where: { couponId: coupon.id, userId },
      });

      if (userUsageCount >= coupon.usageLimitPerUser) {
        return {
          isValid: false,
          message: 'You have already used this coupon maximum times',
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.type === CouponType.FIXED) {
        discountAmount = coupon.value;
      } else if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = (orderAmount * coupon.value) / 100;
        console.log(discountAmount, 'discountAmountdiscountAmount');

        // Apply maximum discount limit for percentage coupons
        if (
          coupon.maximumDiscountAmount &&
          discountAmount > coupon.maximumDiscountAmount
        ) {
          discountAmount = coupon.maximumDiscountAmount;
        }
      }

      const finalAmount = orderAmount - discountAmount;

      return {
        isValid: true,
        message: 'Coupon is valid',
        coupon: this.mapCouponToResponseDto(coupon),
        discountAmount,
        finalAmount,
      };
    } catch {
      return {
        isValid: false,
        message: 'Invalid coupon code',
      };
    }
  }

  async applyCoupon(
    couponId: string,
    userId: number,
    orderAmount: number,
    orderId?: string,
  ): Promise<CouponUsage> {
    const coupon = await this.getCouponById(couponId);

    // Validate coupon again before applying
    const validation = await this.validateCoupon(
      { code: coupon.code, orderAmount },
      userId,
    );

    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }

    // Create usage record
    const usage = this.couponUsageRepository.create({
      couponId: coupon.id,
      userId,
      orderAmount,
      discountAmount: validation.discountAmount!,
      orderId,
    });

    // Increment usage count
    coupon.usageCount += 1;
    await this.couponRepository.save(coupon);

    return this.couponUsageRepository.save(usage);
  }

  async getUserCouponUsage(userId: number): Promise<CouponUsage[]> {
    return this.couponUsageRepository.find({
      where: { userId },
      relations: ['coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateExpiredCoupons(): Promise<void> {
    await this.couponRepository.update(
      {
        status: CouponStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
      { status: CouponStatus.EXPIRED },
    );
  }

  async updateCouponUsageOrderId(
    usageId: string,
    orderId: string,
  ): Promise<void> {
    await this.couponUsageRepository.update(usageId, { orderId });
  }

  private mapCouponToResponseDto(coupon: Coupon): any {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      usageLimitPerUser: coupon.usageLimitPerUser,
      expiresAt: coupon.expiresAt,
      status: coupon.status,
      isActive: coupon.isActive,
      createdById: coupon.createdById,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }
}
