import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyPoints } from './entities/loyalty-points.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import { LoyaltyUserTier } from './entities/loyalty-user-tier.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoyaltyPoints,
      LoyaltyTier,
      LoyaltyUserTier,
      LoyaltyReward,
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
