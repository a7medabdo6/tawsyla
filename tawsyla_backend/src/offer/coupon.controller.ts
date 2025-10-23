import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import {
  CouponResponseDto,
  CouponValidationResponseDto,
} from './dto/coupon-response.dto';
import { CouponStatus, CouponType } from './entities/coupon.entity';

@ApiTags('Coupons')
@Controller({
  path: 'coupons',
  version: '1',
})
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @Roles(RoleEnum.admin)
  @ApiOperation({
    summary: 'Get all coupons with pagination and filters (Admin only)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by coupon code',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CouponType,
    description: 'Filter by coupon type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CouponStatus,
    description: 'Filter by coupon status',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupons retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CouponResponseDto' },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
      },
    },
  })
  async getAllCoupons(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: CouponType,
    @Query('status') status?: CouponStatus,
  ): Promise<{
    data: CouponResponseDto[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const result = await this.couponService.getAllCoupons(
      page,
      limit,
      search,
      type,
      status,
    );

    return {
      data: result.data.map((coupon) => this.mapCouponToResponseDto(coupon)),
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  @Get('my-usage')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Get user coupon usage history' })
  @ApiResponse({
    status: 200,
    description: 'Coupon usage history retrieved successfully',
  })
  async getUserCouponUsage(@Request() req: any) {
    return this.couponService.getUserCouponUsage(req.user.id);
  }

  @Get(':id')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Get coupon by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Coupon retrieved successfully',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  async getCouponById(@Param('id') id: string): Promise<CouponResponseDto> {
    const coupon = await this.couponService.getCouponById(id);
    return this.mapCouponToResponseDto(coupon);
  }

  @Post()
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create new coupon (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Coupon code already exists',
  })
  async createCoupon(
    @Request() req: any,
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<CouponResponseDto> {
    const coupon = await this.couponService.createCoupon(
      createCouponDto,
      req.user.id,
    );
    return this.mapCouponToResponseDto(coupon);
  }

  @Put(':id')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update coupon (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Coupon updated successfully',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Coupon code already exists',
  })
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<CouponResponseDto> {
    const coupon = await this.couponService.updateCoupon(id, updateCouponDto);
    return this.mapCouponToResponseDto(coupon);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Delete coupon (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Coupon deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  async deleteCoupon(@Param('id') id: string): Promise<void> {
    await this.couponService.deleteCoupon(id);
  }

  @Post('validate')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Validate coupon code' })
  @ApiResponse({
    status: 200,
    description: 'Coupon validation result',
    type: CouponValidationResponseDto,
  })
  async validateCoupon(
    @Request() req: any,
    @Body() validateCouponDto: ValidateCouponDto,
  ): Promise<CouponValidationResponseDto> {
    return this.couponService.validateCoupon(validateCouponDto, req.user.id);
  }

  @Post('apply/:couponId')
  @Roles(RoleEnum.user)
  @ApiOperation({ summary: 'Apply coupon to order' })
  @ApiResponse({
    status: 201,
    description: 'Coupon applied successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid coupon or order amount',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  async applyCoupon(
    @Request() req: any,
    @Param('couponId') couponId: string,
    @Body() body: { orderAmount: number; orderId?: string },
  ) {
    return this.couponService.applyCoupon(
      couponId,
      req.user.id,
      body.orderAmount,
      body.orderId,
    );
  }

  @Post('update-expired')
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update expired coupons status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Expired coupons updated successfully',
  })
  async updateExpiredCoupons(): Promise<void> {
    await this.couponService.updateExpiredCoupons();
  }

  private mapCouponToResponseDto(coupon: any): CouponResponseDto {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      usageLimitPerUser: coupon.usageLimitPerUser,
      expiresAt: coupon.expiresAt,
      status: coupon.status,
      isActive: coupon.isActive,
      createdById: coupon.createdById,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
      usages: coupon?.usages,
    };
  }
}
