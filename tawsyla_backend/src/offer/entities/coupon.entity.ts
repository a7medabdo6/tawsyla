import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { CouponUsage } from './coupon-usage.entity';

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum CouponStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CouponType,
    default: CouponType.FIXED,
  })
  type: CouponType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // Fixed amount or percentage value

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderAmount?: number; // Minimum order amount to apply coupon

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount?: number; // Maximum discount amount for percentage coupons

  @Column({ type: 'int', default: 1 })
  usageLimit: number; // Total usage limit

  @Column({ type: 'int', default: 0 })
  usageCount: number; // Current usage count

  @Column({ type: 'int', default: 1 })
  usageLimitPerUser: number; // Usage limit per user

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdBy?: UserEntity;

  @Column({ type: 'int', nullable: true })
  createdById?: number;

  @OneToMany(() => CouponUsage, (usage) => usage.coupon)
  usages: CouponUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
