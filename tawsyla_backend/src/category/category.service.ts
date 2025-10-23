import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category> {
  constructor(
    @InjectRepository(Category)
    repo: Repository<Category>,
  ) {
    super(repo);
  }
  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.repo.create(dto);
    return this.repo.save(category);
  }

  async updateCustom(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(product, dto);
    return this.repo.save(product);
  }
}
