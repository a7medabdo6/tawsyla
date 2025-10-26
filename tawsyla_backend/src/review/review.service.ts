import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { PaginatedResponse } from '../product/dto/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: {
        productId: createReviewDto.productId,
        userId: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already reviewed this product. Use update instead.',
      );
    }

    // Validate rating
    if (createReviewDto.rating < 1.0 || createReviewDto.rating > 5.0) {
      throw new BadRequestException('Rating must be between 1.0 and 5.0');
    }

    // Create review
    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      isActive: true,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update product rating automatically
    await this.updateProductRating(createReviewDto.productId);

    return this.findOne(savedReview.id);
  }

  async findAll(queryDto: ReviewQueryDto): Promise<PaginatedResponse<Review>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      productId,
      userId,
      minRating,
      maxRating,
      verifiedPurchaseOnly,
    } = queryDto;

    const skip = (page - 1) * limit;
    const whereCondition: any = { isActive: true };

    if (productId) {
      whereCondition.productId = productId;
    }

    if (userId) {
      whereCondition.userId = userId;
    }

    if (minRating !== undefined && maxRating !== undefined) {
      whereCondition.rating = Between(minRating, maxRating);
    } else if (minRating !== undefined) {
      whereCondition.rating = Between(minRating, 5.0);
    } else if (maxRating !== undefined) {
      whereCondition.rating = Between(1.0, maxRating);
    }

    if (verifiedPurchaseOnly) {
      whereCondition.isVerifiedPurchase = true;
    }

    // Define allowed sort fields
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'rating',
      'helpfulCount',
    ];

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = { [sortField]: sortOrder };

    const [data, total] = await this.reviewRepository.findAndCount({
      where: whereCondition,
      relations: ['user', 'product'],
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findByProduct(
    productId: string,
    queryDto: ReviewQueryDto,
  ): Promise<PaginatedResponse<Review>> {
    return this.findAll({ ...queryDto, productId });
  }

  async findByUser(
    userId: number,
    queryDto: ReviewQueryDto,
  ): Promise<PaginatedResponse<Review>> {
    return this.findAll({ ...queryDto, userId });
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: number,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId, isActive: true },
    });

    if (!review) {
      throw new NotFoundException(
        'Review not found or you are not authorized to update it',
      );
    }

    // Validate rating if provided
    if (
      updateReviewDto.rating &&
      (updateReviewDto.rating < 1.0 || updateReviewDto.rating > 5.0)
    ) {
      throw new BadRequestException('Rating must be between 1.0 and 5.0');
    }

    // Update review
    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    // Update product rating if rating was changed
    if (updateReviewDto.rating) {
      await this.updateProductRating(review.productId);
    }

    return this.findOne(updatedReview.id);
  }

  async remove(id: string, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId, isActive: true },
    });

    if (!review) {
      throw new NotFoundException(
        'Review not found or you are not authorized to delete it',
      );
    }

    // Soft delete
    review.isActive = false;
    await this.reviewRepository.save(review);

    // Update product rating after deletion
    await this.updateProductRating(review.productId);
  }

  async markHelpful(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.helpfulCount += 1;
    await this.reviewRepository.save(review);

    return this.findOne(id);
  }

  async reportReview(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.reportCount += 1;
    await this.reviewRepository.save(review);

    return this.findOne(id);
  }

  async getProductRatingStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewRepository.find({
      where: { productId, isActive: true },
      select: ['rating'],
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      ratingDistribution[roundedRating] =
        (ratingDistribution[roundedRating] || 0) + 1;
    });

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  /**
   * Update product rating based on all active reviews
   * This method is called automatically when reviews are created/updated/deleted
   */
  private async updateProductRating(productId: string): Promise<void> {
    try {
      const stats = await this.getProductRatingStats(productId);

      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (product) {
        product.rating = stats.averageRating;

        // Update top rated category automatically
        product.updateTopRated();

        await this.productRepository.save(product);
      }
    } catch (error) {
      // Log error but don't fail the review operation
      console.error('Failed to update product rating:', error);
    }
  }
}
