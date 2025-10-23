import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { RewardType } from '../entities/loyalty-reward.entity';

export class CreateRewardDto {
  @ApiProperty({
    description: 'Reward name',
    example: '20% Off Next Order',
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Reward description',
    example: 'Get 20% off your next order when you redeem this reward',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of reward',
    enum: RewardType,
    example: RewardType.DISCOUNT,
  })
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({
    description: 'Points required to redeem',
    example: 500,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  pointsCost: number;

  @ApiPropertyOptional({
    description: 'Fixed discount amount',
    example: 10.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Percentage discount',
    example: 20.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount required',
    example: 50.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount for percentage rewards',
    example: 25.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Usage limit (-1 for unlimited)',
    example: 100,
    default: -1,
  })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Usage limit per user',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiPropertyOptional({
    description: 'Valid from date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({
    description: 'Valid until date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Sort order for displaying rewards',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Eligible tier IDs',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  eligibleTierIds?: string[];

  @ApiPropertyOptional({
    description: 'Product ID for free product reward',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  freeProductId?: string;

  @ApiPropertyOptional({
    description: 'Product variant ID for free product reward',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  freeProductVariantId?: string;

  @ApiPropertyOptional({
    description: 'Quantity of free product (default 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  freeProductQuantity?: number;
}
