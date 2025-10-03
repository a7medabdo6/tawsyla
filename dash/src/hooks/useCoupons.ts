import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import { parseApiError } from "../utils/errorHandler";

export enum CouponType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export enum CouponStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  DISABLED = "disabled",
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number;
  usageLimit: number;
  usageLimitPerUser: number;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponListResponse {
  data: Coupon[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateCouponData {
  code: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number;
  usageLimit: number;
  usageLimitPerUser: number;
  expiresAt: string;
  isActive: boolean;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  id: string;
}

export interface CouponFilters {
  page?: number;
  search?: string;
  type?: CouponType;
  status?: CouponStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Hook to get all coupons with filtering and pagination
export const useCoupons = (params?: CouponFilters) => {
  return useQuery<CouponListResponse>({
    queryKey: ["coupons", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());

      // Build filters object according to NestJS API structure
      const filters: any = {};

      if (params?.search) {
        filters.search = params.search;
      }

      if (params?.type) {
        filters.type = params.type;
      }

      if (params?.status) {
        filters.status = params.status;
      }

      // Add filters to query if any exist
      if (Object.keys(filters).length > 0) {
        queryParams.append("filters", JSON.stringify(filters));
      }

      // Add sorting if specified
      if (params?.sortBy) {
        const sort = [
          { field: params.sortBy, order: params.sortOrder || "asc" },
        ];
        queryParams.append("sort", JSON.stringify(sort));
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/v1/coupons?${queryString}` : "/v1/coupons";

      return apiService.get(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single coupon by ID
export const useCoupon = (couponId: string) => {
  return useQuery<Coupon>({
    queryKey: ["coupon", couponId],
    queryFn: async () => {
      return apiService.get(`/v1/coupons/${couponId}`);
    },
    enabled: !!couponId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation<Coupon, Error, CreateCouponData>({
    mutationFn: async (couponData: CreateCouponData) => {
      return apiService.post("/v1/coupons", couponData);
    },
    onSuccess: () => {
      // Invalidate and refetch coupons list
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      console.error("Create coupon failed:", parseApiError(error));
    },
  });
};

// Hook to update a coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation<Coupon, Error, UpdateCouponData>({
    mutationFn: async (couponData: UpdateCouponData) => {
      const { id, ...data } = couponData;
      return apiService.put(`/v1/coupons/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate coupons list and specific coupon
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      console.error("Update coupon failed:", parseApiError(error));
    },
  });
};

// Hook to delete a coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (couponId: string) => {
      return apiService.delete(`/v1/coupons/${couponId}`);
    },
    onSuccess: () => {
      // Invalidate coupons list
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      console.error("Delete coupon failed:", parseApiError(error));
    },
  });
};
