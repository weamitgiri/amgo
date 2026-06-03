import { validateRequired } from "./validation";
import type { ApiPackage } from "@/api/types/public";
import type { BookingConsents } from "@/api/types/organizer";

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(num)) return String(price);
  return `₹${num.toLocaleString("en-IN")}`;
}

export function perUserLabel(price: number | string, maxUsers: number): string | null {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (!maxUsers || Number.isNaN(num)) return null;
  const perUser = Math.round(num / maxUsers);
  return `₹${perUser.toLocaleString("en-IN")}/user`;
}

export function normalizeScheduledTime(time: string): string {
  if (!time) return time;
  return time.length === 5 ? `${time}:00` : time;
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDisplayTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function buildJoinUrl(invitationLink: string): string {
  if (typeof window === "undefined") {
    return `/join/${invitationLink}`;
  }
  return `${window.location.origin}/join/${invitationLink}`;
}

export type SetupFieldErrors = Partial<
  Record<"activity" | "game" | "package" | "scheduledDate" | "scheduledTime", string>
>;

export function validateSessionSetup(data: {
  activityId: number | null;
  gameId: number | null;
  package: ApiPackage | null;
  scheduledDate: string;
  scheduledTime: string;
}): SetupFieldErrors {
  const errors: SetupFieldErrors = {};

  if (!data.activityId) errors.activity = "Please select an activity";
  if (!data.gameId) errors.game = "No game variant available for this activity";
  if (!data.package) errors.package = "Please choose a package";
  if (!data.scheduledDate) errors.scheduledDate = "Date is required";
  if (!data.scheduledTime) errors.scheduledTime = "Start time is required";

  if (data.scheduledDate) {
    const selected = new Date(`${data.scheduledDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.scheduledDate = "Date cannot be in the past";
    }
  }

  return errors;
}

export type BillingFieldErrors = Partial<
  Record<
    | "billing_address"
    | "city"
    | "state"
    | "pin_code"
    | "payment_method"
    | "gst_number"
    | "consents",
    string
  >
>;

export function validateBillingForm(data: {
  billing_address: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method: string;
  gst_number: string;
  consents: BookingConsents;
}): BillingFieldErrors {
  const errors: BillingFieldErrors = {};

  const addressCheck = validateRequired(data.billing_address);
  if (!addressCheck.isValid) errors.billing_address = addressCheck.error;

  const cityCheck = validateRequired(data.city);
  if (!cityCheck.isValid) errors.city = cityCheck.error;

  const stateCheck = validateRequired(data.state);
  if (!stateCheck.isValid) errors.state = stateCheck.error;

  if (!data.pin_code.trim()) {
    errors.pin_code = "PIN code is required";
  } else if (!/^\d{6}$/.test(data.pin_code.trim())) {
    errors.pin_code = "PIN code must be 6 digits";
  }

  if (!data.payment_method) {
    errors.payment_method = "Please select a payment method";
  }

  if (data.gst_number.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gst_number.trim())) {
    errors.gst_number = "Please enter a valid GST number";
  }

  const allConsentsAccepted = Object.values(data.consents).every(Boolean);
  if (!allConsentsAccepted) {
    errors.consents = "Please accept all required declarations";
  }

  return errors;
}

export function calculateBillingTotals(price: number | string) {
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  const safePrice = Number.isNaN(priceNum) ? 0 : priceNum;
  const gst = parseFloat((safePrice * 0.18).toFixed(2));
  const total = parseFloat((safePrice + gst).toFixed(2));
  return { priceNum: safePrice, gst, total };
}
