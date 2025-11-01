import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';
import { MasterCategory } from '../../master-category/entities/master-category.entity';

@Entity('categories')
export class Category {
  @ApiProperty({ description: 'Category ID', type: String })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Category name in English',
    minLength: 2,
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @ApiProperty({
    description: 'Category name in Arabic',
    minLength: 2,
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  nameAr: string;

  @ApiPropertyOptional({ description: 'Category descriptionEn' })
  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Category descriptionAr' })
  @Column({ type: 'text', nullable: true })
  descriptionAr?: string;

  @OneToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  image?: FileEntity | null;

  @ApiPropertyOptional({
    description: 'Full path of the category (e.g., "Food > Dairy > Milk")',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  fullPath?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column({ type: 'uuid', nullable: true })
  masterCategoryId?: string;

  @ApiPropertyOptional({ type: () => MasterCategory })
  @ManyToOne(
    () => MasterCategory,
    (masterCategory) => masterCategory.categories,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'masterCategoryId' })
  masterCategory?: MasterCategory;

  @ApiPropertyOptional({
    type: () => [Product],
    description: 'Products in this category',
  })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ApiProperty({ description: 'Created at', type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;
}
