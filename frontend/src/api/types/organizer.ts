import type { ApiPackage } from "./public";

export interface RegisterOrganizerPayload {
  name: string;
  email: string;
  company_name: string;
  company_website: string;
}

export interface RegisterOrganizerResponse {
  organizer_id: number;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyRegistrationOtpResponse {
  organizer_id: number;
}

export interface SendOtpPayload {
  email: string;
}

export interface VerifyLoginPayload {
  email: string;
  otp: string;
}

export interface OrganizerProfile {
  id: number;
  name: string;
  email: string;
  company_name?: string;
  company_website?: string;
  designation?: string;
  phone?: string;
  email_verified?: boolean;
  status?: string;
  payment_status?: string | null;
  account_status?: string | null;
}

export interface OrganizerBillingProfile {
  billing_id: number | null;
  booking_id: number;
  gst_number: string;
  billing_address: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method?: string | null;
  payment_status?: string | null;
  updated_at?: string | null;
}

export interface OrganizerProfileResponse {
  organizer: OrganizerProfile;
  billing: OrganizerBillingProfile | null;
}

export interface UpdateOrganizerProfilePayload {
  name: string;
  company_name: string;
  company_website?: string;
  designation?: string;
  phone?: string;
}

export interface UpdateOrganizerBillingPayload {
  gst_number?: string;
  billing_address: string;
  city: string;
  state: string;
  pin_code: string;
}

export interface VerifyLoginResponse {
  token: string;
  organizer: OrganizerProfile;
}

export interface DashboardBooking {
  booking_id: number;
  scheduled_date: string;
  scheduled_time: string;
  booking_status: string;
  invitation_link?: string | null;
  is_rescheduled: number;
  activity_name: string;
  cover_image: string;
  activity_icon?: string | null;
  game_duration_secs?: number | null;
  package_name: string;
  package_price: number | string;
  max_users: number;
  registered_participants: number;
  payment_date?: string | null;
}

export type OrganizerGameResult = {
  group_id: number;
  group_name: string;
  booking_id: number;
  activity_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: "completed" | "incomplete";
  completed_at: string | null;
  pdf_available: boolean;
  pdf_expires_at: string | null;
};

export interface OrganizerDashboardResponse {
  organizer: OrganizerProfile & { company_name?: string | null };
  bookings: DashboardBooking[];
  total_bookings: number;
}

export interface RecentGroup {
  id: number;
  name: string;
  fill_status: string; // e.g. "3/5"
  is_complete: boolean;
}

export interface RecentParticipant {
  name: string;
  email: string;
  joined_at: string;
  group_name?: string | null;
  group_id?: number | null;
}

export interface BookingParticipant {
  id: number;
  name: string | null;
  email: string | null;
  joined_at: string | null;
  group_id?: number | null;
  group_name?: string | null;
}

export interface BookingGroupMember {
  id: number;
  name: string;
  initials: string;
}

export interface BookingGroup {
  id: number;
  name: string;
  team_lead: string | null;
  member_count: number;
  capacity: number;
  status: "Complete" | "In Progress" | "Pending";
  last_updated: string | null;
  members: BookingGroupMember[];
}

export interface OrganizerEventStats {
  event_progress: {
    participants_joined: number;
    max_participants: number;
    groups_formed: number;
    max_groups: number;
    remaining_to_form_group: number;
    access_link_clicks: number | null;
  };
  event_status: {
    scheduled_at: string;
    reschedule_cutoff: string;
    is_reschedule_allowed: boolean;
    min_players_per_group: number;
  };
  recent_groups: RecentGroup[];
  recent_participants: RecentParticipant[];
  participants: BookingParticipant[];
  groups: BookingGroup[];
}

export interface RegistrationFormData {
  name: string;
  email: string;
  company_name: string;
  company_website: string;
  organizer_id: number | null;
}

export interface CreateBookingPayload {
  organizer_id: number;
  activity_id: number;
  game_id: number;
  package_id: number;
  scheduled_date: string;
  scheduled_time: string;
}

export interface CreateBookingResponse {
  booking_id: number;
}

export interface BookingDetails {
  booking_id: number;
  scheduled_date: string;
  scheduled_time: string;
  booking_status: string;
  invitation_link?: string | null;
  organizer_name: string;
  organizer_email: string;
  organizer_status: string;
  company_name: string;
  activity_name: string;
  game_name: string | null;
  package_name: string;
  package_price: number | string;
}

export interface BookingConsents {
  authorization: boolean;
  participant_consent: boolean;
  terms_accepted: boolean;
  non_refundable_accepted: boolean;
  validity_accepted: boolean;
}

export type PaymentMethodId = "razorpay" | "cod";

export interface CompleteBookingPayload {
  booking_id: number;
  gst_number?: string;
  billing_address: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method: PaymentMethodId;
  consents: BookingConsents;
}

/**
 * Response shape is method-dependent.
 *
 * COD returns `requires_payment: false` and the invitation link straight away.
 * Razorpay returns `requires_payment: true` plus the checkout parameters, and
 * withholds the link until the payment has been verified server-side.
 */
export interface CompleteBookingResponse {
  booking_id: number;
  payment_method: PaymentMethodId;
  payment_status: string;
  requires_payment: boolean;
  amount: number;
  /** Present for COD only. */
  invitation_link?: string;
  /** Present for Razorpay only. Never contains the key secret. */
  razorpay?: {
    key_id: string;
    order_id: string;
    /** In paise — Razorpay Checkout expects the smallest currency unit. */
    amount: number;
    currency: string;
  };
}

/** One selectable method as described by the server. */
export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  enabled: boolean;
  cta: string;
  unavailable_reason: string | null;
  /** Razorpay only — the instrument list to show under the option. */
  supported_methods?: string[];
  key_id?: string | null;
  mode?: "test" | "live" | null;
  /** COD only. */
  min_amount?: number | null;
  max_amount?: number | null;
}

export interface PaymentMethodsResponse {
  methods: PaymentMethodOption[];
  currency: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  booking_id: number;
  invitation_link: string;
  payment_status: string;
  newly_settled: boolean;
}

export interface PaymentStatusResponse {
  payment_status: string;
  payment_method: PaymentMethodId;
  gateway: string;
  amount: string | number;
  currency: string;
  booking_id: number;
  invitation_link: string | null;
  paid_at: string | null;
  failure_reason: string | null;
}

export interface SessionSetup {
  activityId: number | null;
  activityTitle: string;
  gameId: number | null;
  gameTitle: string;
  package: ApiPackage | null;
  scheduledDate: string;
  scheduledTime: string;
}

export type OrganizerNotificationItem = {
  id: number;
  booking_id: number;
  type: string;
  message: string;
  dot_color: string;
  participant_id: number | null;
  group_id: number | null;
  is_read: boolean;
  created_at: string;
};

export type OrganizerNotificationsResponse = {
  notifications: OrganizerNotificationItem[];
  unread_count: number;
  total: number;
};

/** One paid/pending booking in the organizer's payment history. */
export type OrganizerInvoice = {
  booking_id: number;
  invoice_no: string;
  invoice_date: string;
  package_name: string;
  activity_title: string | null;
  buyer_name: string;
  buyer_company: string | null;
  buyer_email: string | null;
  buyer_gstin: string | null;
  buyer_address: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  buyer_pin: string | null;
  taxable_value: number;
  additional_charges: number;
  gst_amount: number;
  total_payable: number;
  payment_method: string | null;
  payment_status: "pending" | "paid" | "failed";
  is_intra_state: boolean;
};

export type OrganizerInvoicesResponse = {
  invoices: OrganizerInvoice[];
  summary: {
    total_spent: number;
    completed_count: number;
    pending_count: number;
    failed_count: number;
  };
};
