import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';

export class CreateBanneryDto {
  @ApiProperty({
    description: 'banner name in English',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameEn: string;

  @ApiProperty({
    description: 'banner name in Arabic',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Image file ID for the banner',
    example: 'uuid-of-image',
  })
  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  image?: FileDto | null;
}
