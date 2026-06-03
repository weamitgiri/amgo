/**
 * Form Validation Utilities
 * Utility functions for validating form inputs
 */

import { isValidEmail } from "./common";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, error: "This field is required" };
  }

  return { isValid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  minLength: number
): ValidationResult {
  if (!value) {
    return { isValid: false, error: "This field is required" };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `Minimum ${minLength} characters required`,
    };
  }

  return { isValid: true };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number
): ValidationResult {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `Maximum ${maxLength} characters allowed`,
    };
  }

  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Please enter a valid URL" };
  }
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const phoneRegex = /^\d{10}$|^\+\d{1,3}\d{9,}$/;

  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }

  if (!phoneRegex.test(phone.replace(/[-\s]/g, ""))) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }

  return { isValid: true };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): ValidationResult {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `Value must be between ${min} and ${max}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate form data object
 */
export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  }

  return errors;
}
