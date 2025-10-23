import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import {
  LoyaltyPoints,
  PointsTransactionType,
  PointsSource,
} from './entities/loyalty-points.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import { LoyaltyUserTier } from './entities/loyalty-user-tier.entity';
import { LoyaltyReward, RewardStatus } from './entities/loyalty-reward.entity';
import { CreateTierDto } from './dto/create-tier.dto';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UserLoyaltySummaryResponseDto } from './dto/loyalty-response.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyPoints)
    private loyaltyPointsRepository: Repository<LoyaltyPoints>,
    @InjectRepository(LoyaltyTier)
    private loyaltyTierRepository: Repository<LoyaltyTier>,
    @InjectRepository(LoyaltyUserTier)
    private loyaltyUserTierRepository: Repository<LoyaltyUserTier>,
    @InjectRepository(LoyaltyReward)
    private loyaltyRewardRepository: Repository<LoyaltyReward>,
  ) {}

  // Points Management
  async addPoints(
    userId: number,
    points: number,
    source: PointsSource,
    orderId?: string,
    orderAmount?: number,
    description?: string,
  ): Promise<LoyaltyPoints> {
    const currentBalance = await this.getUserPointsBalance(userId);
    const newBalance = currentBalance + points;

    const pointsTransaction = this.loyaltyPointsRepository.create({
      userId,
      transactionType: PointsTransactionType.EARNED,
      source,
      points,
      balanceAfter: newBalance,
      orderId,
      orderAmount,
      description,
    });

    // Set expiry date based on user's tier
    const userTier = await this.getUserCurrentTier(userId);
    if (userTier && userTier.tier.pointsExpiryMonths > 0) {
      const expiryDate = new Date();
      expiryDate.setMonth(
        expiryDate.getMonth() + userTier.tier.pointsExpiryMonths,
      );
      pointsTransaction.expiresAt = expiryDate;
    }

    const savedTransaction =
      await this.loyaltyPointsRepository.save(pointsTransaction);

    // Update user tier if needed
    await this.updateUserTier(userId);

    return savedTransaction;
  }

  async deductPoints(
    userId: number,
    points: number,
    source: PointsSource,
    description?: string,
  ): Promise<LoyaltyPoints> {
    const currentBalance = await this.getUserPointsBalance(userId);

    if (currentBalance < points) {
      throw new BadRequestException('Insufficient points balance');
    }

    const newBalance = currentBalance - points;

    const pointsTransaction = this.loyaltyPointsRepository.create({
      userId,
      transactionType: PointsTransactionType.REDEEMED,
      source,
      points: -points,
      balanceAfter: newBalance,
      description,
    });

    const savedTransaction =
      await this.loyaltyPointsRepository.save(pointsTransaction);

    // Update user tier if needed
    await this.updateUserTier(userId);

    return savedTransaction;
  }

  async getUserPointsBalance(userId: number): Promise<number> {
    const result = await this.loyaltyPointsRepository
      .createQueryBuilder('points')
      .select('SUM(points.points)', 'balance')
      .where('points.userId = :userId', { userId })
      .andWhere('points.isActive = :isActive', { isActive: true })
      .andWhere('(points.expiresAt IS NULL OR points.expiresAt > :now)', {
        now: new Date(),
      })
      .getRawOne();

    return parseInt(result?.balance || '0');
  }

  async getUserPointsHistory(
    userId: number,
    limit = 20,
  ): Promise<LoyaltyPoints[]> {
    return this.loyaltyPointsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Tier Management
  async createTier(createTierDto: CreateTierDto): Promise<LoyaltyTier> {
    const tier = this.loyaltyTierRepository.create(createTierDto);
    return this.loyaltyTierRepository.save(tier);
  }

  async getAllTiers(): Promise<LoyaltyTier[]> {
    return this.loyaltyTierRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getTierById(id: string): Promise<LoyaltyTier> {
    const tier = await this.loyaltyTierRepository.findOne({ where: { id } });
    if (!tier) {
      throw new NotFoundException('Tier not found');
    }
    return tier;
  }

  async getRewardById(id: string): Promise<LoyaltyReward> {
    const reward = await this.loyaltyRewardRepository.findOne({
      where: { id },
      relations: ['eligibleTiers'],
    });
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    return reward;
  }

  async getUserCurrentTier(userId: number): Promise<LoyaltyUserTier | null> {
    return this.loyaltyUserTierRepository.findOne({
      where: { userId, isActive: true },
      relations: ['tier'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateUserTier(userId: number): Promise<void> {
    const currentPoints = await this.getUserPointsBalance(userId);
    const allTiers = await this.getAllTiers();

    // Find the appropriate tier for current points
    let appropriateTier: LoyaltyTier | null = null;

    for (const tier of allTiers) {
      if (
        currentPoints >= tier.minPoints &&
        (tier.maxPoints === 0 || currentPoints <= tier.maxPoints)
      ) {
        if (!appropriateTier || tier.sortOrder > appropriateTier.sortOrder) {
          appropriateTier = tier;
        }
      }
    }

    if (!appropriateTier) {
      // Assign to lowest tier if no tier found
      appropriateTier = allTiers.find((tier) => tier.sortOrder === 0) || null;
    }

    if (appropriateTier) {
      const currentUserTier = await this.getUserCurrentTier(userId);

      if (!currentUserTier || currentUserTier.tierId !== appropriateTier.id) {
        // Deactivate current tier if exists
        if (currentUserTier) {
          currentUserTier.isActive = false;
          currentUserTier.tierEndDate = new Date();
          await this.loyaltyUserTierRepository.save(currentUserTier);
        }

        // Create new tier assignment
        const newUserTier = this.loyaltyUserTierRepository.create({
          userId,
          tierId: appropriateTier.id,
          currentPoints,
          lifetimePoints: await this.getUserLifetimePoints(userId),
          tierStartDate: new Date(),
          isActive: true,
        });

        await this.loyaltyUserTierRepository.save(newUserTier);
      } else {
        // Update current tier with new points
        currentUserTier.currentPoints = currentPoints;
        currentUserTier.lifetimePoints =
          await this.getUserLifetimePoints(userId);
        currentUserTier.lastActivityDate = new Date();
        await this.loyaltyUserTierRepository.save(currentUserTier);
      }
    }
  }

  async getUserLifetimePoints(userId: number): Promise<number> {
    const result = await this.loyaltyPointsRepository
      .createQueryBuilder('points')
      .select(
        'SUM(CASE WHEN points.points > 0 THEN points.points ELSE 0 END)',
        'lifetime',
      )
      .where('points.userId = :userId', { userId })
      .andWhere('points.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseInt(result?.lifetime || '0');
  }

  // Reward Management
  async createReward(createRewardDto: CreateRewardDto): Promise<LoyaltyReward> {
    const reward = this.loyaltyRewardRepository.create({
      ...createRewardDto,
      validFrom: createRewardDto.validFrom
        ? new Date(createRewardDto.validFrom)
        : undefined,
      validUntil: createRewardDto.validUntil
        ? new Date(createRewardDto.validUntil)
        : undefined,
    });

    const savedReward = await this.loyaltyRewardRepository.save(reward);

    // Add eligible tiers if provided
    if (
      createRewardDto.eligibleTierIds &&
      createRewardDto.eligibleTierIds.length > 0
    ) {
      const tiers = await this.loyaltyTierRepository.findByIds(
        createRewardDto.eligibleTierIds,
      );
      savedReward.eligibleTiers = tiers;
      await this.loyaltyRewardRepository.save(savedReward);
    }

    return savedReward;
  }

  async getAvailableRewards(userId: number): Promise<LoyaltyReward[]> {
    const userTier = await this.getUserCurrentTier(userId);
    const currentPoints = await this.getUserPointsBalance(userId);
    const now = new Date();

    const rewards = await this.loyaltyRewardRepository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.eligibleTiers', 'tier')
      .where('reward.isActive = :isActive', { isActive: true })
      .andWhere('reward.status = :status', { status: RewardStatus.ACTIVE })
      .andWhere('reward.pointsCost <= :currentPoints', { currentPoints })
      .andWhere('(reward.validFrom IS NULL OR reward.validFrom <= :now)', {
        now,
      })
      .andWhere('(reward.validUntil IS NULL OR reward.validUntil >= :now)', {
        now,
      })
      .andWhere(
        '(reward.usageLimit = -1 OR reward.usageCount < reward.usageLimit)',
        {},
      )
      .andWhere(
        userTier
          ? 'tier.id = :tierId OR reward.eligibleTiers IS EMPTY'
          : 'reward.eligibleTiers IS EMPTY',
        userTier ? { tierId: userTier.tierId } : {},
      )
      .orderBy('reward.sortOrder', 'ASC')
      .getMany();

    // For free product rewards, we need to fetch product information
    // This would typically be done by injecting the Product repository
    // For now, we'll return the rewards as is - the frontend can fetch product details separately
    return rewards;
  }

  async redeemReward(
    userId: number,
    rewardId: string,
    // orderId?: string,
  ): Promise<LoyaltyPoints> {
    const reward = await this.loyaltyRewardRepository.findOne({
      where: { id: rewardId },
      relations: ['eligibleTiers'],
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (!reward.isActive || reward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException('Reward is not active');
    }

    const currentPoints = await this.getUserPointsBalance(userId);
    if (currentPoints < reward.pointsCost) {
      throw new BadRequestException(
        'Insufficient points to redeem this reward',
      );
    }

    // Check usage limits
    if (reward.usageLimit !== -1 && reward.usageCount >= reward.usageLimit) {
      throw new BadRequestException('Reward usage limit reached');
    }

    // Check user eligibility
    const userTier = await this.getUserCurrentTier(userId);
    if (reward.eligibleTiers.length > 0) {
      const isEligible =
        userTier &&
        reward.eligibleTiers.some((tier) => tier.id === userTier.tierId);
      if (!isEligible) {
        throw new BadRequestException('You are not eligible for this reward');
      }
    }

    // Check validity dates
    const now = new Date();
    if (reward.validFrom && reward.validFrom > now) {
      throw new BadRequestException('Reward is not yet valid');
    }
    if (reward.validUntil && reward.validUntil < now) {
      throw new BadRequestException('Reward has expired');
    }

    // Deduct points
    const transaction = await this.deductPoints(
      userId,
      reward.pointsCost,
      PointsSource.REDEMPTION,
      `Redeemed: ${reward.name}`,
    );

    // Update reward usage count
    reward.usageCount += 1;
    await this.loyaltyRewardRepository.save(reward);

    return transaction;
  }

  // User Loyalty Summary
  async getUserLoyaltySummary(
    userId: number,
  ): Promise<UserLoyaltySummaryResponseDto> {
    const currentPoints = await this.getUserPointsBalance(userId);
    const lifetimePoints = await this.getUserLifetimePoints(userId);
    const currentTier = await this.getUserCurrentTier(userId);
    const allTiers = await this.getAllTiers();
    const availableRewards = await this.getAvailableRewards(userId);
    const recentTransactions = await this.getUserPointsHistory(userId, 10);

    // Find next tier
    let nextTier: LoyaltyTier | undefined;
    let pointsToNextTier = 0;

    if (currentTier) {
      const currentTierIndex = allTiers.findIndex(
        (tier) => tier.id === currentTier.tierId,
      );
      if (currentTierIndex < allTiers.length - 1) {
        nextTier = allTiers[currentTierIndex + 1];
        pointsToNextTier = nextTier.minPoints - currentPoints;
      }
    } else if (allTiers.length > 0) {
      nextTier = allTiers[0];
      pointsToNextTier = nextTier.minPoints - currentPoints;
    }

    return {
      userId,
      currentPoints,
      lifetimePoints,
      currentTier: currentTier?.tier || undefined,
      nextTier,
      pointsToNextTier: Math.max(0, pointsToNextTier),
      availableRewards,
      recentTransactions,
    };
  }

  // Admin Functions
  async adjustUserPoints(
    userId: number,
    points: number,
    description: string,
    adminUserId: number,
  ): Promise<LoyaltyPoints> {
    const transactionType =
      points > 0
        ? PointsTransactionType.ADJUSTED
        : PointsTransactionType.ADJUSTED;

    const pointsTransaction = this.loyaltyPointsRepository.create({
      userId,
      transactionType,
      source: PointsSource.ADMIN_ADJUSTMENT,
      points,
      balanceAfter: (await this.getUserPointsBalance(userId)) + points,
      description: `${description} (Admin: ${adminUserId})`,
    });

    const savedTransaction =
      await this.loyaltyPointsRepository.save(pointsTransaction);
    await this.updateUserTier(userId);

    return savedTransaction;
  }

  async expirePoints(): Promise<void> {
    const expiredPoints = await this.loyaltyPointsRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
        isActive: true,
        points: MoreThan(0),
      },
    });

    for (const point of expiredPoints) {
      point.isActive = false;
      await this.loyaltyPointsRepository.save(point);

      // Create expiry transaction
      await this.loyaltyPointsRepository.save(
        this.loyaltyPointsRepository.create({
          userId: point.userId,
          transactionType: PointsTransactionType.EXPIRED,
          source: PointsSource.ORDER,
          points: -point.points,
          balanceAfter: await this.getUserPointsBalance(point.userId),
          description: 'Points expired',
        }),
      );
    }
  }
}
