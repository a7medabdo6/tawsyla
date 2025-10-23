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
import { LoyaltyTier } from './loyalty-tier.entity';

@Entity('loyalty_user_tiers')
export class LoyaltyUserTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => LoyaltyTier, { nullable: false })
  @JoinColumn({ name: 'tierId' })
  tier: LoyaltyTier;

  @Column({ type: 'uuid' })
  tierId: string;

  @Column({ type: 'int' })
  currentPoints: number; // Current points balance

  @Column({ type: 'int' })
  lifetimePoints: number; // Total points earned lifetime

  @Column({ type: 'timestamp' })
  tierStartDate: Date; // When user achieved this tier

  @Column({ type: 'timestamp', nullable: true })
  tierEndDate?: Date; // When user moved to next tier

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Current tier status

  @Column({ type: 'timestamp', nullable: true })
  lastActivityDate?: Date; // Last order or activity date

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
