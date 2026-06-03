import { e as apiClient } from "./router-DZhViOq_.js";
import { A as API_ENDPOINTS } from "./config-CafHMDrA.js";
const noAuth = { auth: "none" };
const organizerService = {
  /** Step 1: Register — sends OTP to email */
  register: (payload) => apiClient.post(
    API_ENDPOINTS.organizer.register,
    payload,
    noAuth
  ),
  /** Step 2: Verify registration OTP */
  verifyRegistrationOtp: (payload) => apiClient.post(
    API_ENDPOINTS.organizer.verifyOtp,
    payload,
    noAuth
  ),
  /** Resend OTP (registration or login) */
  resendOtp: (payload) => apiClient.post(API_ENDPOINTS.organizer.resendOtp, payload, noAuth),
  /** Login Step 1: Send OTP */
  sendLoginOtp: (payload) => apiClient.post(API_ENDPOINTS.organizer.login, payload, noAuth),
  /** Login Step 2: Verify OTP and receive JWT */
  verifyLoginOtp: (payload) => apiClient.post(
    API_ENDPOINTS.organizer.verifyLogin,
    payload,
    noAuth
  ),
  /** Step 3: Create pending booking */
  createBooking: (payload) => apiClient.post(
    API_ENDPOINTS.organizer.createBooking,
    payload,
    noAuth
  ),
  /** Review booking before payment */
  getBooking: (bookingId) => apiClient.get(API_ENDPOINTS.organizer.booking(bookingId), noAuth),
  /** Dashboard data for authenticated organizer */
  getDashboard: () => apiClient.get(API_ENDPOINTS.organizer.dashboard),
  getProfile: () => apiClient.get(API_ENDPOINTS.organizer.profile),
  updateProfile: (payload) => apiClient.put(
    API_ENDPOINTS.organizer.profile,
    payload
  ),
  updateBilling: (payload) => apiClient.put(
    API_ENDPOINTS.organizer.profileBilling,
    payload
  ),
  /** Event stats for a booking (real-time) */
  getEventStats: (bookingId) => apiClient.get(API_ENDPOINTS.organizer.eventStats(bookingId)),
  getNotifications: (bookingId, params) => {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    const query = qs.toString();
    const path = API_ENDPOINTS.organizer.notifications(bookingId);
    return apiClient.get(query ? `${path}?${query}` : path);
  },
  markNotificationsRead: (bookingId) => apiClient.post(
    API_ENDPOINTS.organizer.notificationsReadAll(bookingId),
    {}
  ),
  /** Update session date/time (reschedule) */
  updateSession: (payload) => apiClient.post(API_ENDPOINTS.organizer.updateSession, payload),
  /** Step 4: Complete booking and payment */
  completeBooking: (payload) => apiClient.post(
    API_ENDPOINTS.organizer.completeBooking,
    payload,
    noAuth
  )
};
export {
  organizerService as o
};
