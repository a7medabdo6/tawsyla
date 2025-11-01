import { PartialType } from '@nestjs/swagger';
import { CreateMasterCategoryDto } from './create-master-category.dto';

export class UpdateMasterCategoryDto extends PartialType(
  CreateMasterCategoryDto,
) {}
