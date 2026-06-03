/**
 * Common Types and Interfaces
 * Shared type definitions used throughout the application
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Authentication User Type
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication State
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Async Request State
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  timestamp?: number;
}
