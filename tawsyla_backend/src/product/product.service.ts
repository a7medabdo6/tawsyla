import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto, PaginatedResponse } from './dto/pagination.dto';

@Injectable()
export class ProductService extends TypeOrmCrudService<Product> {
  constructor(
    @InjectRepository(Product)
    repo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
  ) {
    super(repo);
  }

  async updateCustom(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Update product fields (excluding variants)
    const { variants, ...productData } = dto;
    Object.assign(product, productData);

    // Handle variants if provided
    if (variants) {
      const existingVariants = product.variants || [];
      const finalVariants: ProductVariant[] = [];

      for (const variantDto of variants) {
        if (variantDto.id) {
          // Update existing variant
          const existingVariant = existingVariants.find(
            (v) => v.id === variantDto.id,
          );
          if (existingVariant) {
            // Update the existing variant
            Object.assign(existingVariant, variantDto);
            finalVariants.push(existingVariant);
          }
        } else {
          // Create new variant
          console.log(id, 'product?.idproduct?.id');

          const newVariant = this.variantRepo.create({
            ...variantDto,
            productId: id,
          });
          finalVariants.push(newVariant);
        }
      }

      // Remove variants that are no longer in the list
      const newVariantIds = variants.map((v) => v.id).filter((id) => id);
      const variantsToRemove = existingVariants.filter(
        (v) => !newVariantIds.includes(v.id),
      );

      if (variantsToRemove.length > 0) {
        await this.variantRepo.remove(variantsToRemove);
      }

      // Save all variants (both updated and new)
      const savedVariants = await this.variantRepo.save(finalVariants);

      product.variants = savedVariants;
    }
    console.log(product, 'finalVariantssss');

    return this.repo.save(product);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const { variants, ...productData } = dto;

    // Create the product first
    const product = this.repo.create(productData);
    const savedProduct = await this.repo.save(product);

    // Create variants if provided
    if (variants && variants.length > 0) {
      const productVariants = variants.map((variantData) =>
        this.variantRepo.create({
          ...variantData,
          productId: savedProduct.id,
        }),
      );
      await this.variantRepo.save(productVariants);
    }

    const result = await this.repo.findOne({
      where: { id: savedProduct.id },
      relations: ['variants'],
    });

    if (!result) {
      throw new NotFoundException('Product not found after creation');
    }

    return result;
  }

  async delete(id: string): Promise<any> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return await this.repo.remove(product);
  }

  // Methods for handling dynamic categorization
  // async updateProductCategories(
  //   id: string,
  //   options?: {
  //     topSellingThreshold?: number;
  //     trendingViewThreshold?: number;
  //     trendingSalesThreshold?: number;
  //     recentlyAddedDays?: number;
  //     topRatedThreshold?: number;
  //   }
  // ): Promise<Product> {
  //   const product = await this.repo.findOne({ where: { id } });
  //   if (!product) {
  //     throw new NotFoundException('Product not found');
  //   }

  //   product.updateAllCategories(options);
  //   return this.repo.save(product);
  // }

  // Bulk update all products categories - disabled for normal operations
  // Only needed for initial setup, threshold changes, or maintenance
  // async updateAllProductsCategories(options?: {
  //   topSellingThreshold?: number;
  //   trendingViewThreshold?: number;
  //   trendingSalesThreshold?: number;
  //   recentlyAddedDays?: number;
  //   topRatedThreshold?: number;
  // }): Promise<void> {
  //   const products = await this.repo.find();
  //
  //   for (const product of products) {
  //     product.updateAllCategories(options);
  //   }
  //
  //   await this.repo.save(products);
  // }

  async incrementSalesCount(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.salesCount += 1;
    product.updateTopSelling();
    product.updateTrending();

    return this.repo.save(product);
  }

  async incrementViewCount(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.viewCount += 1;
    product.updateTrending();

    return this.repo.save(product);
  }

  async getProductsByCategory(
    category: 'top-selling' | 'trending' | 'recently-added' | 'top-rated',
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Product>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const whereCondition: any = { isActive: true };

    switch (category) {
      case 'top-selling':
        whereCondition.isTopSelling = true;
        break;
      case 'trending':
        whereCondition.isTrending = true;
        break;
      case 'recently-added':
        whereCondition.isRecentlyAdded = true;
        break;
      case 'top-rated':
        whereCondition.isTopRated = true;
        break;
    }

    // Define allowed sort fields for security
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'nameEn',
      'nameAr',
      'rating',
      'salesCount',
      'viewCount',
    ];

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = { [sortField]: sortOrder };

    // Add category-specific default sorting
    if (category === 'top-selling') {
      order['salesCount'] = 'DESC';
    } else if (category === 'trending') {
      order['viewCount'] = 'DESC';
      order['salesCount'] = 'DESC';
    } else if (category === 'top-rated') {
      order['rating'] = 'DESC';
    }

    const [data, total] = await this.repo.findAndCount({
      where: whereCondition,
      relations: ['company', 'category', 'variants', 'image'],
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
