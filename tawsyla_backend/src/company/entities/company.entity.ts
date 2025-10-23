import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';

export enum CompanyType {
  RESTAURANT = 'restaurant',
  GROCERY = 'grocery',
  PHARMACY = 'pharmacy',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  GENERAL_STORE = 'general_store',
  OTHER = 'other',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @Column({ type: 'varchar', length: 100 })
  nameAr: string;

  @Column({
    type: 'enum',
    enum: CompanyType,
    default: CompanyType.GENERAL_STORE,
  })
  type: CompanyType;

  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @Column({ type: 'text', nullable: true })
  descriptionAr?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  addressEn?: string;

  @Column({ type: 'text', nullable: true })
  addressAr?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'time', nullable: true })
  openingTime?: string;

  @Column({ type: 'time', nullable: true })
  closingTime?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  // Relationship with User
  // Relationship with User (One-to-One)
  @OneToOne(() => UserEntity, (user) => user.company, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
