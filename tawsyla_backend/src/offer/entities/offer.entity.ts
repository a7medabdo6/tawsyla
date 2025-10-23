import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Category } from '../../category/entities/category.entity';

export enum OfferType {
  DISCOUNT = 'discount',
  BUY_ONE_GET_ONE = 'buy_one_get_one',
  FREE_SHIPPING = 'free_shipping',
  CASHBACK = 'cashback',
}

export enum OfferStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: OfferType,
    default: OfferType.DISCOUNT,
  })
  type: OfferType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage?: number; // Percentage discount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number; // Fixed discount amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderAmount?: number; // Minimum order amount to apply offer

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount?: number; // Maximum discount amount

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.ACTIVE,
  })
  status: OfferStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdBy?: UserEntity;

  @Column({ type: 'int', nullable: true })
  createdById?: number;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'offer_products',
    joinColumn: { name: 'offerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'offer_categories',
    joinColumn: { name: 'offerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
