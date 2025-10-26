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

  @Column({ type: 'int', default: 0 })
  salesCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'boolean', default: false })
  isTopSelling: boolean;

  @Column({ type: 'boolean', default: false })
  isTrending: boolean;

  @Column({ type: 'boolean', default: false })
  isRecentlyAdded: boolean;

  @Column({ type: 'boolean', default: false })
  isTopRated: boolean;

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

  // Dynamic methods for category logic
  updateTopSelling(threshold: number = 100): void {
    this.isTopSelling = this.salesCount >= threshold;
  }

  updateTrending(viewThreshold: number = 1, salesThreshold: number = 0): void {
    const recentViews = this.viewCount;
    const recentSales = this.salesCount;
    this.isTrending =
      recentViews >= viewThreshold && recentSales >= salesThreshold;
  }

  updateRecentlyAdded(daysThreshold: number = 7): void {
    const daysSinceCreated = Math.floor(
      (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    this.isRecentlyAdded = daysSinceCreated <= daysThreshold;
  }

  updateTopRated(ratingThreshold: number = 4.0): void {
    this.isTopRated = this.rating >= ratingThreshold;
  }

  // Method to update all categories at once
  updateAllCategories(options?: {
    topSellingThreshold?: number;
    trendingViewThreshold?: number;
    trendingSalesThreshold?: number;
    recentlyAddedDays?: number;
    topRatedThreshold?: number;
  }): void {
    this.updateTopSelling(options?.topSellingThreshold);
    this.updateTrending(
      options?.trendingViewThreshold,
      options?.trendingSalesThreshold,
    );
    this.updateRecentlyAdded(options?.recentlyAddedDays);
    this.updateTopRated(options?.topRatedThreshold);
  }

  // Getter methods for easy access
  get categories(): string[] {
    const categories: string[] = [];
    if (this.isTopSelling) categories.push('top-selling');
    if (this.isTrending) categories.push('trending');
    if (this.isRecentlyAdded) categories.push('recently-added');
    if (this.isTopRated) categories.push('top-rated');
    return categories;
  }
}
