import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { FavouriteService } from './favourite.service';
import { AddToFavouritesDto } from './dto/add-to-favourites.dto';
import { FavouriteResponseDto } from './dto/favourite-response.dto';

@ApiTags('Favourites')
@Controller('favourites')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.user)
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favourites' })
  @ApiResponse({
    status: 200,
    description: 'Favourites retrieved successfully',
    type: [FavouriteResponseDto],
  })
  async getUserFavourites(
    @Request() req: any,
  ): Promise<FavouriteResponseDto[]> {
    const favourites = await this.favouriteService.getUserFavourites(
      req.user.id,
    );
    return favourites.map((favourite) =>
      this.mapFavouriteToResponseDto(favourite),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Add product to favourites' })
  @ApiResponse({
    status: 201,
    description: 'Product added to favourites successfully',
    type: FavouriteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - product already in favourites',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addToFavourites(
    @Request() req: any,
    @Body() addToFavouritesDto: AddToFavouritesDto,
  ): Promise<any> {
    const favourite = await this.favouriteService.addToFavourites(
      req.user.id,
      addToFavouritesDto,
    );
    return favourite;
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove product from favourites' })
  @ApiResponse({
    status: 204,
    description: 'Product removed from favourites successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found in favourites',
  })
  async removeFromFavourites(
    @Request() req: any,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.favouriteService.removeFromFavourites(req.user.id, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in user favourites' })
  @ApiResponse({
    status: 200,
    description: 'Check result',
    schema: {
      type: 'object',
      properties: {
        isFavourited: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  async checkIfFavourited(
    @Request() req: any,
    @Param('productId') productId: string,
  ): Promise<{ isFavourited: boolean }> {
    const isFavourited = await this.favouriteService.isProductFavourited(
      req.user.id,
      productId,
    );
    return { isFavourited };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get user favourites count' })
  @ApiResponse({
    status: 200,
    description: 'Favourites count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          example: 5,
        },
      },
    },
  })
  async getFavouritesCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.favouriteService.getFavouritesCount(req.user.id);
    return { count };
  }

  private mapFavouriteToResponseDto(favourite: any): FavouriteResponseDto {
    return {
      id: favourite.id,
      userId: favourite.userId,
      product: {
        id: favourite.product.id,
        nameEn: favourite.product.nameEn,
        nameAr: favourite.product.nameAr,
        type: favourite.product.type,
        descriptionEn: favourite.product.descriptionEn,
        descriptionAr: favourite.product.descriptionAr,
        price: favourite.product.price,
        stock: favourite.product.stock,
        isActive: favourite.product.isActive,
        rating: favourite.product.rating,
        companyId: favourite.product.companyId,
        categoryId: favourite.product.categoryId,
        imageId: favourite.product.imageId,
        createdAt: favourite.product.createdAt,
        updatedAt: favourite.product.updatedAt,
      },
      createdAt: favourite.createdAt,
      updatedAt: favourite.updatedAt,
    };
  }
}
