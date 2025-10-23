import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductSeedService } from './product-seed.service';
import { Product } from '../../../../product/entities/product.entity';
import { ProductVariant } from '../../../../product/entities/product-variant.entity';
import { Company } from '../../../../company/entities/company.entity';
import { Category } from '../../../../category/entities/category.entity';
import { FileEntity } from '../../../../files/infrastructure/persistence/relational/entities/file.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            ProductVariant,
            Company,
            Category,
            FileEntity,
        ]),
    ],
    providers: [ProductSeedService],
    exports: [ProductSeedService],
})
export class ProductSeedModule { }
