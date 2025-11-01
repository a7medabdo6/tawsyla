import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MasterCategory } from '../master-category/entities/master-category.entity';

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category> {
  constructor(
    @InjectRepository(Category)
    repo: Repository<Category>,
    @InjectRepository(MasterCategory)
    private readonly masterCategoryRepository: Repository<MasterCategory>,
  ) {
    super(repo);
  }
  async create(dto: CreateCategoryDto): Promise<Category> {
    const { masterCategoryId, ...categoryData } = dto;
    const category = this.repo.create(categoryData);
    
    if (masterCategoryId) {
      const masterCategory = await this.masterCategoryRepository.findOne({
        where: { id: masterCategoryId }
      });
      
      if (!masterCategory) {
        throw new NotFoundException(`Master category with ID "${masterCategoryId}" not found`);
      }
      
      category.masterCategory = masterCategory;
    }
    
    return this.repo.save(category);
  }

  async updateCustom(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const { masterCategoryId, ...updateData } = dto;
    const category = await this.repo.findOne({ 
      where: { id },
      relations: ['masterCategory']
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    // Update master category if provided
    if (masterCategoryId !== undefined) {
      if (masterCategoryId === null) {
        // If null is provided, remove the master category
        // category.masterCategory = null;
      } else {
        // Find and set the new master category
        const masterCategory = await this.masterCategoryRepository.findOne({
          where: { id: masterCategoryId }
        });
        
        if (!masterCategory) {
          throw new NotFoundException(`Master category with ID "${masterCategoryId}" not found`);
        }
        
        category.masterCategory = masterCategory;
      }
    }
    
    // Update other fields
    Object.assign(category, updateData);
    
    return this.repo.save(category);
  }
}
