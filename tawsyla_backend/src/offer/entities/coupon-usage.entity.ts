import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { Coupon } from './coupon.entity';

@Entity('coupon_usages')
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.usages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @Column({ type: 'uuid' })
  couponId: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  orderAmount: number; // Order amount when coupon was used

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number; // Actual discount applied

  @Column({ type: 'varchar', length: 100, nullable: true })
  orderId?: string; // Reference to the order

  @CreateDateColumn()
  createdAt: Date;
}
