/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// API Configuration
export const API_CONSTANTS = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Routes
export const ROUTES = {
  // Public Routes
  PUBLIC: {
    ROOT: "/",
    LOGIN: "/login",
    PRIVACY: "/privacy",
    TERMS: "/terms",
  },
  // Protected Routes
  PROTECTED: {
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    GAMES: "/game",
    GROUPS: "/groups",
    LOBBY: "/lobby",
    PARTICIPANTS: "/participants",
    RESULTS: "/results",
    CREATE_GAME: "/create",
    JOIN_GAME: "/join",
  },
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  THROTTLE_DELAY: 1000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  REQUIRED_FIELD: "This field is required.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  OPERATION_SUCCESS: "Operation completed successfully.",
  CREATED_SUCCESS: "Created successfully.",
  UPDATED_SUCCESS: "Updated successfully.",
  DELETED_SUCCESS: "Deleted successfully.",
} as const;
