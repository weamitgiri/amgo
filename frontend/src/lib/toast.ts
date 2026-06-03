import { toast } from "sonner";
import { UI } from "@/constants";

/**
 * Central toast helpers for success, error, warning and info messages.
 */
export function toastSuccess(message: string) {
  toast.success(message, { duration: UI.TOAST_DURATION });
}

export function toastError(message: string) {
  toast.error(message, { duration: UI.TOAST_DURATION });
}

export function toastWarning(message: string) {
  toast(message, { duration: UI.TOAST_DURATION, icon: "⚠️" });
}

export function toastInfo(message: string) {
  toast(message, { duration: UI.TOAST_DURATION, icon: "ℹ️" });
}
