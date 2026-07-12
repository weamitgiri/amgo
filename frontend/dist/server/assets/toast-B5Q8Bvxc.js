import { toast } from "sonner";
const UI = {
  TOAST_DURATION: 5e3
};
const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later."
};
function toastSuccess(message) {
  toast.success(message, { duration: UI.TOAST_DURATION });
}
function toastError(message) {
  toast.error(message, { duration: UI.TOAST_DURATION });
}
function toastWarning(message) {
  toast(message, { duration: UI.TOAST_DURATION, icon: "⚠️" });
}
function toastInfo(message) {
  toast(message, { duration: UI.TOAST_DURATION, icon: "ℹ️" });
}
export {
  ERROR_MESSAGES as E,
  toastSuccess as a,
  toastWarning as b,
  toastInfo as c,
  toastError as t
};
