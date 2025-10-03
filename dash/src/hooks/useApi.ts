import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import {
  parseApiError,
  getFieldError,
  isValidationError,
} from "../utils/errorHandler";
import { AuthService } from "../services/authService";
import { LoginResponse } from "../types/auth";

// Example query hook for fetching user data
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      return apiService.get(`/users/${userId}`);
    },
    enabled: !!userId, // Only run query if userId exists
  });
};

// Example mutation hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Use the new apiService for login
      return apiService.post<LoginResponse>(
        "/v1/auth/email/login",
        credentials
      );
    },
    onSuccess: (data: LoginResponse) => {
      // Store auth data using AuthService
      AuthService.storeAuthData(data);

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      console.log("✅ Login successful:", {
        user: data.user.email,
        role: data.user.role.name,
        company: data?.user?.company?.nameEn,
      });
    },
    onError: (error) => {
      console.error("Login failed:", parseApiError(error));
    },
  });
};

// Example query hook for fetching dashboard data
export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      return apiService.get("/dashboard");
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });
};

// Example mutation hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      return apiService.put("/users/profile", userData);
    },
    onSuccess: (data, variables) => {
      // Update the user query cache with new data
      queryClient.setQueryData(["user", variables.id], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Hook to get current user data
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error("No authenticated user");
      }
      return user;
    },
    enabled: AuthService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to check authentication status
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ["auth", "status"],
    queryFn: () => ({
      isAuthenticated: AuthService.isAuthenticated(),
      user: AuthService.getCurrentUser(),
      role: AuthService.getUserRole(),
      company: AuthService.getCompanyInfo(),
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Call logout API if needed
      try {
        await apiService.post("/v1/auth/logout");
      } catch (error) {
        console.warn("Logout API call failed, but clearing local data");
      }

      // Clear local auth data
      AuthService.clearAuthData();

      return true;
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();

      // Redirect to login
      window.location.href = "/login";
    },
  });
};
