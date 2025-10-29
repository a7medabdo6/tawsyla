import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.user)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  async getCart(@Request() req: any): Promise<CartResponseDto> {
    const cart = await this.cartService.getCart(req.user.id);
    return this.mapCartToResponseDto(cart);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient stock or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addItemToCart(
    @Request() req: any,
    @Body() addItemDto: AddItemToCartDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.addItemToCart(req.user.id, addItemDto);
    return this.mapCartToResponseDto(cart);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient stock or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async updateCartItem(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.updateCartItem(
      req.user.id,
      itemId,
      updateDto,
    );
    return this.mapCartToResponseDto(cart);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 204,
    description: 'Item removed from cart successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async removeItemFromCart(
    @Request() req: any,
    @Param('itemId') itemId: string,
  ): Promise<any> {
    return await this.cartService.removeItemFromCart(req.user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({
    status: 204,
    description: 'Cart cleared successfully',
  })
  async clearCart(@Request() req: any): Promise<any> {
    return await this.cartService.clearCart(req.user.id);
  }

  private mapCartToResponseDto(cart: any): CartResponseDto {
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productNameEn: item.product?.nameEn || '',
        productNameAr: item.product?.nameAr || '',
        variantSize: item.variant?.size,
        variantSizeUnit: item.variant?.sizeUnit,
        variantWeight: item.variant?.weight,
        variantWeightUnit: item.variant?.weightUnit,
        variantEan: item.variant?.ean || '',
        variantSku: item.variant?.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        createdAt: item.createdAt,
        image: item.product?.image ? item.product.image : null,
      })),
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      isActive: cart.isActive,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
