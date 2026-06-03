/**
 * Authentication Middleware
 * Handles authentication checks and token refresh
 */

import { apiClient } from "@/api/client";
import { ENV } from "@/config/environment";

/**
 * Initialize authentication from stored tokens
 * Call this once when the app starts
 */
export async function initializeAuth(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const token = localStorage.getItem(ENV.AUTH_TOKEN_KEY);
    
    if (token) {
      // Verify token is still valid by making a request to get current user
      apiClient.setToken(token);
      // TODO: Dispatch getCurrentUser action in your app initialization
    }
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    // Clear invalid tokens
    localStorage.removeItem(ENV.AUTH_TOKEN_KEY);
    localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
  }
}

/**
 * Setup authentication interceptor
 * Handles 401 responses and token refresh
 */
export function setupAuthInterceptor(refreshTokenFn: () => Promise<void>): void {
  // This would be called if using a fetch wrapper with interceptors
  // For now, error handling is done in the apiClient
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  
  apiClient.setToken(null);
  localStorage.removeItem(ENV.AUTH_TOKEN_KEY);
  localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
}

/**
 * Check if user has required permissions
 */
export function hasPermission(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  userRoles: string[],
  requiredRoles: string[]
): boolean {
  return requiredRoles.every((role) => userRoles.includes(role));
}
