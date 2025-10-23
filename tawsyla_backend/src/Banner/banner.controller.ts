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
import { Banner } from './entities/banner.entity';
import { BannerService } from './banner.service';
import { CreateBanneryDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';

@Crud({
  model: { type: Banner },
  dto: {
    create: CreateBanneryDto,
    update: UpdateBannerDto,
    replace: UpdateBannerDto,
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
@Controller('banners')
export class BannerController implements CrudController<Banner> {
  constructor(public service: BannerService) {}

  @Override()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async createOne(@Request() req: CrudRequest, @Body() dto: CreateBanneryDto) {
    return this.service.create(dto);
  }

  @Override('replaceOneBase')
  @Put(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateOne(
    @Request() req: CrudRequest,
    @Body() dto: UpdateBannerDto,
    @Param('id') id: string,
  ): Promise<Banner> {
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
