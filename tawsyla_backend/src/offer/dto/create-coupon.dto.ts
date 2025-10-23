import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon code (unique)',
    example: 'SAVE20',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Coupon name',
    example: 'Save 20% on Electronics',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Coupon description',
    example: 'Get 20% off on all electronics',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of coupon',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    description: 'Coupon value (fixed amount or percentage)',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount to apply coupon',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (for percentage coupons)',
    example: 50.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiProperty({
    description: 'Total usage limit',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  usageLimit: number;

  @ApiProperty({
    description: 'Usage limit per user',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  usageLimitPerUser: number;

  @ApiProperty({
    description: 'Expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({
    description: 'Is the coupon active?',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
