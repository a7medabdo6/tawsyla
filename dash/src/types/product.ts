export interface ProductVariant {
  id?: string;
  size?: string;
  sizeUnit?: string;
  weight?: number;
  weightUnit?: string;
  ean?: string;
  price: number;
  stock: number;
  isActive?: boolean;
  sku?: string;
}

export interface Product {
  id?: string;
  nameEn: string;
  nameAr?: string;
  type?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isActive?: boolean;
  rating?: number;
  companyId?: string;
  imageId?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];

  // Legacy fields for backward compatibility
  name?: string;
  description?: string;
  price?: number;
  category?: {
    nameEn?: string;
    nameAr?: string;
  };
  image?:
    | string
    | {
        id?: string;
        path?: string;
        __entity?: string;
      };
  stock?: number;
}

export interface ProductListResponse {
  data: Product[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateProductData {
  nameEn: string;
  nameAr?: string;
  type?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isActive?: boolean;
  rating?: number;
  companyId?: string;
  imageId?: string;
  categoryId?: string;
  variants?: ProductVariant[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}
