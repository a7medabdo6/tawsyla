import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '../entities/product.entity';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { FileDto } from '../../files/dto/file.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name in English',
    example: 'iPhone 15',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Product name in Arabic',
    example: 'آيفون 15',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameAr: string;

  @ApiProperty({
    description: 'Type of product',
    enum: ProductType,
    example: ProductType.ELECTRONICS,
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({
    description: 'Product description in English',
    example: 'Latest Apple smartphone with advanced features',
  })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Product description in Arabic',
    example: 'أحدث هاتف من أبل بميزات متقدمة',
  })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Is the product active?',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Product rating',
    example: 4.5,
    minimum: 0,
    maximum: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Company ID this product belongs to',
    example: 'uuid-of-company',
  })
  @IsUUID()
  companyId: string;

  @ApiPropertyOptional({
    description: 'Image file ID for the product',
    example: 'uuid-of-image',
  })
  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  image?: FileDto | null;

  @ApiProperty({
    description: 'Category ID this product belongs to',
    example: 'uuid-of-category',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Product variants',
    type: [CreateProductVariantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
