import type { AuthResponse, Product, ProductPayload, User } from '../types';

// Centralized backend URL. In dev, Vite proxy maps /api -> http://localhost:3004.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TOKEN_KEY = 'accessToken';

// Reads JWT from localStorage so requests can include Authorization header.
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Saves JWT in localStorage after successful login/register.
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Clears JWT on logout or when token is invalid.
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Small helper that handles JSON requests and standard error parsing.
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const errorData = await response.json();
      message = errorData.message ?? message;
    } catch {
      // Keep fallback message when backend returns non-JSON.
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Registers a user using backend RegisterDto shape.
export function register(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Logs in a user using backend LoginDto shape.
export function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Loads current authenticated user from protected /users/me endpoint.
export function getCurrentUser(): Promise<User> {
  return request<User>('/users/me');
}

// Reads all products from /product.
export function getProducts(): Promise<Product[]> {
  return request<Product[]>('/product');
}

// Creates a product (admin endpoint in backend).
export function createProduct(data: ProductPayload): Promise<Product> {
  return request<Product>('/product', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Updates an existing product by ID.
export function updateProduct(id: string, data: ProductPayload): Promise<Product> {
  return request<Product>(`/product/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Deletes a product by ID.
export function deleteProduct(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/product/${id}`, {
    method: 'DELETE',
  });
}
