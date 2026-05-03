// Shared frontend types that mirror backend DTO responses.
export type Role = 'USER' | 'ADMIN';

// User shape returned by /auth/login, /auth/register, and /users/me.
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

// Auth response shape from backend auth endpoints.
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Product shape returned by backend product endpoints.
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request body used for creating/updating products.
export interface ProductPayload {
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}
