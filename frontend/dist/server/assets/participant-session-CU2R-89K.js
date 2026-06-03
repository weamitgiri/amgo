import { e as apiClient } from "./router-DZhViOq_.js";
import { A as API_ENDPOINTS } from "./config-CafHMDrA.js";
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
  }
};
const KEYS = {
  groupId: "participant_group_id",
  participantId: "participant_id",
  participantName: "participant_name",
  joinToken: "participant_join_token",
  inviteUrl: "participant_invite_url",
  gameSlug: "participant_game_slug"
};
function saveParticipantSession(data) {
  localStorage.setItem(KEYS.groupId, String(data.groupId));
  localStorage.setItem(KEYS.participantId, String(data.participantId));
  localStorage.setItem(KEYS.participantName, data.name);
  if (data.joinToken) localStorage.setItem(KEYS.joinToken, data.joinToken);
  if (data.inviteUrl) localStorage.setItem(KEYS.inviteUrl, data.inviteUrl);
  if (data.gameSlug) localStorage.setItem(KEYS.gameSlug, data.gameSlug);
}
function getParticipantSession() {
  const groupId = localStorage.getItem(KEYS.groupId);
  const participantId = localStorage.getItem(KEYS.participantId);
  const name = localStorage.getItem(KEYS.participantName);
  const inviteUrl = localStorage.getItem(KEYS.inviteUrl);
  const gameSlug = localStorage.getItem(KEYS.gameSlug);
  if (!groupId || !participantId) return null;
  return {
    groupId,
    participantId,
    name: name || "Participant",
    inviteUrl: inviteUrl || void 0,
    gameSlug: gameSlug || void 0
  };
}
function clearParticipantSession() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("participant_lobby");
}
export {
  clearParticipantSession as c,
  getParticipantSession as g,
  participantService as p,
  saveParticipantSession as s
};
