import { ApiProperty } from '@nestjs/swagger';
import { CouponType, CouponStatus } from '../entities/coupon.entity';

export class CouponResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: CouponType })
  type: CouponType;

  @ApiProperty()
  value: number;

  @ApiProperty()
  minimumOrderAmount?: number;

  @ApiProperty()
  maximumDiscountAmount?: number;

  @ApiProperty()
  usageLimit: number;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  usages?: any;

  @ApiProperty()
  usageLimitPerUser: number;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty({ enum: CouponStatus })
  status: CouponStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdById?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CouponValidationResponseDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  coupon?: CouponResponseDto;

  @ApiProperty()
  discountAmount?: number;

  @ApiProperty()
  finalAmount?: number;
}
