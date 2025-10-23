import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  variantId: string;

  @ApiProperty()
  productNameEn: string;

  @ApiProperty()
  productNameAr: string;

  @ApiProperty()
  variantSize?: string;

  @ApiProperty()
  variantSizeUnit?: string;

  @ApiProperty()
  variantWeight?: number;

  @ApiProperty()
  variantWeightUnit?: string;

  @ApiProperty()
  variantEan: string;

  @ApiProperty()
  variantSku?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  createdAt: Date;
}

export class CartResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
