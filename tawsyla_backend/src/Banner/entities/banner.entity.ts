import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity('banners')
export class Banner {
  @ApiProperty({ description: 'banner ID', type: String })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'banner name in English',
    minLength: 2,
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @ApiProperty({
    description: 'banner name in Arabic',
    minLength: 2,
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  nameAr: string;

  @OneToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  image?: FileEntity | null;

  @ApiProperty({ description: 'Created at', type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;
}
