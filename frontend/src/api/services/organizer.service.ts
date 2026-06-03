import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
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

  /** Step 4: Complete booking and payment */
  completeBooking: (payload: CompleteBookingPayload) =>
    apiClient.post<CompleteBookingResponse>(
      API_ENDPOINTS.organizer.completeBooking,
      payload,
      noAuth
    ),
};
