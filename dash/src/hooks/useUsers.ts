import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import { parseApiError } from "../utils/errorHandler";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

// Types for create and update operations
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Hook to get all users with filtering and pagination
export const useUsers = (params?: UserFilters) => {
  return useQuery<UserListResponse>({
    queryKey: ["users", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());

      // Build filters object according to NestJS API structure
      const filters: any = {};

      if (params?.search) {
        // Send a single search term that will search across both firstName and lastName
        filters.search = params.search;
      }

      if (params?.status) {
        filters.status = [{ id: +params.status }];
      }

      if (params?.role) {
        filters.roles = [{ id: +params.role }];
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
      const url = queryString ? `/v1/users?${queryString}` : "/v1/users";

      return apiService.get(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single user by ID
export const useUser = (userId: string) => {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      return apiService.get<User>(`/v1/users/${userId}`);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserData>({
    mutationFn: async (userData: CreateUserData) => {
      return apiService.post("/v1/users", userData);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Create user failed:", parseApiError(error));
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserData>({
    mutationFn: async ({ id, ...data }: UpdateUserData) => {
      return apiService.patch(`/v1/users/${id}`, data);
    },
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(["user", variables.id], data);

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Update user failed:", parseApiError(error));
    },
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      return apiService.delete(`/v1/users/${userId}`);
    },
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Delete user failed:", parseApiError(error));
    },
  });
};

// Hook for bulk operations (if needed)
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (userIds: string[]) => {
      return apiService.post("/v1/users/bulk-delete", { ids: userIds });
    },
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Bulk delete users failed:", parseApiError(error));
    },
  });
};

// Hook for user search with debouncing (for search inputs)
export const useUserSearch = (searchTerm: string, enabled: boolean = true) => {
  return useQuery<UserListResponse>({
    queryKey: ["users", "search", searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);

      const queryString = queryParams.toString();
      const url = queryString ? `/v1/users?${queryString}` : "/v1/users";

      return apiService.get(url);
    },
    enabled: enabled && !!searchTerm,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
