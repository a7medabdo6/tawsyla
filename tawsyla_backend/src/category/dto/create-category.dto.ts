import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
  IsInt,
} from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name in English',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'Category name in Arabic',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({ description: 'Category descriptionEn' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Category descriptionAr' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Image file ID for the category',
    example: 'uuid-of-image',
  })
  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  image?: FileDto | null;

  // @ApiPropertyOptional({
  //   description: 'Parent category ID for hierarchical structure',
  // })
  // @IsOptional()
  // @IsUUID()
  // parentId?: string;

  // @ApiPropertyOptional({
  //   description: 'Category level in hierarchy (1, 2, 3, etc.)',
  // })
  // @IsOptional()
  // @IsInt()
  // level?: number;

  @ApiPropertyOptional({
    description: 'Master category ID that this category belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  masterCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Full path of the category (e.g., "Food > Dairy > Milk")',
  })
  @IsOptional()
  @IsString()
  fullPath?: string;
}
