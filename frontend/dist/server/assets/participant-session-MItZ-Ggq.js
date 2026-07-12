import { jsx } from "react/jsx-runtime";
import { E as ENV, a as apiClient } from "./router-qdPwl0jo.js";
import { A as API_ENDPOINTS } from "./config-qISbZfHI.js";
const step4 = "/assets/h-logo-DlqTePzf.png";
function Logo({ light = false }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2.5", children: /* @__PURE__ */ jsx(
    "img",
    {
      src: step4,
      className: ""
    }
  ) });
}
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
  getGameResults: (groupId) => apiClient.get(API_ENDPOINTS.results.get(groupId), noAuth),
  getResultsPdfUrl: (groupId, participantId) => `${ENV.API_BASE_URL}${API_ENDPOINTS.results.pdf(groupId)}?participant_id=${encodeURIComponent(String(participantId))}`
};
const KEYS = {
  groupId: "participant_group_id",
  participantId: "participant_id",
  participantName: "participant_name",
  joinToken: "participant_join_token",
  inviteUrl: "participant_invite_url",
  gameSlug: "participant_game_slug"
};
const storage = () => sessionStorage;
function saveParticipantSession(data) {
  const s = storage();
  s.setItem(KEYS.groupId, String(data.groupId));
  s.setItem(KEYS.participantId, String(data.participantId));
  s.setItem(KEYS.participantName, data.name);
  if (data.joinToken) s.setItem(KEYS.joinToken, data.joinToken);
  if (data.inviteUrl) s.setItem(KEYS.inviteUrl, data.inviteUrl);
  if (data.gameSlug) s.setItem(KEYS.gameSlug, data.gameSlug);
}
function getParticipantSession() {
  const s = storage();
  const groupId = s.getItem(KEYS.groupId);
  const participantId = s.getItem(KEYS.participantId);
  const name = s.getItem(KEYS.participantName);
  const inviteUrl = s.getItem(KEYS.inviteUrl);
  const gameSlug = s.getItem(KEYS.gameSlug);
  if (!groupId || !participantId) return null;
  return {
    groupId,
    participantId,
    name: name || "Participant",
    inviteUrl: inviteUrl || void 0,
    gameSlug: gameSlug || void 0
  };
}
function participantGameKey(suffix, groupId, participantId) {
  return `game_${suffix}_${groupId}_${participantId}`;
}
function clearParticipantSession() {
  const s = storage();
  Object.values(KEYS).forEach((k) => s.removeItem(k));
  s.removeItem("participant_lobby");
}
export {
  Logo as L,
  participantGameKey as a,
  clearParticipantSession as c,
  getParticipantSession as g,
  participantService as p,
  saveParticipantSession as s
};
