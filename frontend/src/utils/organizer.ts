import { isValidEmail } from "./common";
import { validateRequired } from "./validation";

export function normalizeWebsite(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Basic website-format check. `new URL()` alone accepts junk like "https://www.xyz"
 * (no real TLD), so we require an actual domain — optional http(s):// then either a
 * bare "domain.tld" or a "www.domain.tld" (a "www." prefix must be followed by a full
 * domain + 2+ letter TLD). Accepts "example.com", "https://www.a-b.co.uk";
 * rejects "www.xyz", "xyz", "www.com", "http://localhost".
 */
const WEBSITE_RE =
  /^(https?:\/\/)?(www\.[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}|(?!www\.)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,})(:\d+)?(\/\S*)?$/i;

export function isValidWebsite(url: string): boolean {
  return WEBSITE_RE.test(url.trim());
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
  } else if (!isValidWebsite(data.company_website)) {
    errors.company_website = "Please enter a valid website (e.g. https://example.com)";
  }

  return errors;
}

export function validateOtpCode(otp: string): string | null {
  if (!otp.trim()) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be exactly 6 digits";
  return null;
}
