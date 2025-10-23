import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBanneryDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService extends TypeOrmCrudService<Banner> {
  constructor(
    @InjectRepository(Banner)
    repo: Repository<Banner>,
  ) {
    super(repo);
  }
  async create(dto: CreateBanneryDto): Promise<Banner> {
    const category = this.repo.create(dto);
    return this.repo.save(category);
  }

  async updateCustom(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(product, dto);
    return this.repo.save(product);
  }
}
