import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { TierName } from '../entities/loyalty-tier.entity';

export class CreateTierDto {
  @ApiProperty({
    description: 'Tier name',
    enum: TierName,
    example: TierName.GOLD,
  })
  @IsEnum(TierName)
  name: TierName;

  @ApiProperty({
    description: 'Display name for the tier',
    example: 'Gold Member',
    maxLength: 100,
  })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({
    description: 'Tier description',
    example: 'Gold tier members get 2x points and free shipping',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Minimum points required for this tier',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  minPoints: number;

  @ApiProperty({
    description: 'Maximum points for this tier (0 for unlimited)',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  maxPoints: number;

  @ApiProperty({
    description: 'Points earned per $1 spent',
    example: 2.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  pointsEarningRate: number;

  @ApiProperty({
    description: '$ value per point redeemed',
    example: 0.01,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  pointsRedemptionRate: number;

  @ApiPropertyOptional({
    description: 'Discount percentage for this tier',
    example: 5.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Free shipping benefit',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @ApiPropertyOptional({
    description: 'Priority customer support',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  prioritySupport?: boolean;

  @ApiPropertyOptional({
    description: 'Months before points expire (0 for no expiry)',
    example: 12,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsExpiryMonths?: number;

  @ApiPropertyOptional({
    description: 'Sort order for displaying tiers',
    example: 3,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
