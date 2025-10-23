import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LoyaltyUserTier } from './loyalty-user-tier.entity';

export enum TierName {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

@Entity('loyalty_tiers')
export class LoyaltyTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TierName,
    unique: true,
  })
  name: TierName;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  minPoints: number; // Minimum points required for this tier

  @Column({ type: 'int' })
  maxPoints: number; // Maximum points for this tier (0 for unlimited)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pointsEarningRate: number; // Points earned per $1 spent

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pointsRedemptionRate: number; // $ value per point redeemed

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number; // Discount percentage for this tier

  @Column({ type: 'boolean', default: false })
  freeShipping: boolean; // Free shipping benefit

  @Column({ type: 'boolean', default: false })
  prioritySupport: boolean; // Priority customer support

  @Column({ type: 'int', default: 0 })
  pointsExpiryMonths: number; // Months before points expire (0 for no expiry)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // For ordering tiers

  @OneToMany(() => LoyaltyUserTier, (userTier) => userTier.tier)
  userTiers: LoyaltyUserTier[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
