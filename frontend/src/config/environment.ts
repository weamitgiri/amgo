/**
 * Environment Configuration
 * Centralized management of environment variables testing
 */

export const ENV = {
  // API Configuration
  // Use the Vite proxy in development to avoid browser CORS preflights.
  API_BASE_URL: import.meta.env.DEV
    ? ""
    : import.meta.env.VITE_API_BASE_URL || "http://localhost:6001",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
  STORAGE_BASE_URL:
    import.meta.env.VITE_STORAGE_BASE_URL || "http://localhost/p/storage",

  // Authentication
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || "auth_token",
  REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || "refresh_token",

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",

  // Application Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || "zgame",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  ENVIRONMENT: (import.meta.env.VITE_ENVIRONMENT || "development") as "development" | "staging" | "production",

  // Derived flags
  isDevelopment: import.meta.env.MODE === "development",
  isProduction: import.meta.env.MODE === "production",
} as const;

export type Environment = typeof ENV;
