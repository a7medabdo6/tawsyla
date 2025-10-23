import { ApiProperty } from '@nestjs/swagger';
import {
  PointsTransactionType,
  PointsSource,
} from '../entities/loyalty-points.entity';
import { TierName } from '../entities/loyalty-tier.entity';
import { RewardType, RewardStatus } from '../entities/loyalty-reward.entity';

export class LoyaltyPointsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: PointsTransactionType })
  transactionType: PointsTransactionType;

  @ApiProperty({ enum: PointsSource })
  source: PointsSource;

  @ApiProperty()
  points: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  orderAmount?: number;

  @ApiProperty()
  orderId?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  expiresAt?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LoyaltyTierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TierName })
  name: TierName;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  minPoints: number;

  @ApiProperty()
  maxPoints: number;

  @ApiProperty()
  pointsEarningRate: number;

  @ApiProperty()
  pointsRedemptionRate: number;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  freeShipping: boolean;

  @ApiProperty()
  prioritySupport: boolean;

  @ApiProperty()
  pointsExpiryMonths: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LoyaltyUserTierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  tierId: string;

  @ApiProperty()
  currentPoints: number;

  @ApiProperty()
  lifetimePoints: number;

  @ApiProperty()
  tierStartDate: Date;

  @ApiProperty()
  tierEndDate?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastActivityDate?: Date;

  @ApiProperty()
  tier: LoyaltyTierResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LoyaltyRewardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: RewardType })
  type: RewardType;

  @ApiProperty()
  pointsCost: number;

  @ApiProperty()
  discountAmount?: number;

  @ApiProperty()
  discountPercentage?: number;

  @ApiProperty()
  minimumOrderAmount?: number;

  @ApiProperty()
  maximumDiscountAmount?: number;

  @ApiProperty()
  freeProductId?: string;

  @ApiProperty()
  freeProductVariantId?: string;

  @ApiProperty()
  freeProductQuantity?: number;

  @ApiProperty()
  freeProductName?: string;

  @ApiProperty()
  freeProductVariantName?: string;

  @ApiProperty()
  usageLimit: number;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  usageLimitPerUser: number;

  @ApiProperty()
  validFrom?: Date;

  @ApiProperty()
  validUntil?: Date;

  @ApiProperty({ enum: RewardStatus })
  status: RewardStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserLoyaltySummaryResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  currentPoints: number;

  @ApiProperty()
  lifetimePoints: number;

  @ApiProperty()
  currentTier?: LoyaltyTierResponseDto;

  @ApiProperty()
  nextTier?: LoyaltyTierResponseDto;

  @ApiProperty()
  pointsToNextTier: number;

  @ApiProperty()
  availableRewards: LoyaltyRewardResponseDto[];

  @ApiProperty()
  recentTransactions: LoyaltyPointsResponseDto[];
}
