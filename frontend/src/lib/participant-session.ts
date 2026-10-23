const KEYS = {
  groupId: "participant_group_id",
  participantId: "participant_id",
  participantName: "participant_name",
  joinToken: "participant_join_token",
  inviteUrl: "participant_invite_url",
  gameSlug: "participant_game_slug",
} as const;

/** Per-tab storage so multiple participants can play in the same browser. */
const storage = (): Storage => {
  if (typeof window !== "undefined") {
    return sessionStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  } as unknown as Storage;
};

/**
 * Browser-wide (localStorage, shared by every tab) join token of the participant
 * this browser is currently playing as. Sent with join / verify-otp so the API
 * can refuse a second, different participant while that game is still running.
 */
const BROWSER_PARTICIPANT_TOKEN_KEY = "participant_browser_token";

export function getBrowserParticipantToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(BROWSER_PARTICIPANT_TOKEN_KEY);
}

/**
 * The join token this tab plays as, used to authorize the participant game APIs.
 * Prefers this tab's own session token (sessionStorage) and falls back to the
 * browser-wide lock token — equal now that one browser holds one participant.
 */
export function getParticipantToken(): string | null {
  const perTab = storage().getItem(KEYS.joinToken);
  return perTab || getBrowserParticipantToken();
}

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
  if (data.joinToken) {
    s.setItem(KEYS.joinToken, data.joinToken);
    if (typeof window !== "undefined") {
      localStorage.setItem(BROWSER_PARTICIPANT_TOKEN_KEY, data.joinToken);
    }
  }
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

/**
 * Game end / exit: forget only this player's temporary state in this browser.
 * Server-side history, scores and results are untouched.
 */
export function clearParticipantSession() {
  const s = storage();
  const groupId = s.getItem(KEYS.groupId);
  const participantId = s.getItem(KEYS.participantId);
  const joinToken = s.getItem(KEYS.joinToken);

  if (groupId && participantId) {
    const scopedSuffix = `_${groupId}_${participantId}`;
    const scoped: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const key = s.key(i);
      if (key && key.startsWith("game_") && key.endsWith(scopedSuffix)) scoped.push(key);
    }
    scoped.forEach((k) => s.removeItem(k));
    s.removeItem(`results_rating_${groupId}`);
  }

  Object.values(KEYS).forEach((k) => s.removeItem(k));
  s.removeItem("participant_lobby");

  // Release the browser for another participant — but only if this tab owns it.
  if (typeof window !== "undefined" && joinToken && getBrowserParticipantToken() === joinToken) {
    localStorage.removeItem(BROWSER_PARTICIPANT_TOKEN_KEY);
  }
}
