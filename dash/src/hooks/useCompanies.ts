import { useQuery } from "@tanstack/react-query";
import { apiService } from "../config/axios";
import { parseApiError } from "../utils/errorHandler";

export interface Company {
  id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  descriptionEn?: string;
  descriptionAr?: string;
  phone?: string;
  email?: string;
  addressEn?: string;
  addressAr?: string;
  latitude?: string;
  longitude?: string;
  logo?: string;
  isActive: boolean;
  isVerified: boolean;
  openingTime?: string;
  closingTime?: string;
  rating?: string;
  totalOrders?: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Hook to get all companies
export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      return await apiService.get<CompanyListResponse>("/companies");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single company by ID
export const useCompany = (companyId: string) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      return await apiService.get<Company>(`/companies/${companyId}`);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
