import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';
import { Category } from '../../category/entities/category.entity';
import { ProductVariant } from './product-variant.entity';

export enum ProductType {
  FOOD = 'food',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  PHARMACY = 'pharmacy',
  GROCERY = 'grocery',
  OTHER = 'other',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @Column({ type: 'varchar', length: 100 })
  nameAr: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.OTHER,
  })
  type: ProductType;

  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @Column({ type: 'text', nullable: true })
  descriptionAr?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid' })
  companyId: string;

  @OneToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  image?: FileEntity | null;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    eager: true,
  })
  variants: ProductVariant[];

  @UpdateDateColumn()
  updatedAt: Date;
}
