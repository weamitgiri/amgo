import { redirect } from "@tanstack/react-router";
import { ENV } from "@/config/environment";
import { apiClient, authApi } from "@/api/client";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ENV.AUTH_TOKEN_KEY);
}

export function isOrganizerAuthenticated(): boolean {
  return !!getAuthToken();
}

export function restoreAuthToken(): void {
  const token = getAuthToken();
  if (token) {
    apiClient.setToken(token);
  }
}

/** Redirect unauthenticated users to login (client-side only). */
export async function requireOrganizerAuth(context: any): Promise<void> {
  // SSR: allow to pass through
  if (typeof window === "undefined") return;

  // If token exists, allow
  const token = getAuthToken();
  if (token) return;

  // No token: try to refresh using stored refresh token
  const refresh = localStorage.getItem(ENV.REFRESH_TOKEN_KEY);
  if (refresh) {
    try {
      const resp = await authApi.refreshToken(refresh);
      apiClient.setToken(resp.token);
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, resp.refreshToken);
      return;
    } catch (e) {
      // ignore and fall through to redirect
    }
  }

  // Not authenticated — redirect to login
  const pathname = context?.location?.pathname || "/dashboard";
  throw redirect({
    to: "/login",
    search: { redirect: pathname },
  });
}
