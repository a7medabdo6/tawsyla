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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { LoyaltyService } from './loyalty.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { CreateRewardDto } from './dto/create-reward.dto';
import {
  LoyaltyTierResponseDto,
  LoyaltyRewardResponseDto,
  UserLoyaltySummaryResponseDto,
  LoyaltyPointsResponseDto,
} from './dto/loyalty-response.dto';

@ApiTags('Loyalty')
@Controller('loyalty')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // User Endpoints
  @Get('summary')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Get user loyalty summary' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty summary retrieved successfully',
    type: UserLoyaltySummaryResponseDto,
  })
  async getUserLoyaltySummary(
    @Request() req: any,
  ): Promise<UserLoyaltySummaryResponseDto> {
    return this.loyaltyService.getUserLoyaltySummary(req.user.id);
  }

  @Get('points/balance')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Get user points balance' })
  @ApiResponse({
    status: 200,
    description: 'Points balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        balance: { type: 'number', example: 1250 },
      },
    },
  })
  async getUserPointsBalance(
    @Request() req: any,
  ): Promise<{ balance: number }> {
    const balance = await this.loyaltyService.getUserPointsBalance(req.user.id);
    return { balance };
  }

  @Get('points/history')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Get user points history' })
  @ApiResponse({
    status: 200,
    description: 'Points history retrieved successfully',
    type: [LoyaltyPointsResponseDto],
  })
  async getUserPointsHistory(
    @Request() req: any,
    @Query('limit') limit?: number,
  ): Promise<LoyaltyPointsResponseDto[]> {
    const history = await this.loyaltyService.getUserPointsHistory(
      req.user.id,
      limit,
    );
    return history.map((transaction) => ({
      id: transaction.id,
      userId: transaction.userId,
      transactionType: transaction.transactionType,
      source: transaction.source,
      points: transaction.points,
      balanceAfter: transaction.balanceAfter,
      orderAmount: transaction.orderAmount,
      orderId: transaction.orderId,
      description: transaction.description,
      expiresAt: transaction.expiresAt,
      isActive: transaction.isActive,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));
  }

  @Get('rewards/available')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Get available rewards for user' })
  @ApiResponse({
    status: 200,
    description: 'Available rewards retrieved successfully',
    type: [LoyaltyRewardResponseDto],
  })
  async getAvailableRewards(
    @Request() req: any,
  ): Promise<LoyaltyRewardResponseDto[]> {
    const rewards = await this.loyaltyService.getAvailableRewards(req.user.id);
    return rewards.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      pointsCost: reward.pointsCost,
      discountAmount: reward.discountAmount,
      discountPercentage: reward.discountPercentage,
      minimumOrderAmount: reward.minimumOrderAmount,
      maximumDiscountAmount: reward.maximumDiscountAmount,
      usageLimit: reward.usageLimit,
      usageCount: reward.usageCount,
      usageLimitPerUser: reward.usageLimitPerUser,
      validFrom: reward.validFrom,
      validUntil: reward.validUntil,
      status: reward.status,
      isActive: reward.isActive,
      sortOrder: reward.sortOrder,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    }));
  }

  @Post('rewards/:id/redeem')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Redeem a reward' })
  @ApiResponse({
    status: 200,
    description: 'Reward redeemed successfully',
    type: LoyaltyPointsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Cannot redeem reward - insufficient points or other restrictions',
  })
  async redeemReward(
    @Param('id') rewardId: string,
    @Request() req: any,
  ): Promise<LoyaltyPointsResponseDto> {
    const transaction = await this.loyaltyService.redeemReward(
      req.user.id,
      rewardId,
    );
    return {
      id: transaction.id,
      userId: transaction.userId,
      transactionType: transaction.transactionType,
      source: transaction.source,
      points: transaction.points,
      balanceAfter: transaction.balanceAfter,
      orderAmount: transaction.orderAmount,
      orderId: transaction.orderId,
      description: transaction.description,
      expiresAt: transaction.expiresAt,
      isActive: transaction.isActive,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  // Admin Endpoints
  @Get('tiers')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Get all loyalty tiers (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Loyalty tiers retrieved successfully',
    type: [LoyaltyTierResponseDto],
  })
  async getAllTiers(): Promise<LoyaltyTierResponseDto[]> {
    const tiers = await this.loyaltyService.getAllTiers();
    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      displayName: tier.displayName,
      description: tier.description,
      minPoints: tier.minPoints,
      maxPoints: tier.maxPoints,
      pointsEarningRate: tier.pointsEarningRate,
      pointsRedemptionRate: tier.pointsRedemptionRate,
      discountPercentage: tier.discountPercentage,
      freeShipping: tier.freeShipping,
      prioritySupport: tier.prioritySupport,
      pointsExpiryMonths: tier.pointsExpiryMonths,
      isActive: tier.isActive,
      sortOrder: tier.sortOrder,
      createdAt: tier.createdAt,
      updatedAt: tier.updatedAt,
    }));
  }

  @Post('tiers')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create new loyalty tier (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Loyalty tier created successfully',
    type: LoyaltyTierResponseDto,
  })
  async createTier(
    @Body() createTierDto: CreateTierDto,
  ): Promise<LoyaltyTierResponseDto> {
    const tier = await this.loyaltyService.createTier(createTierDto);
    return {
      id: tier.id,
      name: tier.name,
      displayName: tier.displayName,
      description: tier.description,
      minPoints: tier.minPoints,
      maxPoints: tier.maxPoints,
      pointsEarningRate: tier.pointsEarningRate,
      pointsRedemptionRate: tier.pointsRedemptionRate,
      discountPercentage: tier.discountPercentage,
      freeShipping: tier.freeShipping,
      prioritySupport: tier.prioritySupport,
      pointsExpiryMonths: tier.pointsExpiryMonths,
      isActive: tier.isActive,
      sortOrder: tier.sortOrder,
      createdAt: tier.createdAt,
      updatedAt: tier.updatedAt,
    };
  }

  @Post('rewards')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create new loyalty reward (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Loyalty reward created successfully',
    type: LoyaltyRewardResponseDto,
  })
  async createReward(
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<LoyaltyRewardResponseDto> {
    const reward = await this.loyaltyService.createReward(createRewardDto);
    return {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      pointsCost: reward.pointsCost,
      discountAmount: reward.discountAmount,
      discountPercentage: reward.discountPercentage,
      minimumOrderAmount: reward.minimumOrderAmount,
      maximumDiscountAmount: reward.maximumDiscountAmount,
      usageLimit: reward.usageLimit,
      usageCount: reward.usageCount,
      usageLimitPerUser: reward.usageLimitPerUser,
      validFrom: reward.validFrom,
      validUntil: reward.validUntil,
      status: reward.status,
      isActive: reward.isActive,
      sortOrder: reward.sortOrder,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }

  @Put('users/:userId/points')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Adjust user points (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User points adjusted successfully',
    type: LoyaltyPointsResponseDto,
  })
  async adjustUserPoints(
    @Param('userId') userId: number,
    @Body() body: { points: number; description: string },
    @Request() req: any,
  ): Promise<LoyaltyPointsResponseDto> {
    const transaction = await this.loyaltyService.adjustUserPoints(
      userId,
      body.points,
      body.description,
      req.user.id,
    );
    return {
      id: transaction.id,
      userId: transaction.userId,
      transactionType: transaction.transactionType,
      source: transaction.source,
      points: transaction.points,
      balanceAfter: transaction.balanceAfter,
      orderAmount: transaction.orderAmount,
      orderId: transaction.orderId,
      description: transaction.description,
      expiresAt: transaction.expiresAt,
      isActive: transaction.isActive,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  @Post('points/expire')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Expire expired points (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Expired points processed successfully',
  })
  async expirePoints(): Promise<{ message: string }> {
    await this.loyaltyService.expirePoints();
    return { message: 'Expired points processed successfully' };
  }
}
