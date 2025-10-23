import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsPhoneNumber,
  MaxLength,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileType } from '../../files/domain/file';
import { FileDto } from '../../files/dto/file.dto';

export class CreateSettingsDto {
  @ApiProperty({
    description: 'Application name',
    example: 'Tawsyla',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  appName: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  logo?: FileDto | null;

  @ApiPropertyOptional({
    description: 'Application description',
    example: 'Your trusted e-commerce platform',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'First WhatsApp number',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappNumber1?: string;

  @ApiPropertyOptional({
    description: 'Second WhatsApp number',
    example: '+0987654321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappNumber2?: string;

  @ApiPropertyOptional({
    description: 'Facebook page link',
    example: 'https://facebook.com/tawsyla',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  facebookPageLink?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile link',
    example: 'https://instagram.com/tawsyla',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  instagramLink?: string;

  @ApiPropertyOptional({
    description: 'TikTok profile link',
    example: 'https://tiktok.com/@tawsyla',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  tiktokLink?: string;

  @ApiPropertyOptional({
    description: 'First phone number',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone1?: string;

  @ApiPropertyOptional({
    description: 'Second phone number',
    example: '+0987654321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone2?: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'contact@tawsyla.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Main Street, City, Country',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'New York',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'United States',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '10001',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://tawsyla.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Twitter profile link',
    example: 'https://twitter.com/tawsyla',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  twitterLink?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile link',
    example: 'https://linkedin.com/company/tawsyla',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  linkedinLink?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel link',
    example: 'https://youtube.com/c/tawsyla',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  youtubeLink?: string;

  @ApiPropertyOptional({
    description: 'About us content',
    example: 'We are a leading e-commerce platform...',
  })
  @IsOptional()
  @IsString()
  aboutUs?: string;

  @ApiPropertyOptional({
    description: 'Terms and conditions',
    example: 'By using our service, you agree to...',
  })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({
    description: 'Privacy policy',
    example: 'We respect your privacy and...',
  })
  @IsOptional()
  @IsString()
  privacyPolicy?: string;

  @ApiPropertyOptional({
    description: 'Refund policy',
    example: 'We offer 30-day refund policy...',
  })
  @IsOptional()
  @IsString()
  refundPolicy?: string;

  @ApiPropertyOptional({
    description: 'Shipping policy',
    example: 'We ship worldwide with...',
  })
  @IsOptional()
  @IsString()
  shippingPolicy?: string;

  @ApiPropertyOptional({
    description: 'Whether settings are active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
