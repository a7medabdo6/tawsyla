import {
  Body,
  Controller,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override } from '@nestjsx/crud';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';

@Crud({
  model: { type: Category },
  dto: {
    create: CreateCategoryDto,
    update: UpdateCategoryDto,
    replace: UpdateCategoryDto,
  },
  params: {
    id: {
      type: 'uuid',
      primary: true,
      field: 'id',
    },
  },
  routes: {
    exclude: ['createManyBase', 'updateOneBase'],
  },
  query: {
    join: {
      image: {
        eager: true,
      },
    },
  },
})
@Controller('categories')
export class CategoryController implements CrudController<Category> {
  constructor(public service: CategoryService) {}

  @Override()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async createOne(@Request() req: CrudRequest, @Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Override('replaceOneBase')
  @Put(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateOne(
    @Request() req: CrudRequest,
    @Body() dto: UpdateCategoryDto,
    @Param('id') id: string,
  ): Promise<Category> {
    return this.service.updateCustom(id, dto);
  }

  @Override()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async replaceOneBase(...args: any[]) {
    return await (this as any).base.replaceOneBase(...args);
  }

  @Override()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteOneBase(...args: any[]) {
    return await (this as any).base.deleteOneBase(...args);
  }
}
