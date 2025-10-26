import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiPropertyOptional({
    description: 'Rating from 1.0 to 5.0',
    minimum: 1.0,
    maximum: 5.0,
    example: 4.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(5.0)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review title',
    maxLength: 100,
    example: 'Updated review title',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'Updated review comment',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
