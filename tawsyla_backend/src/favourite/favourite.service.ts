import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favourite } from './entities/favourite.entity';
import { Product } from '../product/entities/product.entity';
import { AddToFavouritesDto } from './dto/add-to-favourites.dto';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(Favourite)
    private favouriteRepository: Repository<Favourite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addToFavourites(
    userId: number,
    addToFavouritesDto: AddToFavouritesDto,
  ): Promise<Favourite> {
    const { productId } = addToFavouritesDto;

    // Check if product exists and is active
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    // Check if already in favourites
    const existingFavourite = await this.favouriteRepository.findOne({
      where: { userId, productId },
    });

    if (existingFavourite) {
      throw new ConflictException('Product is already in your favourites');
    }

    // Create new favourite
    const favourite = this.favouriteRepository.create({
      userId,
      productId,
    });

    return this.favouriteRepository.save(favourite);
  }

  async removeFromFavourites(userId: number, productId: string): Promise<void> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, productId },
    });

    if (!favourite) {
      throw new NotFoundException('Product not found in your favourites');
    }

    await this.favouriteRepository.remove(favourite);
  }

  async getUserFavourites(userId: number): Promise<Favourite[]> {
    return this.favouriteRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async isProductFavourited(
    userId: number,
    productId: string,
  ): Promise<boolean> {
    const favourite = await this.favouriteRepository.findOne({
      where: { userId, productId },
    });

    return !!favourite;
  }

  async getFavouritesCount(userId: number): Promise<number> {
    return this.favouriteRepository.count({
      where: { userId },
    });
  }
}
