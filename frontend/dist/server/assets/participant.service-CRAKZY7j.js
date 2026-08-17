import { E as ENV, a as apiClient } from "./router-BvkvNwFV.js";
import { A as API_ENDPOINTS } from "./config-OQZNPa_v.js";
const noAuth = { auth: "none" };
const participantService = {
  getJoinLink: (linkToken) => apiClient.get(API_ENDPOINTS.participant.joinLink(linkToken), noAuth),
  /** Step 2: Submit name & email — sends OTP */
  join: (payload) => apiClient.post(
    API_ENDPOINTS.participant.join,
    payload,
    noAuth
  ),
  /** Step 3: Verify OTP and assign group */
  verifyOtp: (payload) => apiClient.post(
    API_ENDPOINTS.participant.verifyOtp,
    payload,
    noAuth
  ),
  /** Step 4: Lobby session for assigned group */
  getLobby: (groupId, participantId) => {
    const base = API_ENDPOINTS.participant.lobby(groupId);
    const qs = participantId != null ? `?participant_id=${encodeURIComponent(String(participantId))}` : "";
    return apiClient.get(`${base}${qs}`, noAuth);
  },
  getGameSummary: (groupId, participantId) => {
    const base = API_ENDPOINTS.participant.gameSummary(groupId);
    const qs = participantId != null ? `?participant_id=${encodeURIComponent(String(participantId))}` : "";
    return apiClient.get(`${base}${qs}`, noAuth);
  },
  getGameState: (groupId, participantId) => {
    const base = API_ENDPOINTS.game.state(groupId);
    return apiClient.get(
      `${base}?participant_id=${encodeURIComponent(String(participantId))}`,
      noAuth
    );
  },
  askQuestion: (payload) => apiClient.post(API_ENDPOINTS.game.askQuestion, payload, noAuth),
  answerQuestion: (payload) => apiClient.post(API_ENDPOINTS.game.answerQuestion, payload, noAuth),
  startLieDetector: (payload) => apiClient.post(API_ENDPOINTS.game.startLieDetector, payload, noAuth),
  voteLieDetector: (payload) => apiClient.post(API_ENDPOINTS.game.voteLieDetector, payload, noAuth),
  getLieDetectorTally: (roundId) => apiClient.get(API_ENDPOINTS.game.lieDetectorTally(roundId), noAuth),
  endLieDetector: (payload) => apiClient.post(API_ENDPOINTS.game.endLieDetector, payload, noAuth),
  usePasscard: (payload) => apiClient.post(API_ENDPOINTS.game.usePasscard, payload, noAuth),
  reopenCaseSummary: (payload) => apiClient.post(API_ENDPOINTS.game.reopenCaseSummary, payload, noAuth),
  submitAccusation: (payload) => apiClient.post(API_ENDPOINTS.game.submitAccusation, payload, noAuth),
  getGameResults: (groupId, participantId) => apiClient.get(
    `${API_ENDPOINTS.results.get(groupId)}${participantId != null ? `?participant_id=${encodeURIComponent(String(participantId))}` : ""}`,
    noAuth
  ),
  getResultsPdfUrl: (groupId, participantId) => `${ENV.API_BASE_URL}${API_ENDPOINTS.results.pdf(groupId)}?participant_id=${encodeURIComponent(String(participantId))}`
};
export {
  participantService as p
};
