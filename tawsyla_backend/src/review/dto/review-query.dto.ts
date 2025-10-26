import { IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../product/dto/pagination.dto';

export class ReviewQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum rating',
    minimum: 1.0,
    maximum: 5.0,
    example: 4.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(5.0)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum rating',
    minimum: 1.0,
    maximum: 5.0,
    example: 5.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(5.0)
  maxRating?: number;

  @ApiPropertyOptional({
    description: 'Filter by verified purchase only',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  verifiedPurchaseOnly?: boolean;
}
