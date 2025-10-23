import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum SizeUnit {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XL = 'xl',
  XXL = 'xxl',
  CUSTOM = 'custom',
}

export enum WeightUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  POUND = 'lb',
  OUNCE = 'oz',
}

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size?: string;

  @Column({
    type: 'enum',
    enum: SizeUnit,
    nullable: true,
  })
  sizeUnit?: SizeUnit;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: number;

  @Column({
    type: 'enum',
    enum: WeightUnit,
    nullable: true,
  })
  weightUnit?: WeightUnit;

  @Column({ type: 'varchar', length: 50, unique: true })
  ean: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
