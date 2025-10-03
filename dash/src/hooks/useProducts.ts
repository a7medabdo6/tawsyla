import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import { parseApiError } from "../utils/errorHandler";
import {
  Product,
  ProductListResponse,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  ProductVariant,
} from "../types/product";

// Hook to get all products with filtering and pagination
export const useProducts = (params?: ProductFilters) => {
  return useQuery<ProductListResponse>({
    queryKey: ["products", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search)
        queryParams.append("filter", `nameAr||$starts||${params.search}`);
      if (params?.category) {
        queryParams.append("join", "category");
        queryParams.append("filter", `category.id||$eq||${params.category}`);
      }
      if (params?.isActive) {
        queryParams.append("filter", `isActive||$eq||${params.isActive}`);
      }
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = queryString ? `/products?${queryString}` : "/products";

      return apiService.get(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single product by ID
export const useProduct = (productId: string) => {
  return useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      return apiService.get(`/products/${productId}`);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductData>({
    mutationFn: async (productData: CreateProductData) => {
      return apiService.post("/products", productData);
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Create product failed:", parseApiError(error));
    },
  });
};

// Hook to update a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, UpdateProductData>({
    mutationFn: async ({ id, ...data }: UpdateProductData) => {
      return apiService.put(`/products/${id}`, data);
    },
    onSuccess: (data, variables) => {
      // Update the specific product in cache
      queryClient.setQueryData(["product", variables.id], data);

      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Update product failed:", parseApiError(error));
    },
  });
};

// Hook to delete a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (productId: string) => {
      return apiService.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Delete product failed:", parseApiError(error));
    },
  });
};

// Hook to get product categories (if your API supports it)
export const useProductCategories = () => {
  return useQuery<string[]>({
    queryKey: ["product-categories"],
    queryFn: async () => {
      return apiService.get("/products/categories");
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook for bulk operations (if needed)
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (productIds: string[]) => {
      return apiService.post("/products/bulk-delete", { ids: productIds });
    },
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Bulk delete products failed:", parseApiError(error));
    },
  });
};

// Hook for product search with debouncing (for search inputs)
export const useProductSearch = (
  searchTerm: string,
  enabled: boolean = true
) => {
  return useQuery<ProductListResponse>({
    queryKey: ["products", "search", searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);

      const queryString = queryParams.toString();
      const url = queryString ? `/products?${queryString}` : "/products";

      return apiService.get(url);
    },
    enabled: enabled && !!searchTerm,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility functions for stock calculations
export const calculateProductStock = (
  product: Product
): {
  totalStock: number;
  hasStock: boolean;
  variantCount: number;
} => {
  if (product.variants && product.variants.length > 0) {
    const totalStock = product.variants.reduce((total, variant) => {
      return total + (variant.stock || 0);
    }, 0);

    const hasStock = product.variants.some(
      (variant) => (variant.stock || 0) > 0
    );
    // console.log(product.variants.length, "product.variants.length");

    return {
      totalStock,
      hasStock,
      variantCount: product.variants.length,
    };
  } else {
    const stock = product.stock || 0;
    return {
      totalStock: stock,
      hasStock: stock > 0,
      variantCount: 0,
    };
  }
};

export const getLowStockVariants = (
  product: Product,
  threshold: number = 10
): ProductVariant[] => {
  if (!product.variants) return [];

  // Calculate total stock across all variants
  const totalStock = product.variants.reduce(
    (total, variant) => total + (variant.stock || 0),
    0
  );

  // If total stock is low, return all variants with stock > 0
  if (totalStock <= threshold) {
    return product.variants.filter((variant) => (variant.stock || 0) > 0);
  }

  // If total stock is not low, return empty array
  return [];
};

export const getOutOfStockVariants = (product: Product): ProductVariant[] => {
  if (!product.variants) return [];

  return product.variants.filter((variant) => (variant.stock || 0) === 0);
};
