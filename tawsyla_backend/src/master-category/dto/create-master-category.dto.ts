import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateMasterCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'إلكترونيات' })
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @ApiPropertyOptional({ example: 'Description in English' })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'الوصف بالعربية' })
  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
