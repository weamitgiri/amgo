import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import type {
  GameSummaryResponse,
  JoinLinkResponse,
  LobbySessionResponse,
  ParticipantJoinPayload,
  ParticipantVerifyOtpPayload,
  ParticipantVerifyOtpResponse,
} from "../types/participant";

const noAuth = { auth: "none" as const };

/** Step 1: Load activity by join link token (e.g. /join/amit → join-links/amit) */
export const participantService = {
  getJoinLink: (linkToken: string) =>
    apiClient.get<JoinLinkResponse>(API_ENDPOINTS.participant.joinLink(linkToken), noAuth),

  /** Step 2: Submit name & email — sends OTP */
  join: (payload: ParticipantJoinPayload) =>
    apiClient.post<{ email: string; dev_otp?: string }>(
      API_ENDPOINTS.participant.join,
      payload,
      noAuth
    ),

  /** Step 3: Verify OTP and assign group */
  verifyOtp: (payload: ParticipantVerifyOtpPayload) =>
    apiClient.post<ParticipantVerifyOtpResponse>(
      API_ENDPOINTS.participant.verifyOtp,
      payload,
      noAuth
    ),

  /** Step 4: Lobby session for assigned group */
  getLobby: (groupId: number | string, participantId?: number | string) => {
    const base = API_ENDPOINTS.participant.lobby(groupId);
    const qs =
      participantId != null
        ? `?participant_id=${encodeURIComponent(String(participantId))}`
        : "";
    return apiClient.get<LobbySessionResponse>(`${base}${qs}`, noAuth);
  },

  getGameSummary: (groupId: number | string, participantId?: number | string) => {
    const base = API_ENDPOINTS.participant.gameSummary(groupId);
    const qs =
      participantId != null
        ? `?participant_id=${encodeURIComponent(String(participantId))}`
        : "";
    return apiClient.get<GameSummaryResponse>(`${base}${qs}`, noAuth);
  },
};
