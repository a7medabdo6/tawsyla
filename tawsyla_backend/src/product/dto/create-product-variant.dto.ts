import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { SizeUnit, WeightUnit } from '../entities/product-variant.entity';

export class CreateProductVariantDto {
  @ApiPropertyOptional({
    description: 'Id of variant',
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiPropertyOptional({
    description: 'Size of the product variant',
    example: 'M',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  size?: string;

  @ApiPropertyOptional({
    description: 'Size unit',
    enum: SizeUnit,
    example: SizeUnit.MEDIUM,
  })
  @IsOptional()
  @IsEnum(SizeUnit)
  sizeUnit?: SizeUnit;

  @ApiPropertyOptional({
    description: 'Weight of the product variant',
    example: 500.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Weight unit',
    enum: WeightUnit,
    example: WeightUnit.GRAM,
  })
  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @ApiProperty({
    description: 'EAN (European Article Number) code',
    example: '1234567890123',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  ean: string;

  @ApiProperty({
    description: 'Price of the product variant',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Stock quantity for this variant',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Is the variant active?',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'SKU (Stock Keeping Unit) code',
    example: 'PROD-001-M',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;
}
