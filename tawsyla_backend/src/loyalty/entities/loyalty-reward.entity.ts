import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { LoyaltyTier } from './loyalty-tier.entity';

export enum RewardType {
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
  FREE_PRODUCT = 'free_product',
  CASHBACK = 'cashback',
  BIRTHDAY_GIFT = 'birthday_gift',
  EARLY_ACCESS = 'early_access',
  VIP_EVENT = 'vip_event',
}

export enum RewardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('loyalty_rewards')
export class LoyaltyReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: RewardType,
    default: RewardType.DISCOUNT,
  })
  type: RewardType;

  @Column({ type: 'int' })
  pointsCost: number; // Points required to redeem

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number; // Fixed discount amount

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage?: number; // Percentage discount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderAmount?: number; // Minimum order for reward

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount?: number; // Max discount for percentage rewards

  @Column({ type: 'uuid', nullable: true })
  freeProductId?: string; // Product ID for free product reward

  @Column({ type: 'uuid', nullable: true })
  freeProductVariantId?: string; // Product variant ID for free product reward

  @Column({ type: 'int', default: 1 })
  freeProductQuantity?: number; // Quantity of free product (default 1)

  @Column({ type: 'int', default: -1 })
  usageLimit: number; // -1 for unlimited, positive number for limit

  @Column({ type: 'int', default: 0 })
  usageCount: number; // Current usage count

  @Column({ type: 'int', default: 1 })
  usageLimitPerUser: number; // How many times a user can redeem

  @Column({ type: 'timestamp', nullable: true })
  validFrom?: Date; // When reward becomes available

  @Column({ type: 'timestamp', nullable: true })
  validUntil?: Date; // When reward expires

  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.ACTIVE,
  })
  status: RewardStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => LoyaltyTier)
  @JoinTable({
    name: 'loyalty_reward_tiers',
    joinColumn: { name: 'rewardId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tierId', referencedColumnName: 'id' },
  })
  eligibleTiers: LoyaltyTier[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // For ordering rewards

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
