import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name in English',
    example: 'Pizza Palace',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Company name in Arabic',
    example: 'قصر البيتزا',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameAr: string;

  @ApiProperty({
    description: 'Type of company business',
    enum: CompanyType,
    example: CompanyType.RESTAURANT,
  })
  @IsEnum(CompanyType)
  type: CompanyType;

  @ApiPropertyOptional({
    description: 'Company description in English',
    example: 'Best pizza in town with fresh ingredients',
  })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Company description in Arabic',
    example: 'أفضل بيتزا في المدينة بمكونات طازجة',
  })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Company phone number',
    example: '+201234567890',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[0-9\s\-\(\)]+$/, {
    message: 'Phone number must be valid',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company email address',
    example: 'info@pizzapalace.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Company address in English',
    example: '123 Main Street, Downtown',
  })
  @IsOptional()
  @IsString()
  addressEn?: string;

  @ApiPropertyOptional({
    description: 'Company address in Arabic',
    example: '123 شارع الرئيسي، وسط المدينة',
  })
  @IsOptional()
  @IsString()
  addressAr?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 30.0444196,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: 31.2357116,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Opening time in HH:MM format',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format',
  })
  openingTime?: string;

  @ApiPropertyOptional({
    description: 'Closing time in HH:MM format',
    example: '22:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Closing time must be in HH:MM format',
  })
  closingTime?: string;
}

export class CompanyResponseDto {
  @ApiProperty({
    description: 'Company unique identifier',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Company name in English',
    example: 'Pizza Palace',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Company name in Arabic',
    example: 'قصر البيتزا',
  })
  nameAr: string;

  @ApiProperty({
    description: 'Company type',
    enum: CompanyType,
    example: CompanyType.RESTAURANT,
  })
  type: CompanyType;

  @ApiPropertyOptional({
    description: 'Company description in English',
  })
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Company description in Arabic',
  })
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Company phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company email',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Company address in English',
  })
  addressEn?: string;

  @ApiPropertyOptional({
    description: 'Company address in Arabic',
  })
  addressAr?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
  })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
  })
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Company logo URL',
  })
  logo?: string;

  @ApiProperty({
    description: 'Whether company is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether company is verified',
    example: false,
  })
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'Opening time',
  })
  openingTime?: string;

  @ApiPropertyOptional({
    description: 'Closing time',
  })
  closingTime?: string;

  @ApiProperty({
    description: 'Company rating',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Total orders count',
    example: 150,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Owner user ID',
    example: 'user-uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class CompanyQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by company type',
    enum: CompanyType,
  })
  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by verified status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Search by company name',
    example: 'Pizza',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
