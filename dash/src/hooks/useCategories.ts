import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import { parseApiError } from "../utils/errorHandler";

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  image?:
    | string
    | {
        id?: string;
        path?: string;
        __entity?: string;
      };
  isActive: boolean;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types for create and update operations
export interface CreateCategoryData {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  image?: string;
  isActive?: boolean;
  parentId?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Hook to get all categories with filtering and pagination
export const useCategories = (params?: CategoryFilters) => {
  return useQuery<any>({
    queryKey: ["categories", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) {
        queryParams.append("filter", `nameEn||$starts||${params.search}`);
      }
      if (params?.isActive !== undefined) {
        queryParams.append("filter", `isActive||$eq||${params.isActive}`);
      }
      if (params?.parentId) {
        queryParams.append("filter", `parentId||$eq||${params.parentId}`);
      }
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = queryString ? `/categories?${queryString}` : "/categories";

      return apiService.get(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single category by ID
export const useCategory = (categoryId: string) => {
  return useQuery<Category>({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      return apiService.get<Category>(`/categories/${categoryId}`);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryData>({
    mutationFn: async (categoryData: CreateCategoryData) => {
      return apiService.post("/categories", categoryData);
    },
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("Create category failed:", parseApiError(error));
    },
  });
};

// Hook to update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, UpdateCategoryData>({
    mutationFn: async ({ id, ...data }: UpdateCategoryData) => {
      return apiService.put(`/categories/${id}`, data);
    },
    onSuccess: (data, variables) => {
      // Update the specific category in cache
      queryClient.setQueryData(["category", variables.id], data);

      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("Update category failed:", parseApiError(error));
    },
  });
};

// Hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (categoryId: string) => {
      return apiService.delete(`/categories/${categoryId}`);
    },
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("Delete category failed:", parseApiError(error));
    },
  });
};

// Hook for bulk operations (if needed)
export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (categoryIds: string[]) => {
      return apiService.post("/categories/bulk-delete", { ids: categoryIds });
    },
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("Bulk delete categories failed:", parseApiError(error));
    },
  });
};

// Hook for category search with debouncing (for search inputs)
export const useCategorySearch = (
  searchTerm: string,
  enabled: boolean = true
) => {
  return useQuery<CategoryListResponse>({
    queryKey: ["categories", "search", searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);

      const queryString = queryParams.toString();
      const url = queryString ? `/categories?${queryString}` : "/categories";

      return apiService.get(url);
    },
    enabled: enabled && !!searchTerm,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
