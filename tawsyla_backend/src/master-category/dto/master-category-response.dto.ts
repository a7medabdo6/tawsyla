import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MasterCategoryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  nameEn: string;

  @ApiProperty({ example: 'إلكترونيات' })
  nameAr: string;

  @ApiPropertyOptional({ example: 'Description in English' })
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'الوصف بالعربية' })
  descriptionAr?: string;

  @ApiPropertyOptional({ type: 'string', format: 'uuid', nullable: true })
  imageId?: string | null;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
