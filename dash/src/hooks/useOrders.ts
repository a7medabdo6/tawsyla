import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import { parseApiError } from "../utils/errorHandler";

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  REFUNDED = "refunded",

  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  PAYPAL = "paypal",
}

export interface ProductImage {
  id: string;
  path: string;
  __entity: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  sizeUnit: string;
  weight: string;
  weightUnit: string;
  ean: string;
  price: string;
  stock: number;
  isActive: boolean;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  descriptionEn: string;
  descriptionAr: string;
  isActive: boolean;
  rating: string;
  companyId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  image: ProductImage;
  variants: ProductVariant[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  discountAmount: string;
  finalPrice: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface ShippingAddress {
  id: string;
  userId: number;
  phone: string;
  city: string;
  state: string;
  additionalInfo: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: number;
  orderAmount: string;
  discountAmount: string;
  orderId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: number;
  shippingAddressId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  couponUsageId: string;
  loyaltyRewardId: string | null;
  notes: string;
  adminNotes: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  isActive: boolean;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  couponUsage?: CouponUsage;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateOrderData {
  userId: number;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  items: Omit<OrderItem, "id" | "createdAt" | "updatedAt">[];
  notes?: string;
  adminNotes?: string;
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderFilters {
  page?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Hook to get all orders with filtering and pagination
export const useOrders = (params?: OrderFilters) => {
  return useQuery<OrderListResponse>({
    queryKey: ["orders", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());

      // Build filters object according to NestJS API structure
      const filters: any = {};

      if (params?.search) {
        queryParams.append("search", params?.search);
      }
      if (params?.status) {
        queryParams.append("status", params?.status);
      }

      if (params?.paymentStatus) {
        filters.paymentStatus = params.paymentStatus;
      }

      if (params?.paymentMethod) {
        filters.paymentMethod = params.paymentMethod;
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
      const url = queryString ? `/v1/orders?${queryString}` : "/v1/orders";

      return apiService.get(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single order by ID
export const useOrder = (orderId: string) => {
  return useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      return apiService.get(`/v1/orders/${orderId}`);
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderData>({
    mutationFn: async (orderData: CreateOrderData) => {
      return apiService.post("/v1/orders", orderData);
    },
    onSuccess: () => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Create order failed:", parseApiError(error));
    },
  });
};

// Hook to update an order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, UpdateOrderData>({
    mutationFn: async (orderData: UpdateOrderData) => {
      const { id, ...data } = orderData;
      return apiService.patch(`/v1/orders/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate orders list and specific order
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Update order failed:", parseApiError(error));
    },
  });
};

// Hook to update only order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { orderId: string; status: OrderStatus }>({
    mutationFn: async ({ orderId, status }) => {
      return apiService.put(`/v1/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate orders list and specific order
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => {
      console.error("Update order status failed:", parseApiError(error));
    },
  });
};

// Hook to delete an order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (orderId: string) => {
      return apiService.post(`/v1/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => {
      console.error("cancel order failed:", parseApiError(error));
    },
  });
};
