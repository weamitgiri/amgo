const KEYS = {
  groupId: "participant_group_id",
  participantId: "participant_id",
  participantName: "participant_name",
  joinToken: "participant_join_token",
  inviteUrl: "participant_invite_url",
  gameSlug: "participant_game_slug",
} as const;

/** Per-tab storage so multiple participants can play in the same browser. */
const storage = (): Storage => sessionStorage;

export function saveParticipantSession(data: {
  groupId: number | string;
  participantId: number | string;
  name: string;
  joinToken?: string;
  inviteUrl?: string;
  gameSlug?: string;
}) {
  const s = storage();
  s.setItem(KEYS.groupId, String(data.groupId));
  s.setItem(KEYS.participantId, String(data.participantId));
  s.setItem(KEYS.participantName, data.name);
  if (data.joinToken) s.setItem(KEYS.joinToken, data.joinToken);
  if (data.inviteUrl) s.setItem(KEYS.inviteUrl, data.inviteUrl);
  if (data.gameSlug) s.setItem(KEYS.gameSlug, data.gameSlug);
}

export function getParticipantSession() {
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
    inviteUrl: inviteUrl || undefined,
    gameSlug: gameSlug || undefined,
  };
}

/** Scoped key for per-participant game UI state (secret box, timers, etc.). */
export function participantGameKey(
  suffix: string,
  groupId: string | number,
  participantId: string | number
) {
  return `game_${suffix}_${groupId}_${participantId}`;
}

export function clearParticipantSession() {
  const s = storage();
  Object.values(KEYS).forEach((k) => s.removeItem(k));
  s.removeItem("participant_lobby");
}
