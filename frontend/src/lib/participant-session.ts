const KEYS = {
  groupId: "participant_group_id",
  participantId: "participant_id",
  participantName: "participant_name",
  joinToken: "participant_join_token",
  inviteUrl: "participant_invite_url",
  gameSlug: "participant_game_slug",
} as const;

export function saveParticipantSession(data: {
  groupId: number | string;
  participantId: number | string;
  name: string;
  joinToken?: string;
  inviteUrl?: string;
  gameSlug?: string;
}) {
  localStorage.setItem(KEYS.groupId, String(data.groupId));
  localStorage.setItem(KEYS.participantId, String(data.participantId));
  localStorage.setItem(KEYS.participantName, data.name);
  if (data.joinToken) localStorage.setItem(KEYS.joinToken, data.joinToken);
  if (data.inviteUrl) localStorage.setItem(KEYS.inviteUrl, data.inviteUrl);
  if (data.gameSlug) localStorage.setItem(KEYS.gameSlug, data.gameSlug);
}

export function getParticipantSession() {
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
    inviteUrl: inviteUrl || undefined,
    gameSlug: gameSlug || undefined,
  };
}

export function clearParticipantSession() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("participant_lobby");
}
