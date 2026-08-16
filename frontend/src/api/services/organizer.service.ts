import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import { ENV } from "@/config/environment";
import type {
  RegisterOrganizerPayload,
  RegisterOrganizerResponse,
  SendOtpPayload,
  VerifyLoginPayload,
  VerifyLoginResponse,
  VerifyOtpPayload,
  VerifyRegistrationOtpResponse,
  CreateBookingPayload,
  CreateBookingResponse,
  BookingDetails,
  CompleteBookingPayload,
  CompleteBookingResponse,
  OrganizerDashboardResponse,
  OrganizerEventStats,
  OrganizerProfileResponse,
  UpdateOrganizerProfilePayload,
  UpdateOrganizerBillingPayload,
  OrganizerBillingProfile,
  OrganizerNotificationsResponse,
  OrganizerGameResult,
  OrganizerInvoicesResponse,
} from "../types/organizer";

const noAuth = { auth: "none" as const };

export const organizerService = {
  /** Step 1: Register — sends OTP to email */
  register: (payload: RegisterOrganizerPayload) =>
    apiClient.post<RegisterOrganizerResponse>(
      API_ENDPOINTS.organizer.register,
      payload,
      noAuth
    ),

  /** Step 2: Verify registration OTP */
  verifyRegistrationOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<VerifyRegistrationOtpResponse>(
      API_ENDPOINTS.organizer.verifyOtp,
      payload,
      noAuth
    ),

  /** Resend OTP (registration or login) */
  resendOtp: (payload: SendOtpPayload) =>
    apiClient.post<null>(API_ENDPOINTS.organizer.resendOtp, payload, noAuth),

  /** Login Step 1: Send OTP */
  sendLoginOtp: (payload: SendOtpPayload) =>
    apiClient.post<null>(API_ENDPOINTS.organizer.login, payload, noAuth),

  /** Login Step 2: Verify OTP and receive JWT */
  verifyLoginOtp: (payload: VerifyLoginPayload) =>
    apiClient.post<VerifyLoginResponse>(
      API_ENDPOINTS.organizer.verifyLogin,
      payload,
      noAuth
    ),

  /** Step 3: Create pending booking */
  createBooking: (payload: CreateBookingPayload) =>
    apiClient.post<CreateBookingResponse>(
      API_ENDPOINTS.organizer.createBooking,
      payload,
      noAuth
    ),

  /** Review booking before payment */
  getBooking: (bookingId: number | string) =>
    apiClient.get<BookingDetails>(API_ENDPOINTS.organizer.booking(bookingId), noAuth),

  /** Dashboard data for authenticated organizer */
  getDashboard: () =>
    apiClient.get<OrganizerDashboardResponse>(API_ENDPOINTS.organizer.dashboard),

  getProfile: () =>
    apiClient.get<OrganizerProfileResponse>(API_ENDPOINTS.organizer.profile),

  updateProfile: (payload: UpdateOrganizerProfilePayload) =>
    apiClient.put<{ organizer: OrganizerProfileResponse["organizer"] }>(
      API_ENDPOINTS.organizer.profile,
      payload
    ),

  updateBilling: (payload: UpdateOrganizerBillingPayload) =>
    apiClient.put<{ billing: OrganizerBillingProfile }>(
      API_ENDPOINTS.organizer.profileBilling,
      payload
    ),

  /** Event stats for a booking (real-time) */
  getEventStats: (bookingId: number | string) =>
    apiClient.get<OrganizerEventStats>(API_ENDPOINTS.organizer.eventStats(bookingId)),

  getNotifications: (bookingId: number | string, params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    const query = qs.toString();
    const path = API_ENDPOINTS.organizer.notifications(bookingId);
    return apiClient.get<OrganizerNotificationsResponse>(query ? `${path}?${query}` : path);
  },

  markNotificationsRead: (bookingId: number | string) =>
    apiClient.post<{ marked: number; unread_count: number }>(
      API_ENDPOINTS.organizer.notificationsReadAll(bookingId),
      {}
    ),

  /** Update session date/time (reschedule) */
  updateSession: (payload: { booking_id: number | string; scheduled_date: string; scheduled_time: string }) =>
    apiClient.post<{ message: string }>(API_ENDPOINTS.organizer.updateSession, payload),

  /** Results tab — completed games with results-PDF availability */
  getResults: () =>
    apiClient.get<{ results: OrganizerGameResult[] }>(API_ENDPOINTS.organizer.results),

  /** Deactivate account (soft delete — billing/GST records retained) */
  deleteAccount: () => apiClient.post<null>(API_ENDPOINTS.organizer.deleteAccount, {}),

  /** Payment history — every booking this organizer has been billed for */
  getInvoices: () =>
    apiClient.get<OrganizerInvoicesResponse>(API_ENDPOINTS.organizer.invoices),

  /**
   * Downloads a booking's GST invoice PDF. Goes through fetch rather than
   * apiClient because the response is a binary stream, not JSON — but it still
   * sends the same bearer token, since the endpoint is ownership-scoped.
   */
  downloadInvoice: async (bookingId: number | string, invoiceNo?: string) => {
    const token = apiClient.getToken();
    const res = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.organizer.invoicePdf(bookingId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let message = "Could not download the invoice.";
      try {
        const body = await res.json();
        message = body?.message || message;
      } catch {
        /* non-JSON error body — keep the default message */
      }
      throw new Error(message);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${(invoiceNo ?? String(bookingId)).replace(/\//g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  /** Step 4: Complete booking and payment */
  completeBooking: (payload: CompleteBookingPayload) =>
    apiClient.post<CompleteBookingResponse>(
      API_ENDPOINTS.organizer.completeBooking,
      payload,
      noAuth
    ),
};
