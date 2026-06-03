import { isValidEmail } from "./common";
import { validateRequired, validateUrl } from "./validation";

export function normalizeWebsite(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export type RegistrationFieldErrors = Partial<
  Record<"name" | "email" | "company_name" | "company_website" | "otp", string>
>;

export function validateRegistrationForm(data: {
  name: string;
  email: string;
  company_name: string;
  company_website: string;
}): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};

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

export function validateOtpCode(otp: string): string | null {
  if (!otp.trim()) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be exactly 6 digits";
  return null;
}
