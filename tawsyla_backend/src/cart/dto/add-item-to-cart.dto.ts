import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class AddItemToCartDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Product variant ID to add to cart',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  variantId: string;

  @ApiProperty({
    description: 'Quantity of the product to add',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}
