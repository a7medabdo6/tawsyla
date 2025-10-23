import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

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
}
