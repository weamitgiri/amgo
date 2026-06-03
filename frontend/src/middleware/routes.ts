/**
 * Route Protection and Guards
 * Middleware for protecting routes and handling redirects
 */

import { ROUTES } from "@/constants";
import type { User } from "@/types/common";

interface ProtectedRouteConfig {
  path: string;
  requiredRoles?: string[];
  requiredAuth?: boolean;
  redirectTo?: string;
}

/**
 * Define protected routes and their access requirements
 */
export const PROTECTED_ROUTES: ProtectedRouteConfig[] = [
  {
    path: ROUTES.PROTECTED.DASHBOARD,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.PROFILE,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.GAMES,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.GROUPS,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.LOBBY,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.PARTICIPANTS,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.RESULTS,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.CREATE_GAME,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
  {
    path: ROUTES.PROTECTED.JOIN_GAME,
    requiredAuth: true,
    redirectTo: ROUTES.PUBLIC.LOGIN,
  },
];

/**
 * Check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route.path.split("/:")[0])
  );
}

/**
 * Get protection config for a route
 */
export function getRouteConfig(
  pathname: string
): ProtectedRouteConfig | undefined {
  return PROTECTED_ROUTES.find((route) =>
    pathname.startsWith(route.path.split("/:")[0])
  );
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
  user: User | null,
  isAuthenticated: boolean,
  config: ProtectedRouteConfig
): boolean {
  // Check authentication requirement
  if (config.requiredAuth && !isAuthenticated) {
    return false;
  }

  // Check role-based access
  if (config.requiredRoles && user) {
    return config.requiredRoles.some((role) => user.roles.includes(role));
  }

  return true;
}

/**
 * Determine redirect path based on route access
 */
export function getRedirectPath(
  user: User | null,
  isAuthenticated: boolean,
  currentPath: string
): string | null {
  const config = getRouteConfig(currentPath);

  if (!config) {
    return null; // Not a protected route
  }

  if (!canAccessRoute(user, isAuthenticated, config)) {
    return config.redirectTo || ROUTES.PUBLIC.LOGIN;
  }

  return null; // No redirect needed
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.PUBLIC.ROOT,
  ROUTES.PUBLIC.LOGIN,
  ROUTES.PUBLIC.PRIVACY,
  ROUTES.PUBLIC.TERMS,
] as const;

/**
 * Check if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route);
}
