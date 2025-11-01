import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterCategory } from './entities/master-category.entity';
import { CreateMasterCategoryDto } from './dto/create-master-category.dto';
import { UpdateMasterCategoryDto } from './dto/update-master-category.dto';
import { MasterCategoryResponseDto } from './dto/master-category-response.dto';

@Injectable()
export class MasterCategoryService {
  constructor(
    @InjectRepository(MasterCategory)
    private readonly masterCategoryRepository: Repository<MasterCategory>,
  ) {}

  async create(
    createMasterCategoryDto: CreateMasterCategoryDto,
  ): Promise<MasterCategoryResponseDto> {
    const masterCategory = this.masterCategoryRepository.create(
      createMasterCategoryDto,
    );
    const savedMasterCategory =
      await this.masterCategoryRepository.save(masterCategory);
    return this.mapToResponseDto(savedMasterCategory);
  }

  async findAll(): Promise<MasterCategoryResponseDto[]> {
    const masterCategories = await this.masterCategoryRepository.find({
      order: { nameEn: 'ASC' },
    });
    return masterCategories.map((category) => this.mapToResponseDto(category));
  }

  async findOne(id: string): Promise<MasterCategoryResponseDto> {
    const masterCategory = await this.masterCategoryRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!masterCategory) {
      throw new NotFoundException(`Master category with ID "${id}" not found`);
    }

    return this.mapToResponseDto(masterCategory);
  }

  async update(
    id: string,
    updateMasterCategoryDto: UpdateMasterCategoryDto,
  ): Promise<MasterCategoryResponseDto> {
    const masterCategory = await this.masterCategoryRepository.preload({
      id,
      ...updateMasterCategoryDto,
    });

    if (!masterCategory) {
      throw new NotFoundException(`Master category with ID "${id}" not found`);
    }

    const updatedMasterCategory =
      await this.masterCategoryRepository.save(masterCategory);
    return this.mapToResponseDto(updatedMasterCategory);
  }

  async remove(id: string): Promise<void> {
    const result = await this.masterCategoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Master category with ID "${id}" not found`);
    }
  }

  private mapToResponseDto(
    masterCategory: MasterCategory,
  ): MasterCategoryResponseDto {
    const {
      id,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      isActive,
      image,
      createdAt,
      updatedAt,
    } = masterCategory;
    return {
      id,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      imageId: image?.id || null,
      isActive,
      createdAt,
      updatedAt,
    };
  }
}
