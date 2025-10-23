import { CrudOptions } from '@nestjsx/crud';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export const productCrudConfig: CrudOptions = {
  model: {
    type: Product,
  },
  dto: {
    create: CreateProductDto,
    update: UpdateProductDto,
    replace: UpdateProductDto,
  },
  params: {
    id: {
      type: 'uuid',
      primary: true,
      field: 'id',
    },
  },
  query: {
    limit: 25,
    maxLimit: 100,
    alwaysPaginate: true,
    join: {
      variants: {
        eager: true,
      },
      category: {
        eager: true,
      },
      image: {
        eager: true,
      },
    },
  },
  routes: {
    exclude: ['createManyBase', 'updateOneBase'],
  },
};
