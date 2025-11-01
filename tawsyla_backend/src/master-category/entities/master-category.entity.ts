import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';
import { Category } from '../../category/entities/category.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('master_categories')
export class MasterCategory {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Electronics' })
  @Column({ type: 'varchar', length: 255 })
  nameEn: string;

  @ApiProperty({ example: 'إلكترونيات' })
  @Column({ type: 'varchar', length: 255 })
  nameAr: string;

  @ApiPropertyOptional({ example: 'Description in English' })
  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'الوصف بالعربية' })
  @Column({ type: 'text', nullable: true })
  descriptionAr?: string;

  @ApiPropertyOptional({ type: () => FileEntity })
  @OneToOne(() => FileEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  image?: FileEntity | null;

  @ApiProperty({ default: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiPropertyOptional({ type: () => [Category] })
  @OneToMany(() => Category, (category) => category.masterCategory)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
