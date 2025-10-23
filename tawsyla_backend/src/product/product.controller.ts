import {
  Controller,
  UseGuards,
  Request,
  Body,
  ForbiddenException,
  NotFoundException,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override } from '@nestjsx/crud';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { productCrudConfig } from './config/product-crud.config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Crud(productCrudConfig)
@Controller('products')
export class ProductController implements CrudController<Product> {
  constructor(public service: ProductService) {}

  get base(): CrudController<Product> {
    return this;
  }

  @Override('createOneBase')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(
    @Request() req: CrudRequest,
    @Body() dto: CreateProductDto,
    @Request() request: any,
  ): Promise<Product> {
    const user = request.user;
    if (user.role?.id === RoleEnum.admin) {
      return this.service.create(dto);
    }

    if (!user.company || user.company.id !== dto.companyId) {
      throw new ForbiddenException(
        'You can only create products for your own company',
      );
    }
    return this.service.create(dto);
  }

  @Override('replaceOneBase')
  @Put(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateOne(
    @Request() req: CrudRequest,
    @Body() dto: UpdateProductDto,
    @Request() request: any,
    @Param('id') id: string,
  ): Promise<Product> {
    const user = request.user;
    if (user.role?.id === RoleEnum.admin) {
      return this.service.updateCustom(id, dto);
    }
    const product = await this.service.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!user.company || user.company.id !== product.companyId) {
      throw new ForbiddenException(
        'You can only update products for your own company',
      );
    }
    return this.service.updateCustom(id, dto);
  }

  @Override('deleteOneBase')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.user)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async deleteOne(
    @Request() req: CrudRequest,
    @Request() request: any,
    @Param('id') id: string,
  ): Promise<any> {
    const user = request.user;
    if (user.role?.id === RoleEnum.admin) {
      return await this.service.delete(id);
    }
    const product = await this.service.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!user.company || user.company.id !== product.companyId) {
      throw new ForbiddenException(
        'You can only delete products for your own company',
      );
    }
    return await this.service.delete(id);
  }
}
