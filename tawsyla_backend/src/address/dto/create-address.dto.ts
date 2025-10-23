import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: 'Near the park, second floor',
  })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @ApiPropertyOptional({
    description: 'Set as default address',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
