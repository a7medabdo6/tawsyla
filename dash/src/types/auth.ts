// Auth response types
export interface LoginResponse {
  refreshToken: string;
  token: string;
  tokenExpires: number;
  user: User;
}

export interface User {
  id: number;
  email: string;
  provider: string;
  socialId: string | null;
  firstName: string;
  lastName: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  company: Company;
}

export interface Role {
  id: number;
  name: string;
  __entity: string;
}

export interface Status {
  id: number;
  name: string;
  __entity: string;
}

export interface Company {
  id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  descriptionEn: string;
  descriptionAr: string;
  phone: string;
  email: string;
  addressEn: string;
  addressAr: string;
  latitude: string;
  longitude: string;
  logo: string;
  isActive: boolean;
  isVerified: boolean;
  openingTime: string;
  closingTime: string;
  rating: string;
  totalOrders: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpires: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
