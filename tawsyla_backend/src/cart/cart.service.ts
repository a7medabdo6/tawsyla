import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
        isActive: true,
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItemToCart(
    userId: number,
    addItemDto: AddItemToCartDto,
  ): Promise<Cart> {
    const { productId, variantId, quantity } = addItemDto;

    // Check if product exists and is active
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    // Find the specific variant
    const variant = product.variants.find(
      (v) => v.id === variantId && v.isActive,
    );
    if (!variant) {
      throw new NotFoundException('Product variant not found or not available');
    }

    // Check stock availability
    if (variant.stock < quantity) {
      throw new BadRequestException(
        'Insufficient stock available for this variant',
      );
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart (same product and variant)
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.variantId === variantId,
    );

    if (existingItem) {
      // Update existing item quantity
      existingItem.quantity = quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        unitPrice: variant.price,
        totalPrice: variant.price * quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    // Recalculate cart totals
    await this.recalculateCartTotals(cart.id);

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(
    userId: number,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const { quantity } = updateDto;

    const cart = await this.getOrCreateCart(userId);
    const cartItem = cart.items.find((item) => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock availability
    const variant = await this.variantRepository.findOne({
      where: { id: cartItem.variantId },
    });

    if (variant && variant.stock < quantity) {
      throw new BadRequestException(
        'Insufficient stock available for this variant',
      );
    }

    // Update item quantity
    cartItem.quantity = quantity;
    cartItem.totalPrice = quantity * cartItem.unitPrice;
    await this.cartItemRepository.save(cartItem);

    // Recalculate cart totals
    await this.recalculateCartTotals(cart.id);

    return this.getOrCreateCart(userId);
  }

  async removeItemFromCart(userId: number, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = cart.items.find((item) => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    // Recalculate cart totals
    await this.recalculateCartTotals(cart.id);

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    await this.cartItemRepository.delete({ cartId: cart.id });

    // Reset cart totals
    cart.totalAmount = 0;
    cart.totalItems = 0;
    await this.cartRepository.save(cart);

    return this.getOrCreateCart(userId);
  }

  async getCart(userId: number): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  private async recalculateCartTotals(cartId: string): Promise<void> {
    const cartItems = await this.cartItemRepository.find({
      where: { cartId },
    });

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    await this.cartRepository.update(cartId, {
      totalAmount,
      totalItems,
    });
  }
}
