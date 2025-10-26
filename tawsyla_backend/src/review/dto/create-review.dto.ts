import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Product ID to review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Rating from 1.0 to 5.0',
    minimum: 1.0,
    maximum: 5.0,
    example: 4.5,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(5.0)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review title',
    maxLength: 100,
    example: 'Great product!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'This product exceeded my expectations. Highly recommended!',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
