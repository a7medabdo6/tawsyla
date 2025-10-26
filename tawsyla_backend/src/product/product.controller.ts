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
  Get,
  Post,
  Patch,
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
import { PaginationDto, PaginatedResponse } from './dto/pagination.dto';

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

  // New endpoints for dynamic categorization
  @Get('category/:category')
  async getProductsByCategory(
    @Param('category')
    category: 'top-selling' | 'trending' | 'recently-added' | 'top-rated',
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Product>> {
    return this.service.getProductsByCategory(category, paginationDto);
  }

  @Post(':id/view')
  async incrementViewCount(@Param('id') id: string): Promise<Product> {
    return this.service.incrementViewCount(id);
  }

  // Manual sales count increment disabled - sales are automatically tracked through orders
  // @Post(':id/sale')
  // @ApiBearerAuth()
  // @Roles(RoleEnum.admin, RoleEnum.user)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // async incrementSalesCount(@Param('id') id: string): Promise<Product> {
  //   return this.service.incrementSalesCount(id);
  // }

  // @Patch(':id/categories')
  // @ApiBearerAuth()
  // @Roles(RoleEnum.admin)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // async updateProductCategories(
  //   @Param('id') id: string,
  //   @Body() options?: {
  //     topSellingThreshold?: number;
  //     trendingViewThreshold?: number;
  //     trendingSalesThreshold?: number;
  //     recentlyAddedDays?: number;
  //     topRatedThreshold?: number;
  //   }
  // ): Promise<Product> {
  //   return this.service.updateProductCategories(id, options);
  // }
}
