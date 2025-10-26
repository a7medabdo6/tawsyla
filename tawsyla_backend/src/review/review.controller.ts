import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.user, RoleEnum.admin)
  @ApiOperation({
    summary: 'Create a new review',
    description:
      'Create a review for a product. Users can only have one review per product.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Review created successfully and product rating updated automatically.',
  })
  @ApiResponse({
    status: 409,
    description: 'User has already reviewed this product.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
    return this.reviewService.create(createReviewDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reviews with pagination and filters',
    description:
      'Retrieve reviews with optional filtering by product, user, rating range, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully with pagination metadata.',
  })
  async findAll(@Query() queryDto: ReviewQueryDto) {
    return this.reviewService.findAll(queryDto);
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get reviews for a specific product',
    description: 'Retrieve all reviews for a specific product with pagination.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product reviews retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async findByProduct(
    @Param('productId') productId: string,
    @Query() queryDto: ReviewQueryDto,
  ) {
    return this.reviewService.findByProduct(productId, queryDto);
  }

  @Get('user/my-reviews')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.user, RoleEnum.admin)
  @ApiOperation({
    summary: "Get current user's reviews",
    description: 'Retrieve all reviews created by the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User reviews retrieved successfully.',
  })
  async findMyReviews(@Query() queryDto: ReviewQueryDto, @Request() req: any) {
    return this.reviewService.findByUser(req.user.id, queryDto);
  }

  @Get('product/:productId/stats')
  @ApiOperation({
    summary: 'Get product rating statistics',
    description:
      'Get average rating, total reviews, and rating distribution for a product.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product rating statistics retrieved successfully.',
    schema: {
      example: {
        averageRating: 4.2,
        totalReviews: 15,
        ratingDistribution: {
          1: 0,
          2: 1,
          3: 2,
          4: 7,
          5: 5,
        },
      },
    },
  })
  async getProductStats(@Param('productId') productId: string) {
    return this.reviewService.getProductRatingStats(productId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific review by ID',
    description: 'Retrieve a single review with user and product information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found.',
  })
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.user, RoleEnum.admin)
  @ApiOperation({
    summary: 'Update a review',
    description:
      'Update your own review. Product rating will be recalculated automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully and product rating recalculated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found or not authorized to update.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any,
  ) {
    return this.reviewService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.user, RoleEnum.admin)
  @ApiOperation({
    summary: 'Delete a review',
    description:
      'Soft delete your own review. Product rating will be recalculated automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully and product rating recalculated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found or not authorized to delete.',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.reviewService.remove(id, req.user.id);
  }

  @Post(':id/helpful')
  @ApiOperation({
    summary: 'Mark review as helpful',
    description: 'Increment the helpful count for a review.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review marked as helpful successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found.',
  })
  async markHelpful(@Param('id') id: string) {
    return this.reviewService.markHelpful(id);
  }

  @Post(':id/report')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.user, RoleEnum.admin)
  @ApiOperation({
    summary: 'Report a review',
    description: 'Report a review for inappropriate content.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review reported successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found.',
  })
  async reportReview(@Param('id') id: string) {
    return this.reviewService.reportReview(id);
  }
}
