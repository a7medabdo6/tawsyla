import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from '../../../../product/entities/product.entity';
import { ProductVariant, SizeUnit, WeightUnit } from '../../../../product/entities/product-variant.entity';
import { Company, CompanyType } from '../../../../company/entities/company.entity';
import { Category } from '../../../../category/entities/category.entity';
import { FileEntity } from '../../../../files/infrastructure/persistence/relational/entities/file.entity';
import simplifiedData from '../../../../../all-products';

@Injectable()
export class ProductSeedService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductVariant)
        private productVariantRepository: Repository<ProductVariant>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(FileEntity)
        private fileRepository: Repository<FileEntity>,
    ) { }

    async run() {
        console.log('Starting product seeding...');

        // Check if products are already seeded
        const existingProductsCount = await this.productRepository.count();
        // if (existingProductsCount > 0) {
        //     console.log(
        //         `Products already exist (${existingProductsCount} products found). Skipping product seeding to avoid duplicates.`,
        //     );
        //     return;
        // }

        // Get or create default company
        const defaultCompany = await this.getOrCreateDefaultCompany();

        // Get all categories for mapping
        const categories = await this.categoryRepository.find();
        const categoryMap = new Map<string, Category>();
        categories.forEach(category => {
            // Map by Arabic name for easier matching
            categoryMap.set(category.nameAr, category);
        });

        console.log(`Found ${categories.length} categories for product mapping`);

        // Get all files for image mapping
        const files = await this.fileRepository.find();
        const fileMap = new Map<string, FileEntity>();
        files.forEach(file => {
            // Extract product ID from filename (assuming format: {productId}_productname.jpg)
            const filename = file.path.split('/').pop() || '';
            const productId = filename.split('_')[0];
            if (productId && productId.match(/^\d+$/)) {
                fileMap.set(productId, file);
            }
        });

        console.log(`Found ${fileMap.size} product images for mapping`);

        let productsCreated = 0;
        let productsSkipped = 0;

        // Process products in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < simplifiedData.length; i += batchSize) {
            const batch = simplifiedData.slice(i, i + batchSize);

            for (const productData of batch) {
                try {
                    // Find matching category
                    const category = this.findMatchingCategory(productData.category, categoryMap);
                    if (!category) {
                        console.log(`No category found for product ${productData.id}: ${productData.name}`);
                        productsSkipped++;
                        continue;
                    }

                    // Find matching image
                    const imageFile = fileMap.get(productData.id);

                    // Create product
                    const product = this.productRepository.create({
                        nameEn: productData.name,
                        nameAr: productData.name, // Using same name for both languages
                        type: ProductType.FOOD, // Default to FOOD type
                        descriptionEn: `Product: ${productData.name}`,
                        descriptionAr: `منتج: ${productData.name}`,
                        isActive: true,
                        rating: 0,
                        companyId: defaultCompany.id,
                        categoryId: category.id,
                        image: imageFile || null,
                    });

                    const savedProduct = await this.productRepository.save(product);

                    // Create product variant
                    const variant = this.productVariantRepository.create({
                        productId: savedProduct.id,
                        ean: productData.id, // Using product ID as EAN
                        price: productData.price.price,
                        stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
                        isActive: true,
                        sku: `SKU-${productData.id}`,
                    });

                    await this.productVariantRepository.save(variant);
                    productsCreated++;

                } catch (error) {
                    console.error(`Error creating product ${productData.id}:`, error.message);
                    productsSkipped++;
                }
            }

            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(simplifiedData.length / batchSize)}`);
        }

        console.log(`Successfully created ${productsCreated} products`);
        console.log(`Skipped ${productsSkipped} products due to errors or missing data`);
    }

    private async getOrCreateDefaultCompany(): Promise<Company> {
        let company = await this.companyRepository.findOne({
            where: { nameEn: 'Default Store' }
        });

        if (!company) {
            company = this.companyRepository.create({
                nameEn: 'Default Store',
                nameAr: 'المتجر الافتراضي',
                type: CompanyType.GENERAL_STORE,
                descriptionEn: 'Default company for seeded products',
                descriptionAr: 'شركة افتراضية للمنتجات المزروعة',
                isActive: true,
                isVerified: true,
                rating: 4.5,
                totalOrders: 0,
                userId: "1", // Dummy user ID
            });

            company = await this.companyRepository.save(company);
            console.log('Created default company for products');
        }

        return company;
    }

    private findMatchingCategory(productCategory: any, categoryMap: Map<string, Category>): Category | null {
        // Try to find category by level1 name
        if (productCategory.level1 && categoryMap.has(productCategory.level1)) {
            return categoryMap.get(productCategory.level1)!;
        }

        // Try to find category by level2 name
        if (productCategory.level2 && categoryMap.has(productCategory.level2)) {
            return categoryMap.get(productCategory.level2)!;
        }

        // Try to find category by level3 name
        if (productCategory.level3 && categoryMap.has(productCategory.level3)) {
            return categoryMap.get(productCategory.level3)!;
        }

        // Try to find by full path
        if (productCategory.fullPath) {
            const pathParts = productCategory.fullPath.split(' > ');
            for (const part of pathParts) {
                if (categoryMap.has(part)) {
                    return categoryMap.get(part)!;
                }
            }
        }

        return null;
    }
}
