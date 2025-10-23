import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  appName: string;

  @OneToOne(() => FileEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  logo?: FileEntity | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsappNumber1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsappNumber2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facebookPageLink: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instagramLink: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tiktokLink: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone1: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twitterLink: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedinLink: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  youtubeLink: string;

  @Column({ type: 'text', nullable: true })
  aboutUs: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ type: 'text', nullable: true })
  privacyPolicy: string;

  @Column({ type: 'text', nullable: true })
  refundPolicy: string;

  @Column({ type: 'text', nullable: true })
  shippingPolicy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
