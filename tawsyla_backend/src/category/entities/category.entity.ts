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
    description: 'Parent category ID for hierarchical structure',
  })
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @ApiPropertyOptional({
    type: () => Category,
    description: 'Parent category',
  })
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @ApiPropertyOptional({
    type: () => [Category],
    description: 'Child categories',
  })
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @ApiPropertyOptional({
    description: 'Category level in hierarchy (1, 2, 3, etc.)',
  })
  @Column({ type: 'int', default: 1 })
  level: number;

  @ApiPropertyOptional({
    description: 'Full path of the category (e.g., "Food > Dairy > Milk")',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  fullPath?: string;

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
