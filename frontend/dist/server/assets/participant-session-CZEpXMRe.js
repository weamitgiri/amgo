const KEYS = {
  groupId: "participant_group_id",
  participantId: "participant_id",
  participantName: "participant_name",
  joinToken: "participant_join_token",
  inviteUrl: "participant_invite_url",
  gameSlug: "participant_game_slug"
};
const storage = () => {
  if (typeof window !== "undefined") {
    return sessionStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {
    },
    removeItem: () => {
    },
    clear: () => {
    },
    length: 0,
    key: () => null
  };
};
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
  clearParticipantSession as c,
  getParticipantSession as g,
  participantGameKey as p,
  saveParticipantSession as s
};
