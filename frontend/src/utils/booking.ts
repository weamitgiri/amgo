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

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Total number of days a session can be scheduled within, counting today. So a
// value of 5 with today = July 16 makes July 16–20 selectable and July 21+
// disabled (today plus the next 4 days). Kept in sync with the backend window
// in organizerController.
export const SCHEDULE_WINDOW_DAYS = 5;

export function getSelectableScheduleDateBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + (SCHEDULE_WINDOW_DAYS - 1));

  return {
    minDate: formatDateInputValue(today),
    maxDate: formatDateInputValue(maxDate),
  };
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
    const { minDate, maxDate } = getSelectableScheduleDateBounds();
    if (data.scheduledDate < minDate || data.scheduledDate > maxDate) {
      errors.scheduledDate = `Please select a date within the next ${SCHEDULE_WINDOW_DAYS} days (including today)`;
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

  if (!data.gst_number.trim()) {
    errors.gst_number = "GST number is required";
  } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gst_number.trim())) {
    errors.gst_number = "Please enter a valid GST number";
  }

  const allConsentsAccepted = Object.values(data.consents).every(Boolean);
  if (!allConsentsAccepted) {
    errors.consents = "Please accept all required declarations";
  }

  return errors;
}

const DEFAULT_GST_RATE = 18;

export function calculateBillingTotals(
  price: number | string,
  gstRate: number | string | null = DEFAULT_GST_RATE,
) {
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  const safePrice = Number.isNaN(priceNum) ? 0 : priceNum;
  const rate = toRate(gstRate);
  const gst = parseFloat(((safePrice * rate) / 100).toFixed(2));
  const total = parseFloat((safePrice + gst).toFixed(2));
  return { priceNum: safePrice, gstRate: rate, gst, total };
}

function toRate(rate: number | string | null | undefined): number {
  const n = typeof rate === "string" ? parseFloat(rate) : rate;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : DEFAULT_GST_RATE;
}

// Minimal state normalization for the checkout preview only. The server
// (gstService) is authoritative for the stored snapshot and invoice; this just
// mirrors its intra/inter decision so the breakdown shown matches the total.
const STATE_ALIASES: Record<string, string> = {
  jk: "jammu and kashmir", hp: "himachal pradesh", pb: "punjab", uk: "uttarakhand",
  uttaranchal: "uttarakhand", hr: "haryana", dl: "delhi", "new delhi": "delhi",
  rj: "rajasthan", up: "uttar pradesh", br: "bihar", wb: "west bengal", jh: "jharkhand",
  or: "odisha", orissa: "odisha", cg: "chhattisgarh", chattisgarh: "chhattisgarh",
  mp: "madhya pradesh", gj: "gujarat", mh: "maharashtra", ap: "andhra pradesh",
  ka: "karnataka", ga: "goa", kl: "kerala", tn: "tamil nadu", ts: "telangana",
  tg: "telangana", py: "puducherry", pondicherry: "puducherry",
};

function normalizeState(input: string | null | undefined): string {
  const key = String(input ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return STATE_ALIASES[key] ?? key;
}

/**
 * Checkout preview breakdown: CGST+SGST when the billing state matches the
 * supplier state, otherwise IGST. The total is identical either way.
 */
export function computeGstPreview(
  price: number | string,
  gstRate: number | string | null,
  billingState: string | null | undefined,
  supplierState: string | null | undefined,
) {
  const { priceNum, gstRate: rate, gst, total } = calculateBillingTotals(price, gstRate);
  const buyer = normalizeState(billingState);
  const seller = normalizeState(supplierState);
  const isIntra = !!buyer && !!seller && buyer === seller;
  const cgst = isIntra ? parseFloat((gst / 2).toFixed(2)) : 0;
  const sgst = isIntra ? parseFloat((gst - cgst).toFixed(2)) : 0;
  const igst = isIntra ? 0 : gst;
  return { priceNum, gstRate: rate, gst, total, isIntra, cgst, sgst, igst };
}
