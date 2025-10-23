import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { Order } from '../../order/entities/order.entity';

export enum PointsTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
  BONUS = 'bonus',
}

export enum PointsSource {
  ORDER = 'order',
  REFERRAL = 'referral',
  BIRTHDAY = 'birthday',
  PROMOTION = 'promotion',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  REDEMPTION = 'redemption',
}

@Entity('loyalty_points')
export class LoyaltyPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'enum',
    enum: PointsTransactionType,
    default: PointsTransactionType.EARNED,
  })
  transactionType: PointsTransactionType;

  @Column({
    type: 'enum',
    enum: PointsSource,
    default: PointsSource.ORDER,
  })
  source: PointsSource;

  @Column({ type: 'int' })
  points: number; // Positive for earned, negative for redeemed/expired

  @Column({ type: 'int' })
  balanceAfter: number; // Points balance after this transaction

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  orderAmount?: number; // Order amount that earned points

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column({ type: 'uuid', nullable: true })
  orderId?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description?: string; // Human-readable description

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; // When points expire (if applicable)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
