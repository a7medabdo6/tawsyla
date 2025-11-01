import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MasterCategory } from '../master-category/entities/master-category.entity';
import { MasterCategoryModule } from '../master-category/master-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, MasterCategory]),
    MasterCategoryModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [TypeOrmModule, CategoryService],
})
export class CategoryModule {}
