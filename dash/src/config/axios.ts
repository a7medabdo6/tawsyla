import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { AuthService } from "../services/authService";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token using AuthService
    const token = AuthService.getToken();
    if (token && !AuthService.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    (config as any).metadata = { startTime: new Date() };

    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const endTime = new Date();
    const startTime = (response.config as any).metadata?.startTime;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      duration: `${duration}ms`,
      data: response.data,
    });

    return response;
  },
  (error: AxiosError) => {
    const endTime = new Date();
    const startTime = (error.config as any)?.metadata?.startTime;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data,
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      AuthService.clearAuthData();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error("Access forbidden");
    } else if (error.response?.status === 404) {
      // Not found
      console.error("Resource not found");
    } else if (error.response?.status === 422) {
      // Validation error - handle specific error structure
      const errorData = error.response.data as any;
      if (errorData.errors) {
        // Create a more user-friendly error message
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(", ");
        error.message = `Validation failed: ${errorMessages}`;
      }
    } else if (error.response?.status && error.response.status >= 500) {
      // Server error
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then((response) => response.data);
  },

  // POST request
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.post(url, data, config).then((response) => response.data);
  },

  // PUT request
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.put(url, data, config).then((response) => response.data);
  },

  // PATCH request
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.patch(url, data, config).then((response) => response.data);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then((response) => response.data);
  },

  // Upload file
  upload: <T = any>(
    url: string,
    file: File,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient
      .post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  },

  // Download file
  download: (
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> => {
    return apiClient
      .get(url, {
        ...config,
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      });
  },
};

// Export the axios instance for direct use if needed
export default apiClient;
