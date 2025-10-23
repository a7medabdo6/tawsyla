// company/company.controller.ts
import {
  Controller,
  UseGuards,
  Request,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  HttpStatus,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  Crud,
  CrudController,
  CrudRequest,
  CrudRequestInterceptor,
  Override,
} from '@nestjsx/crud';
import { Company } from './entities/company.entity';
import { CompanyResponseDto, CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { companyCrudConfig } from './config/company-crud.config';

@Crud(companyCrudConfig)
@ApiTags('Companies')
@Controller('companies')
export class CompanyController implements CrudController<Company> {
  constructor(public service: CompanyService) {}

  get base(): CrudController<Company> {
    return this;
  }

  // Override create to add user context
  @Override()
  async createOne(
    @Request() req: CrudRequest,
    @Body() dto: CreateCompanyDto,
    @Request() request: any,
  ): Promise<Company> {
    const userId = request?.user?.id;
    return this.service.createCompanyForUser(dto, userId);
  }

  // Override update to ensure ownership
  @Override()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  async updateOne(
    @Request() req: CrudRequest,
    @Body() dto: UpdateCompanyDto,
    @Request() request: any,
  ): Promise<Company> {
    const userId = request.user.id;
    return this.service.updateUserCompany(req, dto, userId);
  }

  // Override delete to ensure ownership
  @Override()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  async deleteOne(
    @Request() req: CrudRequest,
    @Request() request: any,
  ): Promise<void> {
    const userId = request.user.id;
    return this.service.deleteUserCompany(req, userId);
  }

  // Custom endpoint: Get current user's company
  @Get('my-company')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user company',
    description: 'Get the company of the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User company retrieved successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User has no company',
  })
  async getMyCompany(@Request() request: any): Promise<Company> {
    const userId = request.user.id;
    return this.service.findUserCompany(userId);
  }

  // Custom endpoint: Toggle company activation
  @Put(':id/toggle-active')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle company active status',
    description: 'Activate or deactivate a company',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company status updated successfully',
    type: CompanyResponseDto,
  })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: any,
  ): Promise<Company> {
    const userId = request.user.id;
    return this.service.toggleCompanyActive(id, userId);
  }

  // Custom endpoint: Get companies by type
  @Get('by-type/:type')
  @UseInterceptors(CrudRequestInterceptor)
  @ApiOperation({
    summary: 'Get companies by type',
    description: 'Retrieve companies filtered by business type',
  })
  @ApiParam({
    name: 'type',
    enum: [
      'restaurant',
      'grocery',
      'pharmacy',
      'electronics',
      'clothing',
      'general_store',
      'other',
    ],
    description: 'Company type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Companies retrieved successfully',
    type: [CompanyResponseDto],
  })
  async getCompaniesByType(
    @Param('type') type: string,
    @Request() req: CrudRequest,
  ): Promise<Company[]> {
    return this.service.findCompaniesByType(req, type);
  }

  // Custom endpoint: Get nearby companies
  @Get('nearby')
  @UseInterceptors(CrudRequestInterceptor)
  @ApiOperation({
    summary: 'Get nearby companies',
    description:
      'Get companies within a certain radius based on latitude and longitude',
  })
  @ApiQuery({
    name: 'lat',
    type: Number,
    description: 'Latitude coordinate',
    required: true,
    example: 40.7128,
  })
  @ApiQuery({
    name: 'lng',
    type: Number,
    description: 'Longitude coordinate',
    required: true,
    example: -74.006,
  })
  @ApiQuery({
    name: 'radius',
    type: Number,
    description: 'Search radius in kilometers',
    required: false,
    example: 10,
    default: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nearby companies retrieved successfully',
    type: [CompanyResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Latitude and longitude are required',
  })
  async getNearbyCompanies(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 10,
  ): Promise<CompanyResponseDto[]> {
    return this.service.findNearbyCompanies(lat, lng, radius);
  }
}
