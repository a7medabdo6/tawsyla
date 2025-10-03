import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postFakeLogin, postJwtLogin } from "../helpers/fakebackend_helper";

// Example query hook for fetching user data
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      // Replace with your actual API call
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!userId, // Only run query if userId exists
  });
};

// Example mutation hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
        return postJwtLogin(credentials);
      } else {
        return postFakeLogin(credentials);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Store user data in session storage
      sessionStorage.setItem("authUser", JSON.stringify(data));
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

// Example query hook for fetching dashboard data
export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      // Replace with your actual dashboard API call
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });
};

// Example mutation hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the user query cache with new data
      queryClient.setQueryData(["user", variables.id], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
