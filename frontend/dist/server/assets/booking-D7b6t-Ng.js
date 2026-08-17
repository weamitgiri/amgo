import { v as validateRequired } from "./validation-eb2A6u03.js";
function formatPrice(price) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(num)) return String(price);
  return `₹${num.toLocaleString("en-IN")}`;
}
function perUserLabel(price, maxUsers) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (!maxUsers || Number.isNaN(num)) return null;
  const perUser = Math.round(num / maxUsers);
  return `₹${perUser.toLocaleString("en-IN")}/user`;
}
function normalizeScheduledTime(time) {
  if (!time) return time;
  return time.length === 5 ? `${time}:00` : time;
}
function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const SCHEDULE_WINDOW_DAYS = 5;
function getSelectableScheduleDateBounds() {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + (SCHEDULE_WINDOW_DAYS - 1));
  return {
    minDate: formatDateInputValue(today),
    maxDate: formatDateInputValue(maxDate)
  };
}
function formatDisplayDate(isoDate) {
  const d = /* @__PURE__ */ new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function formatDisplayTime(time) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}
function buildJoinUrl(invitationLink) {
  if (typeof window === "undefined") {
    return `/join/${invitationLink}`;
  }
  return `${window.location.origin}/join/${invitationLink}`;
}
function validateSessionSetup(data) {
  const errors = {};
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
function validateBillingForm(data) {
  const errors = {};
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
function calculateBillingTotals(price) {
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  const safePrice = Number.isNaN(priceNum) ? 0 : priceNum;
  const gst = parseFloat((safePrice * 0.18).toFixed(2));
  const total = parseFloat((safePrice + gst).toFixed(2));
  return { priceNum: safePrice, gst, total };
}
export {
  SCHEDULE_WINDOW_DAYS as S,
  formatDisplayDate as a,
  formatDateInputValue as b,
  calculateBillingTotals as c,
  formatDisplayTime as d,
  buildJoinUrl as e,
  formatPrice as f,
  getSelectableScheduleDateBounds as g,
  validateBillingForm as h,
  normalizeScheduledTime as n,
  perUserLabel as p,
  validateSessionSetup as v
};
