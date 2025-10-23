import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '../../files/domain/file';
import { IsOptional } from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';

export class SettingsResponseDto {
  @ApiProperty({
    description: 'Settings unique identifier',
    example: 'uuid-here',
  })
  id: string;

  @ApiProperty({
    description: 'Application name',
    example: 'Tawsyla',
  })
  appName: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  logo?: FileDto | null;

  @ApiPropertyOptional({
    description: 'Application description',
    example: 'Your trusted e-commerce platform',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'First WhatsApp number',
    example: '+1234567890',
  })
  whatsappNumber1?: string;

  @ApiPropertyOptional({
    description: 'Second WhatsApp number',
    example: '+0987654321',
  })
  whatsappNumber2?: string;

  @ApiPropertyOptional({
    description: 'Facebook page link',
    example: 'https://facebook.com/tawsyla',
  })
  facebookPageLink?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile link',
    example: 'https://instagram.com/tawsyla',
  })
  instagramLink?: string;

  @ApiPropertyOptional({
    description: 'TikTok profile link',
    example: 'https://tiktok.com/@tawsyla',
  })
  tiktokLink?: string;

  @ApiPropertyOptional({
    description: 'First phone number',
    example: '+1234567890',
  })
  phone1?: string;

  @ApiPropertyOptional({
    description: 'Second phone number',
    example: '+0987654321',
  })
  phone2?: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'contact@tawsyla.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Main Street, City, Country',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'New York',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'United States',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '10001',
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://tawsyla.com',
  })
  website?: string;

  @ApiPropertyOptional({
    description: 'Twitter profile link',
    example: 'https://twitter.com/tawsyla',
  })
  twitterLink?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile link',
    example: 'https://linkedin.com/company/tawsyla',
  })
  linkedinLink?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel link',
    example: 'https://youtube.com/c/tawsyla',
  })
  youtubeLink?: string;

  @ApiPropertyOptional({
    description: 'About us content',
    example: 'We are a leading e-commerce platform...',
  })
  aboutUs?: string;

  @ApiPropertyOptional({
    description: 'Terms and conditions',
    example: 'By using our service, you agree to...',
  })
  termsAndConditions?: string;

  @ApiPropertyOptional({
    description: 'Privacy policy',
    example: 'We respect your privacy and...',
  })
  privacyPolicy?: string;

  @ApiPropertyOptional({
    description: 'Refund policy',
    example: 'We offer 30-day refund policy...',
  })
  refundPolicy?: string;

  @ApiPropertyOptional({
    description: 'Shipping policy',
    example: 'We ship worldwide with...',
  })
  shippingPolicy?: string;

  @ApiProperty({
    description: 'Whether settings are active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
