/**
 * API Service Layer
 * Centralized API client for all HTTP requests
 * Handles authentication, error handling, and request/response intercepting
 */

import { ENV } from "@/config/environment";
import type { ApiResponse, User } from "@/types/common";
import type { LoginRequest, LoginResponse } from "@/types/api";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown;
  statusCode: number;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  auth?: "organizer" | "none";
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(baseUrl: string = ENV.API_BASE_URL, timeout: number = ENV.API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Get authorization header with current token
   */
  private getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Get stored authentication token
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ENV.AUTH_TOKEN_KEY);
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(ENV.AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ENV.AUTH_TOKEN_KEY);
    }
  }

  /**
   * Perform HTTP request with timeout and error handling
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const { auth = "organizer", timeout, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `${url}-${Date.now()}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout || this.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          ...(auth !== "none" ? this.getAuthHeader() : {}),
          ...(fetchOptions.headers || {}),
        },
        signal: abortController.signal,
      });

      const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> | T;

      const isEnvelope =
        body !== null &&
        typeof body === "object" &&
        "success" in body &&
        "data" in body;

      if (!response.ok || (isEnvelope && (body as ApiEnvelope<T>).success === false)) {
        const envelope = isEnvelope ? (body as ApiEnvelope<T>) : null;
        const error = new Error(
          envelope?.message || `HTTP Error ${response.status}`
        );
        throw Object.assign(error, {
          status: response.status,
          data: envelope?.error ?? body,
        });
      }

      if (isEnvelope) {
        return (body as ApiEnvelope<T>).data as T;
      }

      return body as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Authentication API endpoints
 */
export const authApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", credentials),

  logout: () => apiClient.post("/auth/logout"),

  getCurrentUser: () => apiClient.get<User>("/auth/me"),

  refreshToken: (refreshToken: string) =>
    apiClient.post<LoginResponse>("/auth/refresh", { refreshToken }),
} as const;

/**
 * Games API endpoints
 */
export const gamesApi = {
  getAll: () => apiClient.get("/games"),
  getById: (id: string) => apiClient.get(`/games/${id}`),
  create: (data: unknown) => apiClient.post("/games", data),
  update: (id: string, data: unknown) => apiClient.put(`/games/${id}`, data),
  delete: (id: string) => apiClient.delete(`/games/${id}`),
} as const;

/**
 * Groups API endpoints
 */
export const groupsApi = {
  getAll: () => apiClient.get("/groups"),
  getById: (id: string) => apiClient.get(`/groups/${id}`),
  create: (data: unknown) => apiClient.post("/groups", data),
  update: (id: string, data: unknown) => apiClient.put(`/groups/${id}`, data),
  delete: (id: string) => apiClient.delete(`/groups/${id}`),
} as const;

/**
 * Participants API endpoints
 */
export const participantsApi = {
  getAll: () => apiClient.get("/participants"),
  getByGameId: (gameId: string) => apiClient.get(`/games/${gameId}/participants`),
  join: (gameId: string) => apiClient.post(`/games/${gameId}/join`),
  leave: (gameId: string) => apiClient.post(`/games/${gameId}/leave`),
} as const;
