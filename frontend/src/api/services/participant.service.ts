import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import { ENV } from "@/config/environment";
import type {
  GameAnswer,
  GameQuestion,
  GameResultsResponse,
  GameSummaryResponse,
  JoinLinkResponse,
  LieDetectorRound,
  LieDetectorTally,
  LobbySessionResponse,
  ParticipantJoinPayload,
  ParticipantVerifyOtpPayload,
  ParticipantVerifyOtpResponse,
  SubmitAccusationResponse,
} from "../types/participant";

const noAuth = { auth: "none" as const };

export type GameStateSession = {
  id: number;
  group_id: number;
  participant_id: number;
  role_id: number | null;
  is_online: number;
  total_score: number;
  left_at: string | null;
  participant_name: string;
  role_type: string | null;
  character_name: string | null;
};

export type GameStateResponse = {
  group: {
    id: number;
    status: string;
    participant_sessions: GameStateSession[];
    timers: { id: number; timer_type: string; reference_id: number | null; expires_at: string; is_active: number }[];
    questions: GameQuestion[];
    lie_detector_rounds: LieDetectorRound[];
    my_accusation_submitted: boolean;
  };
  my_role: { id: number; role_type: string; character_name: string } | null;
  is_investigator: boolean;
};

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

  getGameState: (groupId: number | string, participantId: number | string) => {
    const base = API_ENDPOINTS.game.state(groupId);
    return apiClient.get<GameStateResponse>(
      `${base}?participant_id=${encodeURIComponent(String(participantId))}`,
      noAuth
    );
  },

  askQuestion: (payload: {
    group_id: number | string;
    participant_id: number | string;
    asked_to_session_id: number;
    question_text: string;
  }) => apiClient.post<GameQuestion>(API_ENDPOINTS.game.askQuestion, payload, noAuth),

  answerQuestion: (payload: {
    question_id: number;
    participant_id: number | string;
    answer_text: string;
  }) => apiClient.post<GameAnswer>(API_ENDPOINTS.game.answerQuestion, payload, noAuth),

  startLieDetector: (payload: {
    group_id: number | string;
    participant_id: number | string;
    suspect_session_id: number;
  }) => apiClient.post<LieDetectorRound>(API_ENDPOINTS.game.startLieDetector, payload, noAuth),

  voteLieDetector: (payload: {
    group_id: number | string;
    participant_id: number | string;
    round_id: number;
    vote_value: "believable" | "suspicious";
  }) => apiClient.post<LieDetectorTally>(API_ENDPOINTS.game.voteLieDetector, payload, noAuth),

  getLieDetectorTally: (roundId: number | string) =>
    apiClient.get<LieDetectorTally>(API_ENDPOINTS.game.lieDetectorTally(roundId), noAuth),

  endLieDetector: (payload: { group_id: number | string; participant_id: number | string; round_id: number }) =>
    apiClient.post<null>(API_ENDPOINTS.game.endLieDetector, payload, noAuth),

  usePasscard: (payload: { group_id: number | string; participant_id: number | string }) =>
    apiClient.post<null>(API_ENDPOINTS.game.usePasscard, payload, noAuth),

  reopenCaseSummary: (payload: { group_id: number | string; participant_id: number | string }) =>
    apiClient.post<null>(API_ENDPOINTS.game.reopenCaseSummary, payload, noAuth),

  submitAccusation: (payload: {
    group_id: number | string;
    participant_id: number | string;
    accused_session_id: number;
    reasoning: string;
  }) => apiClient.post<SubmitAccusationResponse>(API_ENDPOINTS.game.submitAccusation, payload, noAuth),

  getGameResults: (groupId: number | string, participantId?: number | string) =>
    apiClient.get<GameResultsResponse>(
      `${API_ENDPOINTS.results.get(groupId)}${
        participantId != null ? `?participant_id=${encodeURIComponent(String(participantId))}` : ""
      }`,
      noAuth
    ),

  getResultsPdfUrl: (groupId: number | string, participantId: number | string) =>
    `${ENV.API_BASE_URL}${API_ENDPOINTS.results.pdf(groupId)}?participant_id=${encodeURIComponent(String(participantId))}`,
};
