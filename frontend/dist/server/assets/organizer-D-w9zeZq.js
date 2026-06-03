import { c as createLucideIcon } from "./Logo-COJrqD4D.js";
import { E as ERROR_MESSAGES } from "./toast-s3ZTemWF.js";
const __iconNode = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode);
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function parseApiError(error, defaultMessage) {
  const fieldErrors = {};
  let message = ERROR_MESSAGES.SERVER_ERROR;
  if (error instanceof Error) {
    if (error.message) message = error.message;
    const data = error.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val) && val.length > 0) {
          fieldErrors[key] = String(val[0]);
        } else if (typeof val === "string") {
          fieldErrors[key] = val;
        }
      }
    }
    if ("status" in error) {
      const status = error.status;
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
function mapApiFieldErrors(apiErrors, mapping = {}) {
  const mapped = {};
  for (const [key, val] of Object.entries(apiErrors)) {
    mapped[mapping[key] ?? key] = val;
  }
  return mapped;
}
function validateRequired(value) {
  if (!value || value.trim() === "") {
    return { isValid: false, error: "This field is required" };
  }
  return { isValid: true };
}
function validateUrl(url) {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Please enter a valid URL" };
  }
}
function normalizeWebsite(url) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
function validateRegistrationForm(data) {
  const errors = {};
  const nameCheck = validateRequired(data.name);
  if (!nameCheck.isValid) errors.name = nameCheck.error;
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  const companyCheck = validateRequired(data.company_name);
  if (!companyCheck.isValid) errors.company_name = companyCheck.error;
  const websiteCheck = validateRequired(data.company_website);
  if (!websiteCheck.isValid) {
    errors.company_website = websiteCheck.error;
  } else {
    const urlCheck = validateUrl(normalizeWebsite(data.company_website));
    if (!urlCheck.isValid) errors.company_website = urlCheck.error;
  }
  return errors;
}
function validateOtpCode(otp) {
  if (!otp.trim()) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be exactly 6 digits";
  return null;
}
export {
  LoaderCircle as L,
  validateRegistrationForm as a,
  validateRequired as b,
  isValidEmail as i,
  mapApiFieldErrors as m,
  normalizeWebsite as n,
  parseApiError as p,
  validateOtpCode as v
};
