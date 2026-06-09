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
  package_name: string;
  package_price: number | string;
  max_users: number;
  registered_participants: number;
}

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
  name: string;
  email: string;
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

export interface CompleteBookingPayload {
  booking_id: number;
  gst_number?: string;
  billing_address: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method: string;
  consents: BookingConsents;
}

export interface CompleteBookingResponse {
  booking_id: number;
  invitation_link: string;
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
