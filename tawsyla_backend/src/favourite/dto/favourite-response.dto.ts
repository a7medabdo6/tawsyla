import { ApiProperty } from '@nestjs/swagger';

export class FavouriteProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameAr: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  descriptionEn?: string;

  @ApiProperty()
  descriptionAr?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  imageId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FavouriteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiProperty({ type: FavouriteProductDto })
  product: FavouriteProductDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
