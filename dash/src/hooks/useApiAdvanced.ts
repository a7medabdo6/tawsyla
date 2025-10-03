import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiService } from "../config/axios";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Advanced query hooks

// 1. Infinite query for paginated data
export const useInfinitePosts = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      return apiService.get<PaginatedResponse<Post>>(
        `/posts?page=${pageParam}&limit=${limit}`
      );
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// 2. Query with dependent data
export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId, "posts"],
    queryFn: async () => {
      return apiService.get<Post[]>(`/users/${userId}/posts`);
    },
    enabled: !!userId, // Only run if userId exists
  });
};

// 3. Optimistic updates
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: Omit<Post, "id" | "createdAt">) => {
      return apiService.post<Post>("/posts", newPost);
    },
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["posts"], (old: Post[] = []) => [
        {
          ...newPost,
          id: "temp-" + Date.now(),
          createdAt: new Date().toISOString(),
        },
        ...old,
      ]);

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// 4. Batch operations
export const useBatchDeletePosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postIds: string[]) => {
      return apiService.post("/posts/batch-delete", { postIds });
    },
    onSuccess: () => {
      // Invalidate all post-related queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// 5. File upload with progress
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      return apiService.upload(`/users/${userId}/avatar`, file);
    },
    onSuccess: (data, variables) => {
      // Update user data with new avatar
      queryClient.setQueryData(["user", variables.userId], (old: User) => ({
        ...old,
        avatar: data.avatarUrl,
      }));

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// 6. Conditional query based on user role
export const useAdminData = (userRole?: string) => {
  return useQuery({
    queryKey: ["admin", "data"],
    queryFn: async () => {
      return apiService.get("/admin/dashboard");
    },
    enabled: userRole === "admin", // Only run if user is admin
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// 7. Query with retry logic
export const useCriticalData = () => {
  return useQuery({
    queryKey: ["critical", "data"],
    queryFn: async () => {
      return apiService.get("/critical-data");
    },
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// 8. Mutation with custom error handling
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: any) => {
      return apiService.put("/users/settings", settings);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      // Custom error handling
      if (error.response?.status === 422) {
        console.error("Validation error:", error.response.data);
      } else if (error.response?.status === 429) {
        console.error("Rate limit exceeded");
      }
    },
  });
};

// 9. Query with background refetching
export const useRealTimeData = () => {
  return useQuery({
    queryKey: ["realtime", "data"],
    queryFn: async () => {
      return apiService.get("/realtime-data");
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching even when tab is not active
  });
};

// 10. Query with prefetching
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  const prefetchUser = async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["user", userId],
      queryFn: () => apiService.get(`/users/${userId}`),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  return { prefetchUser };
};
