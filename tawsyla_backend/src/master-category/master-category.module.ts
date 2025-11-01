import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCategory } from './entities/master-category.entity';
import { MasterCategoryService } from './master-category.service';
import { MasterCategoryController } from './master-category.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCategory]), FilesModule],
  controllers: [MasterCategoryController],
  providers: [MasterCategoryService],
  exports: [MasterCategoryService],
})
export class MasterCategoryModule {}
