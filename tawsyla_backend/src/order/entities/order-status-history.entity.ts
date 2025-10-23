import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderStatus } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  // @Column({ type: 'enum', enum: OrderStatus })
  // previousStatus: OrderStatus;

  @Column({ type: 'enum', enum: OrderStatus })
  newStatus: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', nullable: true })
  changedByUserId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  changedByUserRole?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  changeReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
