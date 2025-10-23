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
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant?: ProductVariant;

  @Column({ type: 'uuid', nullable: true })
  variantId?: string;

  @Column({ type: 'varchar', length: 100 })
  productName: string; // Store product name at time of order

  @Column({ type: 'varchar', length: 100, nullable: true })
  variantName?: string; // Store variant name at time of order

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Price per unit at time of order

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // quantity * unitPrice

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number; // Discount applied to this item

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number; // totalPrice - discountAmount

  @Column({ type: 'text', nullable: true })
  notes?: string; // Special instructions for this item

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
