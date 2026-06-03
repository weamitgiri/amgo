/**
 * API Error Handling Utilities
 * Centralized error handling for API operations
 */

import { parseError } from "@/utils/common";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

/**
 * Error response types
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  data?: unknown;
}

/**
 * Parse API error to human-readable message
 */
export function getErrorMessage(error: unknown, defaultMessage?: string): string {
  return parseApiError(error, defaultMessage).message;
}

/**
 * Extract field-level validation errors from Node API responses
 */
export function parseApiError(
  error: unknown,
  defaultMessage?: string
): { message: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  let message = defaultMessage || ERROR_MESSAGES.SERVER_ERROR;

  if (error instanceof Error) {
    if (error.message) message = error.message;

    const data = (error as Error & { data?: unknown }).data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
        if (Array.isArray(val) && val.length > 0) {
          fieldErrors[key] = String(val[0]);
        } else if (typeof val === "string") {
          fieldErrors[key] = val;
        }
      }
    }

    if ("status" in error) {
      const status = (error as Error & { status?: number }).status;
      if (status === 422 && Object.keys(fieldErrors).length > 0) {
        message = "Please fix the highlighted fields.";
      } else if (status === 401) {
        message = error.message || ERROR_MESSAGES.UNAUTHORIZED;
      } else if (status === 404) {
        message = error.message || ERROR_MESSAGES.NOT_FOUND;
      } else if (status === 500) {
        message = error.message || ERROR_MESSAGES.SERVER_ERROR;
      }
    }
  } else if (typeof error === "string") {
    message = error;
  }

  return { message, fieldErrors };
}

/** Map API field names to form field keys */
export function mapApiFieldErrors(
  apiErrors: Record<string, string>,
  mapping: Record<string, string> = {}
): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [key, val] of Object.entries(apiErrors)) {
    mapped[mapping[key] ?? key] = val;
  }
  return mapped;
}

/**
 * Handle API error and log it
 */
export function handleApiError(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error("API Error:", error);
  }

  return message;
}

/**
 * Handle API success and show notification
 */
export function handleApiSuccess(
  message?: string,
  callback?: () => void
): void {
  if (message) {
    // You can integrate with your toast notification system here
    console.log("Success:", message);
  }

  if (callback) {
    callback();
  }
}

/**
 * Retry configuration for failed requests
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
} as const;

/**
 * Exponential backoff calculation
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = RETRY_CONFIG.retryDelay
): number {
  return baseDelay * Math.pow(2, attempt - 1);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = calculateBackoffDelay(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed after retries");
}
