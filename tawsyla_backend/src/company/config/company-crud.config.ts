// company/config/company-crud.config.ts
import { UseGuards, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrudOptions } from '@nestjsx/crud';
import { CrudRequestInterceptor } from '@nestjsx/crud';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../roles/roles.guard';
import { Company } from '../entities/company.entity';
import {
  CreateCompanyDto,
  CompanyResponseDto,
} from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';

export const companyCrudConfig: CrudOptions = {
  model: {
    type: Company,
  },
  dto: {
    create: CreateCompanyDto,
    update: UpdateCompanyDto,
    replace: UpdateCompanyDto,
  },
  params: {
    id: {
      type: 'uuid',
      primary: true,
      field: 'id',
    },
  },
  query: {
    join: {
      user: {
        eager: true,
        exclude: ['password'], // Exclude sensitive fields
      },
    },
    limit: 25,
    maxLimit: 100,
    alwaysPaginate: true,
  },
  routes: {
    exclude: ['createManyBase'], // Disable bulk create since one user = one company
    createOneBase: {
      decorators: [
        UseGuards(AuthGuard('jwt'), RolesGuard),
        ApiBearerAuth(),
        ApiOperation({
          summary: 'Create a new company',
          description: 'Create a company for the authenticated user (trader)',
        }),
        ApiResponse({
          status: HttpStatus.CREATED,
          description: 'Company created successfully',
          type: CompanyResponseDto,
        }),
        ApiResponse({
          status: HttpStatus.BAD_REQUEST,
          description: 'Invalid input data',
        }),
        ApiResponse({
          status: HttpStatus.CONFLICT,
          description: 'User already has a company',
        }),
      ],
    },
    getOneBase: {
      decorators: [
        ApiOperation({
          summary: 'Get company by ID',
          description: 'Retrieve a specific company by its ID',
        }),
        ApiResponse({
          status: HttpStatus.OK,
          description: 'Company retrieved successfully',
          type: CompanyResponseDto,
        }),
        ApiResponse({
          status: HttpStatus.NOT_FOUND,
          description: 'Company not found',
        }),
      ],
    },
    getManyBase: {
      decorators: [
        UseInterceptors(CrudRequestInterceptor),
        ApiOperation({
          summary: 'Get all companies',
          description: 'Retrieve companies with filtering and pagination',
        }),
        ApiResponse({
          status: HttpStatus.OK,
          description: 'Companies retrieved successfully',
          type: [CompanyResponseDto],
        }),
      ],
    },
    updateOneBase: {
      decorators: [
        UseGuards(AuthGuard('jwt'), RolesGuard),
        ApiBearerAuth(),
        ApiOperation({
          summary: 'Update company',
          description: 'Update company details (only owner can update)',
        }),
        ApiResponse({
          status: HttpStatus.OK,
          description: 'Company updated successfully',
          type: CompanyResponseDto,
        }),
        ApiResponse({
          status: HttpStatus.NOT_FOUND,
          description: 'Company not found',
        }),
        ApiResponse({
          status: HttpStatus.FORBIDDEN,
          description: 'Not authorized to update this company',
        }),
      ],
    },
    deleteOneBase: {
      decorators: [
        UseGuards(AuthGuard('jwt'), RolesGuard),
        ApiBearerAuth(),
        ApiOperation({
          summary: 'Delete company',
          description: 'Delete company (only owner can delete)',
        }),
        ApiResponse({
          status: HttpStatus.NO_CONTENT,
          description: 'Company deleted successfully',
        }),
        ApiResponse({
          status: HttpStatus.NOT_FOUND,
          description: 'Company not found',
        }),
        ApiResponse({
          status: HttpStatus.FORBIDDEN,
          description: 'Not authorized to delete this company',
        }),
      ],
    },
  },
};
