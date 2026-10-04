import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FileText, Lightbulb, Gamepad2, Camera, X, MapPin, Calendar, Cloud, Video,
  ZoomIn, ShieldCheck, Eye, Send, Clock, UserX, ScanSearch,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { participantService } from "@/api/services/participant.service";
import type { GameStateResponse } from "@/api/services/participant.service";
import type { GameSummaryResponse, GameSummaryRole, GamePlayer, LieDetectorTally } from "@/api/types/participant";
import { getParticipantSession, participantGameKey } from "@/lib/participant-session";
import { getSocket } from "@/lib/socket";
import { resolveMediaUrl } from "@/utils/media";
import { isCookAndCreateSlug } from "@/utils/common";
import { toastError } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";
import mqlogo from "@/assets/mqlogo.png";
import top from "@/assets/top-s.png";
import secretBoxImg from "@/assets/secret_box.png";
import gameTop from "@/assets/game-top-img.png";
import caseCollage from "@/assets/game-summery/case-summary-collage.png";
import suspectBanner from "@/assets/game-summery/Group 1000004660.png";

import ri1 from "@/assets/role-icon/1.png";
import ri2 from "@/assets/role-icon/2.png";
import ri3 from "@/assets/role-icon/3.png";


type GameSearch = { game?: string };

export const Route = createFileRoute("/game")({
  validateSearch: (search: Record<string, unknown>): GameSearch => ({
    game: typeof search.game === "string" ? search.game : undefined,
  }),
  head: () => ({ meta: [{ title: "Mystery Quest — Case Summary" }] }),
  component: GamePage,
});

type GamePerson = GameSummaryRole & { role: string; youKnow: string[]; keep: string[] };

function useCountdown(initialSeconds: number, onTimeout: (() => void) | undefined) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onTimeoutRef = useRef(onTimeout);

  // Keep onTimeoutRef updated with latest onTimeout
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);


  useEffect(() => {
    // Reset timer if initialSeconds changes
    setSeconds(initialSeconds);
    let timeoutCalled = false;

    const intervalId = setInterval(() => {
      setSeconds((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0 && !timeoutCalled && onTimeoutRef.current) {
          timeoutCalled = true;
          onTimeoutRef.current();
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [initialSeconds]); // Only depend on initialSeconds!

  return seconds;
}

/**
 * Display-only countdown for the answering player's response window. Derives the
 * remaining time from when the question was asked (askedAt) so every observer —
 * the Investigator and the other suspects — sees the same clock, even after a
 * page reload. Clamped to [0, totalSecs] so server/browser timezone skew can
 * never show a negative or inflated value.
 */
function AnswerCountdown({
  askedAt,
  totalSecs,
  className,
}: {
  askedAt?: string;
  totalSecs: number;
  className?: string;
}) {
  const computeRemaining = useCallback(() => {
    if (!askedAt) return totalSecs;
    const started = new Date(askedAt.replace(" ", "T")).getTime();
    if (Number.isNaN(started)) return totalSecs;
    const elapsed = Math.floor((Date.now() - started) / 1000);
    return Math.min(totalSecs, Math.max(0, totalSecs - elapsed));
  }, [askedAt, totalSecs]);

  const [remaining, setRemaining] = useState(computeRemaining);

  useEffect(() => {
    setRemaining(computeRemaining());
    const id = setInterval(() => setRemaining(computeRemaining()), 1000);
    return () => clearInterval(id);
  }, [computeRemaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return <span className={className}>{mm}:{ss}</span>;
}

/** Ticking mm:ss countdown to an absolute deadline (ms epoch) — used for the
 * Lie Detector round timer so all players see the same server-driven clock. */
function DeadlineCountdown({ endsAtMs, className }: { endsAtMs: number | null; className?: string }) {
  const compute = useCallback(
    () => (endsAtMs == null ? 0 : Math.max(0, Math.floor((endsAtMs - Date.now()) / 1000))),
    [endsAtMs]
  );
  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    setRemaining(compute());
    const id = setInterval(() => setRemaining(compute()), 1000);
    return () => clearInterval(id);
  }, [compute]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return <span className={className}>{mm}:{ss}</span>;
}

/** Small circular avatar for the Recent Activity feed: the player's role
 * portrait when available, otherwise their initials. */
function ActivityAvatar({ image, fallback }: { image?: string | null; fallback: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="h-8 w-8 rounded-full bg-black/40 overflow-hidden shrink-0 border border-white/10 grid place-items-center text-[10px] text-white font-bold">
      {image && !failed ? (
        <img src={image} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover object-top" />
      ) : (
        fallback
      )}
    </div>
  );
}

/**
 * Player/role portrait that shows an initials chip when there's no image OR the
 * image fails to load — a missing file, a stale deploy, or a wrong storage base
 * URL then degrades to a clean initials circle instead of a broken-image icon.
 * Also uses `h-full w-full object-cover` so portraits fill the circle without the
 * bottom-cropping that a width-only <img> produced.
 */
function RoleAvatar({
  src,
  fallback,
  gradient,
  fallbackTextClass = "",
}: {
  src?: string | null;
  fallback: string;
  gradient: string;
  fallbackTextClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    // The role portraits are tall (~1:2) with the face in the TOP third. `object-top`
    // anchors the crop to the top so the circle frames the FACE — plain `object-cover`
    // centers and would show the torso/chest and cut the head off.
    return <img src={src} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover object-top" />;
  }
  return (
    <div className={`h-full w-full bg-gradient-to-br ${gradient} grid place-items-center font-bold text-white ${fallbackTextClass}`}>
      {fallback}
    </div>
  );
}

/**
 * Grid for player cards. Every card gets the same width AND height (auto-rows-fr),
 * and the columns stretch so the row always ends at the panel's right edge — no
 * empty gap after the last card, whatever the player count or screen width.
 */
function PlayerCardGrid({ children, minCardPx = 112 }: { children: ReactNode; minCardPx?: number }) {
  return (
    <div
      className="grid auto-rows-fr gap-x-4 gap-y-7"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minCardPx}px, 1fr))` }}
    >
      {children}
    </div>
  );
}

/** One player card: circular portrait on top, name + public character below. */
function PlayerCard({
  player,
  index,
  selected = false,
  avatarClass = "h-[84px] w-[84px]",
}: {
  player: GamePlayer;
  index: number;
  selected?: boolean;
  avatarClass?: string;
}) {
  return (
    <div
      className={`relative h-full w-full rounded-2xl flex flex-col items-center gap-3 px-2 pt-4 pb-5 border transition-all ${
        selected ? "border-[#c492ed] bg-[#c492ed]/10" : "border-[#4a3473] hover:border-purple-400/60"
      }`}
    >
      <div className={`${avatarClass} rounded-full overflow-hidden shadow-lg shrink-0`}>
        <RoleAvatar
          src={player.role_image ? resolveMediaUrl(player.role_image) : null}
          fallback={player.pseudonym.slice(0, 2).toUpperCase()}
          gradient={PLAYER_GRADS[index % PLAYER_GRADS.length]}
          fallbackTextClass="text-2xl"
        />
      </div>
      <div className="w-full min-w-0 flex flex-col items-center gap-0.5 text-center leading-tight">
        <span className="text-[14px] text-white break-words">
          {player.pseudonym}
          {player.is_you && <span className="text-white/70"> (You)</span>}
        </span>
        {player.character_name && (
          <span className="text-[11px] text-purple-300/90 break-words">{player.character_name}</span>
        )}
      </div>
      {selected && (
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-[#1a0f2e] border-[3px] border-[#c492ed] flex items-center justify-center">
          <div className="h-3 w-3 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
}

function mapRoleToPerson(r: GameSummaryRole): GamePerson {
  return {
    ...r,
    role: r.role_label,
    youKnow: r.you_know,
    keep: r.keep_in_mind,
  };
}

const FACT_ICONS: Record<string, typeof MapPin> = {
  location: MapPin,
  calendar: Calendar,
  cloud: Cloud,
  video: Video,
};

type Phase = "summary" | "investigation";
type ModalKey = null | "question" | "answer" | "vote" | "clue" | "accuse" | "summary";
type GuideType = null | "strategy" | "rules";

const KEY_PEOPLE_ORDER = [
  "farmer leader",
  "farmer-leader",
  "son",
  "daughter-in-law",
  "daughter in law",
  "servant",
  "investigator",
];

type ActivityItem = {
  questionId: number;
  toSessionId: number;
  q: string;
  a?: string;
  autoSkipped?: boolean;
  tally?: LieDetectorTally;
  fromSessionId?: number;
  askedAt?: string;
  isLie?: boolean;
};

function GamePage() {
  const navigate = useNavigate();
  const { game: gameSlug } = Route.useSearch();
  const session = useMemo(() => getParticipantSession(), []);

  const slugCandidate = gameSlug ?? session?.gameSlug;
  useEffect(() => {
    if (isCookAndCreateSlug(slugCandidate)) {
      navigate({
        to: "/cookandcreate/game",
        search: { game: slugCandidate ?? "" },
      });
    }
  }, [slugCandidate, navigate]);

  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<GameSummaryResponse | null>(null);
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("summary");
  const [secsHdr, setSecsHdr] = useState(0);
  const [secsCase, setSecsCase] = useState(0);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [secretOpened, setSecretOpened] = useState(false);
  const [roleViewed, setRoleViewed] = useState(false);
  const [openPhotos, setOpenPhotos] = useState(false);
  const [guideModal, setGuideModal] = useState<GuideType>(null);
  const [guideSlide, setGuideSlide] = useState(0);
  const [showInstinctWarning, setShowInstinctWarning] = useState(false);
  // SSR renders with no sessionStorage (so no session), the client has one — rendering
  // real content before the client has mounted causes a hydration mismatch that can
  // leave buttons unresponsive in the production build. Gate the first paint on mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [cluesUnlocked, setCluesUnlocked] = useState(false);
  const [lieDetectorRoundId, setLieDetectorRoundId] = useState<number | null>(null);
  // Absolute deadline (ms epoch) of the active Lie Detector round, and how many
  // of the max-3 lie questions the Investigator has spent so far.
  const [lieEndsAt, setLieEndsAt] = useState<number | null>(null);
  const [lieQuestionsUsed, setLieQuestionsUsed] = useState(0);
  // The Lie Detector is once per game: true as soon as a round has been started (by
  // us or seen in the room/state) and it stays true after the round closes, so the
  // header button stays disabled for good and clicking it does nothing.
  const [lieDetectorUsed, setLieDetectorUsed] = useState(false);
  const [isStartingLie, setIsStartingLie] = useState(false);
  // Refs read by the shared "register" helpers below so an event that arrives twice
  // (the HTTP response AND the socket broadcast for the same action) is applied once.
  const lieRoundIdRef = useRef<number | null>(null);
  const knownQuestionIdsRef = useRef<Set<number>>(new Set());
  const [myAccusationSubmitted, setMyAccusationSubmitted] = useState(false);
  // When the main game clock runs out the server opens a fixed final-accusation
  // window (2 minutes). Until then the Final Accusation button stays locked; once
  // this deadline is set, every player is forced into the accusation screen.
  const [finalVerdictEndsAt, setFinalVerdictEndsAt] = useState<number | null>(null);
  const [onlineSessionIds, setOnlineSessionIds] = useState<Set<number>>(new Set());
  const [frozenSessionIds, setFrozenSessionIds] = useState<Set<number>>(new Set());
  const [scoresBySessionId, setScoresBySessionId] = useState<Map<number, number>>(new Map());
  const [devSkipping, setDevSkipping] = useState(false); // DEV: remove before production
  // Investigator-only timed suspect cards: once a card's scheduled window has been
  // dismissed we don't force it back open for the rest of that window.
  const [dismissedForcedCards, setDismissedForcedCards] = useState<Set<number>>(new Set());

  const people = useMemo(
    () => (gameData?.roles ?? []).map(mapRoleToPerson),
    [gameData]
  );

  // Real players (pseudonyms only) — the gameplay UI (questions, votes,
  // accusations, scoreboard) is keyed on players, never on the character↔player
  // mapping, which stays secret for everyone except yourself.
  const players = useMemo(() => gameData?.players ?? [], [gameData]);
  const myPlayer = useMemo(() => players.find((p) => p.is_you) ?? null, [players]);

  const yourPerson = useMemo(() => people.find((p: GamePerson) => p.is_you) ?? null, [people]);
  const isInvestigator = yourPerson?.role_type === "investigator";
  // The culprit's role_type is stored as "hidden culprit" (admin dropdown value),
  // so match by substring — an exact "culprit" check left isCulprit permanently
  // false, which let the culprit see and use the Final Accusation UI.
  const isCulprit = (yourPerson?.role_type ?? "").toLowerCase().includes("culprit");

  // Strategy guide content, per role:
  //  • Non-investigator roles → their OWN strategy cards (role_strategy_slides),
  //    opened from the Case Summary "Strategy Guide" button.
  //  • Investigator → the header "Strategy Cards" button opens ALL the suspect
  //    Investigator Cards (same source as the timed pop-ups, strategy_slides), one
  //    per slide, so the Investigator can review every suspect's profile on demand.
  //    The timing (appears/closes) only drives the forced pop-ups, not this button.
  // Game Rules stay available to everyone.
  const guideSlides = useMemo(
    () => ({
      strategy: isInvestigator
        ? (gameData?.strategy_slides ?? []).map((s) => ({
            title: s.title,
            description: s.description,
            details: s.details,
          }))
        : gameData?.role_strategy_slides ?? [],
      rules: gameData?.rules ?? [],
    }),
    [gameData, isInvestigator]
  );

  // Investigator-only TIMED suspect cards (strategy_slides / investigator_cards).
  // Each carries an appears_at_secs / closes_at_secs schedule (measured from the
  // start of the investigation phase, set per-card in admin). The matching card
  // FORCEFULLY pops up when its window opens and auto-closes when it ends. Only the
  // Investigator ever receives strategy_slides, so no other role sees these.
  const forcedStrategyCard = useMemo(() => {
    if (!isInvestigator || phase !== "investigation" || !gameData) return null;
    const cards = gameData.strategy_slides ?? [];
    if (cards.length === 0) return null;
    // secsHdr during Investigation = questioning seconds remaining. Elapsed since the
    // investigation began = full questioning duration − what's left.
    const questioningSecs = Math.max(
      (gameData.settings.game_duration_secs ?? 1500) - (gameData.settings.case_summary_view_secs ?? 300),
      60
    );
    const elapsed = questioningSecs - secsHdr;
    const active = cards.find(
      (c) =>
        (c.closes_at_secs ?? 0) > (c.appears_at_secs ?? 0) &&
        (c.appears_at_secs ?? 0) <= elapsed &&
        elapsed < (c.closes_at_secs ?? 0)
    );
    if (!active || dismissedForcedCards.has(active.appears_at_secs)) return null;
    return active;
  }, [isInvestigator, phase, gameData, secsHdr, dismissedForcedCards]);

  const photoUrls = useMemo(
    () =>
      (gameData?.photos ?? []).map(
        (p: { image: string | null }) => resolveMediaUrl(p.image) ?? mystery
      ),
    [gameData]
  );

  // investigation state
  const lieMode = lieDetectorRoundId !== null;
  const finalVerdictActive = finalVerdictEndsAt !== null;
  const [selectedAskee, setSelectedAskee] = useState(0);
  // Index 0 is usually the Investigator themself (a disabled card), which left the
  // selection on "You" and made Send Question silently do nothing. Keep the
  // selection on someone who can actually be asked.
  useEffect(() => {
    const canAsk = (p?: GamePlayer) => !!p && !p.is_you && !frozenSessionIds.has(Number(p.session_id));
    if (players.length === 0 || canAsk(players[selectedAskee])) return;
    const next = players.findIndex((p) => canAsk(p));
    if (next !== -1) setSelectedAskee(next);
  }, [players, frozenSessionIds, selectedAskee]);
  const [question, setQuestion] = useState("");
  const [modal, setModal] = useState<ModalKey>(null);
  // Normal (non-Lie-Detector) questions the Investigator has spent so far —
  // lie-round questions come out of their own separate 3-question budget.
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pendingAnswerForMe, setPendingAnswerForMe] = useState<ActivityItem | null>(null);
  const [answerTimeoutPenalty, setAnswerTimeoutPenalty] = useState(0);
  // Guards against a fast double-click firing two answerQuestion requests before
  // either resolves — pendingAnswerForMe only clears on success, so without this
  // both clicks would go out (the backend now rejects the loser via a DB unique
  // constraint, but this avoids the round-trip and the error toast entirely).
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  // Same guard, for the Investigator's "Send Question" button — `question` (the
  // textarea) isn't cleared until the request resolves, so a fast double-click
  // could otherwise fire two askQuestion requests before either completes.
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  const handleAnswerTimeout = useCallback(() => {
    // Don't close the modal yet, just handle timeout logic (we'll wait for new_answer event from server to close)
    setAnswerTimeoutPenalty(-10);
  }, []);
  const [voteContext, setVoteContext] = useState<{ questionId: number; answerText: string; answererSessionId: number } | null>(null);
  // Lie-detector answers this player has already dealt with THIS session — voted on
  // OR dismissed. The resync (applyGameState) checks this so it never re-opens the
  // Believable/Suspicious popup for an answer the player is done with, even in the
  // brief window before the server's my_lie_votes reflects a just-cast vote, and even
  // when the player chose to dismiss without voting. my_lie_votes still covers the
  // cross-reload case for votes that actually persisted.
  const handledVoteQuestionIds = useRef<Set<number>>(new Set());
  const [lieTally, setLieTally] = useState<LieDetectorTally | null>(null);
  // Vote tallies are per-answer (per lie-detector question), keyed by question id —
  // a single round can have several questioned answers, each with its own count.
  const [tallyByQuestionId, setTallyByQuestionId] = useState<Map<number, LieDetectorTally>>(new Map());
  // Lie Detector round length (secs) kept in a ref so socket handlers can start
  // the local countdown without re-subscribing when gameData loads.
  const lieTimerSecsRef = useRef(420);
  useEffect(() => {
    if (gameData) lieTimerSecsRef.current = gameData.settings.lie_detector_timer_secs || 420;
  }, [gameData]);

  const applyGameState = useCallback((state: GameStateResponse) => {
    setGameState(state);
    setMyAccusationSubmitted(Boolean(state.group.my_accusation_submitted));

    // Game already finalized (verdict computed) — e.g. the page was reloaded after
    // the final-accusation window closed. Go straight to results.
    if (state.group.status === "completed" || state.group.status === "incomplete") {
      if (session?.groupId && session.participantId) {
        sessionStorage.setItem(participantGameKey("ended", session.groupId, session.participantId), "1");
      }
      navigate({ to: "/results" });
      return;
    }

    // Server-authoritative game clock — identical for every player regardless of
    // when they loaded/reloaded (the local per-second interval just ticks these
    // down until the next state sync).
    if (typeof state.group.game_seconds_remaining === "number") {
      setSecsHdr(state.group.game_seconds_remaining);
    }
    if (typeof state.group.case_summary_seconds_remaining === "number") {
      setSecsCase(state.group.case_summary_seconds_remaining);
      // Phase is STICKY forward: once a player has moved to Investigation they never
      // get yanked back to the Case Summary screen by a slightly-behind server clock
      // reading case_summary_seconds_remaining > 0 (client/server drift near the
      // transition otherwise caused a flicker back to Case Summary). Only advance
      // summary → investigation, never the reverse. (The in-game "Case Summary"
      // button is a modal, not this phase, so it's unaffected.)
      setPhase((prev) =>
        prev === "investigation"
          ? "investigation"
          : (state.group.case_summary_seconds_remaining ?? 0) > 0
            ? "summary"
            : "investigation"
      );
    }

    const online = new Set<number>();
    const frozen = new Set<number>();
    const scores = new Map<number, number>();
    for (const s of state.group.participant_sessions) {
      const sid = Number(s.id);
      if (s.is_online) online.add(sid);
      if (s.left_at) frozen.add(sid);
      scores.set(sid, Number(s.total_score));
    }
    setOnlineSessionIds(online);
    setFrozenSessionIds(frozen);
    setScoresBySessionId(scores);

    const activeRound = state.group.lie_detector_rounds.find((r) => r.status === "active");
    setLieDetectorRoundId(activeRound ? Number(activeRound.id) : null);
    lieRoundIdRef.current = activeRound ? Number(activeRound.id) : null;
    // Any round in the state (running OR already finished) means the once-per-game
    // Lie Detector has been used.
    if (state.group.lie_detector_rounds.length > 0) setLieDetectorUsed(true);

    // Lie Detector round deadline comes from the server's timer row so every
    // player (and a reloaded page) sees the same countdown.
    const lieTimer = activeRound
      ? state.group.timers.find((t) => t.timer_type === "lie_detector" && t.is_active && Number(t.reference_id) === Number(activeRound.id))
      : null;
    setLieEndsAt(lieTimer ? new Date(lieTimer.expires_at.replace(" ", "T")).getTime() : null);

    // Questions asked inside a Lie Detector round's time window (round start →
    // round end, or now while still active) belong to that round's separate
    // 3-question budget, not the normal questioning budget.
    const parseMs = (v?: string) => {
      if (!v) return NaN;
      return new Date(v.replace(" ", "T")).getTime();
    };
    const isLieQuestion = (createdAt?: string) => {
      const ts = parseMs(createdAt);
      if (Number.isNaN(ts)) return false;
      return state.group.lie_detector_rounds.some((r) => {
        const start = parseMs(r.created_at);
        if (Number.isNaN(start) || ts < start) return false;
        if (r.status === "active") return true;
        const end = parseMs(r.updated_at);
        return !Number.isNaN(end) && ts <= end;
      });
    };

    // Authoritative unlock flag from the server (the active-only timers list can't
    // report an already-fired unlock timer, so a reload would otherwise re-lock it).
    if (state.group.clues_unlocked) setCluesUnlocked(true);

    // If the final-accusation window is already open (page reloaded during it),
    // reopen the forced screen with the server's remaining time.
    const finalTimer = state.group.timers.find((t) => t.timer_type === "final_verdict" && t.is_active);
    setFinalVerdictEndsAt(finalTimer ? new Date(finalTimer.expires_at.replace(" ", "T")).getTime() : null);

    // Per-answer vote tallies (keyed by question id) hydrated from the server so a
    // reloaded page shows each answer's own believable/suspicious count.
    const voteTallies = new Map<number, LieDetectorTally>();
    for (const [qid, t] of Object.entries(state.group.lie_vote_tallies ?? {})) {
      voteTallies.set(Number(qid), t as LieDetectorTally);
    }
    setTallyByQuestionId(voteTallies);

    // Build activity items
    const activityItems = state.group.questions.map((q) => {
      const isLie = isLieQuestion(q.created_at);
      const ans = q.answers?.[0];
      // Question ids arrive from the server as strings; coerce so the numeric
      // tally maps (keyed by Number) actually match — otherwise every lie
      // question's Believable/Suspicious tally silently reads as 0.
      const qid = Number(q.id);
      return {
        questionId: qid,
        toSessionId: q.asked_to,
        fromSessionId: q.asked_by,
        askedAt: q.created_at,
        q: q.question_text,
        a: ans?.answer_text,
        autoSkipped: ans?.auto_skipped,
        tally: isLie ? voteTallies.get(qid) : undefined,
        isLie,
      };
    });
    setQuestionsUsed(activityItems.filter((item) => !item.isLie).length);
    setLieQuestionsUsed(activityItems.filter((item) => item.isLie).length);
    knownQuestionIdsRef.current = new Set(activityItems.map((item) => item.questionId));
    setActivity(activityItems);

    // Check if there's an unanswered question for the current player and set pendingAnswerForMe
    const unansweredQuestionForMe = activityItems.find((item) => !item.a && Number(item.toSessionId) === Number(myPlayer?.session_id));
    if (unansweredQuestionForMe) {
      setPendingAnswerForMe(unansweredQuestionForMe);
    } else {
      setPendingAnswerForMe(null);
    }

    // Believable/Suspicious popup resilience. The live path (onNewAnswer) opens the
    // vote popup only from the `new_answer` broadcast, so a missed event — reconnect
    // gap, or a multi-worker deploy where the broadcast lands on another worker —
    // used to mean the player never got prompted to vote at all. On every state sync,
    // re-open it for any lie-detector answer this player still owes a vote on (not
    // their own answer, not auto-skipped, not already voted). Once the round is over,
    // close any lingering popup — voting is no longer possible.
    if (activeRound) {
      const myVotes = new Set((state.group.my_lie_votes ?? []).map(Number));
      const owed = activityItems.filter(
        (item) =>
          item.isLie &&
          item.a != null &&
          !item.autoSkipped &&
          Number(item.toSessionId) !== Number(myPlayer?.session_id) &&
          !myVotes.has(item.questionId) &&
          !handledVoteQuestionIds.current.has(item.questionId)
      );
      const mostRecentOwed = owed[owed.length - 1];
      if (mostRecentOwed) {
        // Don't clobber a popup already open (e.g. the live event beat this sync).
        setVoteContext((prev) =>
          prev ?? {
            questionId: mostRecentOwed.questionId,
            answerText: mostRecentOwed.a as string,
            answererSessionId: Number(mostRecentOwed.toSessionId),
          }
        );
      }
    } else {
      setVoteContext(null);
    }
  }, [myPlayer?.session_id, navigate, session?.groupId, session?.participantId]);

  // ---- Idempotent appliers -------------------------------------------------------
  // The UI must not depend on the socket echo of the player's OWN action: if the
  // broadcast is late, dropped, or lands on a different server worker, the player
  // would only see their question / Lie Detector round after a refresh. So every
  // action applies its HTTP response through these, and the socket handlers call the
  // same functions — whichever arrives first wins, the second is a no-op.

  const registerQuestion = useCallback(
    (q: { id: number | string; asked_to: number | string; question_text: string; asked_by?: number | string | null; created_at?: string }) => {
      const id = Number(q.id);
      if (knownQuestionIdsRef.current.has(id)) return;
      knownQuestionIdsRef.current.add(id);
      const isLie = lieRoundIdRef.current !== null;
      const item: ActivityItem = {
        questionId: id,
        toSessionId: Number(q.asked_to),
        q: q.question_text,
        fromSessionId: q.asked_by != null ? Number(q.asked_by) : undefined,
        askedAt: q.created_at ?? new Date().toISOString(),
        isLie,
      };
      if (isLie) setLieQuestionsUsed((n) => n + 1);
      else setQuestionsUsed((n) => n + 1);
      setActivity((prev) => [item, ...prev]);
      if (myPlayer?.session_id != null && Number(myPlayer.session_id) === Number(q.asked_to)) {
        setPendingAnswerForMe(item);
      }
    },
    [myPlayer?.session_id]
  );

  const registerAnswer = useCallback(
    (a: { question_id: number | string; answer_text: string; auto_skipped?: boolean }) => {
      const qid = Number(a.question_id);
      setActivity((prev) =>
        prev.map((item) => (item.questionId === qid ? { ...item, a: a.answer_text, autoSkipped: a.auto_skipped } : item))
      );
      setPendingAnswerForMe((prev) => (prev && prev.questionId === qid ? null : prev));
    },
    []
  );

  const activateLieMode = useCallback((round: { id: number | string; seconds_remaining?: number }) => {
    const id = Number(round.id);
    setLieDetectorUsed(true);
    // Only the first call for a round starts the local clock and resets the counters;
    // the duplicate (response + broadcast) must not restart a 7-minute countdown.
    if (lieRoundIdRef.current === id) return;
    lieRoundIdRef.current = id;
    const secs = typeof round.seconds_remaining === "number" ? round.seconds_remaining : lieTimerSecsRef.current;
    setLieDetectorRoundId(id);
    setLieEndsAt(Date.now() + secs * 1000);
    setLieQuestionsUsed(0);
    setLieTally(null);
  }, []);

  useEffect(() => {
    if (!session?.groupId) {
      setLoading(false);
      return;
    }

    const uiKey = participantGameKey("ui", session.groupId, session.participantId);

    Promise.all([
      participantService.getGameSummary(session.groupId, session.participantId),
      participantService.getGameState(session.groupId, session.participantId),
    ])
      .then(([data, state]) => {
        setGameData(data);
        applyGameState(state);

        // Re-join the group room now that the game data has loaded. The very first
        // join_game_group (fired on socket connect) can race AHEAD of getGameSummary,
        // which is what lazily creates the participant_sessions rows — so that early
        // join's "SET is_online = 1" matches no row and the player (even "You") shows
        // Offline. Re-joining here, after the rows exist, reliably marks the player
        // online and re-broadcasts presence so the live online set always wins.
        getSocket().emit("join_game_group", {
          groupId: session.groupId,
          participantId: session.participantId,
        });
        // The HTTP snapshot just applied by applyGameState() can land AFTER the
        // socket-effect's join broadcast and clobber the live online set with a
        // stale one (e.g. before this player's is_online flag was committed). Ask
        // the server for a fresh, authoritative presence broadcast now that both
        // the session rows exist and our snapshot is applied, so presence always
        // gets the last word and the sidebar dots are correct.
        getSocket().emit("request_presence", { groupId: session.groupId });

        const savedState = sessionStorage.getItem(uiKey);
        if (savedState) {
          try {
            const { secretOpened: so = false, roleViewed: rv = false } = JSON.parse(savedState);
            setSecretOpened(Boolean(so));
            setRoleViewed(Boolean(rv));
            if (so && !rv) setRoleModalOpen(true);
          } catch {
            /* ignore corrupt saved UI state */
          }
        }

        const instinctWarningKey = participantGameKey(
          "instinct_warning",
          session.groupId,
          session.participantId
        );
        if (!sessionStorage.getItem(instinctWarningKey)) {
          setShowInstinctWarning(true);
          sessionStorage.setItem(instinctWarningKey, "1");
        }
        // The game clock (secsHdr) and case-summary clock (secsCase) are set by
        // applyGameState() above from the server's shared timers, so every player
        // is synchronized — no local per-device start time.
      })
      .catch((err) => {
        toastError(err instanceof Error ? err.message : "Could not load game.");
        navigate({
          to: "/lobby",
          search: {
            invite_url: session.inviteUrl,
            game: gameSlug ?? session.gameSlug,
          },
        });
      })
      .finally(() => setLoading(false));
  }, [session?.groupId, session?.participantId, navigate, gameSlug, session?.inviteUrl, session?.gameSlug, applyGameState]);

  // Real-time sync — every question/answer/vote/accusation/phase change is
  // server-authoritative and broadcast to the whole group.
  useEffect(() => {
    if (!session?.groupId || !session?.participantId) return;
    const socket = getSocket();

    socket.emit("join_game_group", { groupId: session.groupId, participantId: session.participantId });

    // Re-join the room and resync on every (re)connect. Socket.IO reuses the same
    // client Socket across reconnects, so this effect never re-runs on its own — and
    // the server puts the reconnected socket in a brand-new id that is NOT in
    // group_${groupId}. Without this, a reconnected player is silently dropped from
    // the room and misses every later broadcast (new_question, phase_changed,
    // scores_updated, …), freezing the game until a manual refresh. `connect` fires
    // on each successful (re)connect; the state refetch recovers any phase change
    // that was broadcast while this client was offline.
    const rejoinAndResync = () => {
      socket.emit("join_game_group", { groupId: session.groupId, participantId: session.participantId });
      // After re-joining on (re)connect, ask for an authoritative presence
      // broadcast so the reconnected player (and everyone else) shows the correct
      // online/offline dots without waiting on the next state refetch.
      socket.emit("request_presence", { groupId: session.groupId });
      participantService
        .getGameState(session.groupId, session.participantId)
        .then(applyGameState)
        .catch(() => {
          /* transient reconnect fetch failure — the next broadcast or a manual reload recovers */
        });
    };
    socket.on("connect", rejoinAndResync);

    const onNewQuestion = (q: { id: number | string; asked_to: number | string; question_text: string; asked_by?: number | string; created_at?: string }) => {
      registerQuestion(q);
    };
    const onNewAnswer = (a: { question_id: number; participant_session_id: number; answer_text: string; auto_skipped?: boolean }) => {
      registerAnswer(a);
      // During a Lie Detector round, everyone except the answerer votes on the answer.
      // Compare as numbers — session_id can arrive as a string, and a strict !==
      // against a numeric participant_session_id would (wrongly) let the questioned
      // player vote on their own answer.
      if (
        lieDetectorRoundId &&
        !a.auto_skipped &&
        Number(myPlayer?.session_id) !== Number(a.participant_session_id)
      ) {
        setVoteContext({ questionId: Number(a.question_id), answerText: a.answer_text, answererSessionId: Number(a.participant_session_id) });
      }
    };
    const onNewVote = ({ question_id, tally }: { round_id: number; question_id?: number; tally: LieDetectorTally }) => {
      setLieTally(tally);
      if (question_id != null) {
        setTallyByQuestionId((prev) => {
          const next = new Map(prev);
          next.set(Number(question_id), tally);
          return next;
        });
      }
    };
    const onLieDetectorStarted = (round: { id: number | string; seconds_remaining?: number }) => {
      activateLieMode(round);
    };
    const onLieDetectorEnded = () => {
      lieRoundIdRef.current = null;
      setLieDetectorRoundId(null);
      setLieEndsAt(null);
    };
    const onPhaseChanged = (payload: { new_phase: string; ends_at?: string }) => {
      if (payload.new_phase === "questioning") {
        lieRoundIdRef.current = null;
        setLieDetectorRoundId(null);
        setLieEndsAt(null);
        // Case Summary just closed server-side — move everyone to the investigation
        // view together (don't wait on each device's local case-summary countdown),
        // and zero the case clock so it can't linger.
        setSecsCase(0);
        setPhase("investigation");
      }
      // Main game clock ran out — the server opened the 2-minute final-accusation
      // window. Force everyone into the accusation screen; a stray lie-detector
      // round is torn down so the forced modal isn't fighting a vote prompt.
      if (payload.new_phase === "final_verdict") {
        lieRoundIdRef.current = null;
        setLieDetectorRoundId(null);
        setLieEndsAt(null);
        setVoteContext(null);
        setPendingAnswerForMe(null);
        const endsAt = payload.ends_at
          ? new Date(payload.ends_at.replace(" ", "T")).getTime()
          : Date.now() + 120_000;
        setFinalVerdictEndsAt(endsAt);
      }
    };
    const onCluesUnlocked = () => setCluesUnlocked(true);
    const onAccusationSubmitted = (payload: { participant_session_id: number | string }) => {
      if (Number(myPlayer?.session_id) === Number(payload.participant_session_id)) setMyAccusationSubmitted(true);
    };
    const onParticipantLeft = (payload: { participant_session_id: number | string }) => {
      setFrozenSessionIds((prev) => new Set(prev).add(Number(payload.participant_session_id)));
    };
    // Live presence: server broadcasts the whole group's online/left sets whenever
    // anyone joins, leaves, or disconnects — keeps the sidebar dots in sync.
    const onPresenceUpdated = (payload: { online: (number | string)[]; left?: (number | string)[] }) => {
      // Normalize to numbers: the server sends participant_session ids as strings
      // (mysql returns the id column as a string), but the sidebar compares them
      // against numeric player.session_id via Set.has(). Without this coercion
      // Set(["69"]).has(69) is false and every player (even "You") shows Offline.
      setOnlineSessionIds(new Set((payload.online ?? []).map(Number)));
      if (payload.left && payload.left.length) {
        setFrozenSessionIds((prev) => new Set([...prev, ...payload.left!.map(Number)]));
      }
    };
    // Live scores: server broadcasts every player's total after each question,
    // answer, or auto-skip penalty — keeps the Score Board in sync in real time.
    const onScoresUpdated = (payload: { scores: { session_id: number; total_score: number }[] }) => {
      const next = new Map<number, number>();
      for (const s of payload.scores ?? []) next.set(Number(s.session_id), Number(s.total_score));
      setScoresBySessionId(next);
    };
    const onGameEnded = () => {
      if (session?.groupId && session.participantId) {
        sessionStorage.setItem(
          participantGameKey("ended", session.groupId, session.participantId),
          "1"
        );
      }
      navigate({ to: "/results" });
    };
    const onGameIncomplete = () => {
      if (session?.groupId && session.participantId) {
        sessionStorage.setItem(
          participantGameKey("ended", session.groupId, session.participantId),
          "1"
        );
      }
      toastError("The Investigator has left the game. The session has ended.");
      navigate({ to: "/results" });
    };

    socket.on("new_question", onNewQuestion);
    socket.on("new_answer", onNewAnswer);
    socket.on("new_vote", onNewVote);
    socket.on("lie_detector_started", onLieDetectorStarted);
    socket.on("lie_detector_ended", onLieDetectorEnded);
    socket.on("phase_changed", onPhaseChanged);
    socket.on("clues_unlocked", onCluesUnlocked);
    socket.on("accusation_submitted", onAccusationSubmitted);
    socket.on("participant_left", onParticipantLeft);
    socket.on("presence_updated", onPresenceUpdated);
    socket.on("scores_updated", onScoresUpdated);
    socket.on("game_ended", onGameEnded);
    socket.on("game_incomplete", onGameIncomplete);

    return () => {
      // Do NOT emit leave_game_group here — this cleanup runs on every effect
      // re-subscription (role load, lie-detector state changes), not just when
      // the player actually leaves. Real departures are detected server-side
      // via socket disconnect + a reconnect grace window.
      socket.off("connect", rejoinAndResync);
      socket.off("new_question", onNewQuestion);
      socket.off("new_answer", onNewAnswer);
      socket.off("new_vote", onNewVote);
      socket.off("lie_detector_started", onLieDetectorStarted);
      socket.off("lie_detector_ended", onLieDetectorEnded);
      socket.off("phase_changed", onPhaseChanged);
      socket.off("clues_unlocked", onCluesUnlocked);
      socket.off("accusation_submitted", onAccusationSubmitted);
      socket.off("participant_left", onParticipantLeft);
      socket.off("presence_updated", onPresenceUpdated);
      socket.off("scores_updated", onScoresUpdated);
      socket.off("game_ended", onGameEnded);
      socket.off("game_incomplete", onGameIncomplete);
    };
  }, [session?.groupId, session?.participantId, navigate, myPlayer?.session_id, lieDetectorRoundId, applyGameState, registerQuestion, registerAnswer, activateLieMode]);

  // Keep the ref that the idempotent appliers read in step with the state.
  useEffect(() => {
    lieRoundIdRef.current = lieDetectorRoundId;
  }, [lieDetectorRoundId]);

  // Re-read the authoritative game state and apply it. Realtime events are the fast
  // path, but a broadcast can be missed (a reconnect gap, a proxy that drops WebSocket
  // upgrades, a server that isn't a single instance), so this is the safety net —
  // applyGameState opens the Final Accusation window / navigates to Results on its own
  // from the fresh state, no broadcast required.
  const resyncInFlight = useRef(false);
  const resyncNow = useCallback(() => {
    if (resyncInFlight.current || document.visibilityState === "hidden") return;
    if (!session?.groupId || !session.participantId) return;
    resyncInFlight.current = true;
    participantService
      .getGameState(session.groupId, session.participantId)
      .then(applyGameState)
      .catch(() => {
        /* transient — the next tick or a socket event recovers */
      })
      .finally(() => {
        resyncInFlight.current = false;
      });
  }, [session?.groupId, session?.participantId, applyGameState]);

  // Heartbeat resync every few seconds, plus immediately when the tab becomes visible
  // or the network returns, so the screen catches up without a manual refresh.
  useEffect(() => {
    if (loading || !session?.groupId || !session.participantId) return;
    const timer = setInterval(resyncNow, 8000);
    document.addEventListener("visibilitychange", resyncNow);
    window.addEventListener("online", resyncNow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", resyncNow);
      window.removeEventListener("online", resyncNow);
    };
  }, [loading, session?.groupId, session?.participantId, resyncNow]);

  // The game clock hit 00:00 but the screen hasn't moved on. The server is mid-
  // transition: questioning ended → it opens the 2-minute Final Accusation window,
  // then finalizes and marks the group completed. Instead of sitting at 00:00 for up
  // to a full 8s heartbeat (and relying on a phase_changed / game_ended broadcast that
  // a multi-worker server may not deliver), poll faster until the Final Accusation
  // screen opens or applyGameState routes to Results. Cheap and self-limiting: it
  // stops as soon as finalVerdictActive flips or the phase leaves investigation.
  useEffect(() => {
    if (loading || phase !== "investigation" || secsHdr > 0 || finalVerdictActive) return;
    resyncNow();
    const t = setInterval(resyncNow, 2500);
    return () => clearInterval(t);
  }, [loading, phase, secsHdr, finalVerdictActive, resyncNow]);

  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setSecsHdr((s: number) => Math.max(0, s - 1));
      if (phase === "summary") {
        setSecsCase((s: number) => Math.max(0, s - 1));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [loading, phase]);

  useEffect(() => {
    if (phase === "summary" && secsCase === 0 && gameData) {
      setPhase("investigation");
    }
  }, [secsCase, phase, gameData]);

  // Strategy Guide is for every role EXCEPT the Investigator, and can be opened
  // from its button at any time with no limit. On top of that, force it open once,
  // two minutes into the Case Summary, so non-investigators are nudged to read it.
  // Uses the player's OWN role cards (role_strategy_slides), matching the button.
  useEffect(() => {
    if (isInvestigator || phase !== "summary" || !gameData) return;
    if ((gameData.role_strategy_slides?.length ?? 0) === 0) return;
    if (!session?.groupId || !session.participantId) return;
    const total = gameData.settings.case_summary_view_secs || 300;
    // secsCase counts DOWN from `total`; two minutes have passed once it reaches
    // total-120 (or the player loaded/reloaded past that point).
    if (secsCase > Math.max(0, total - 120)) return;
    const key = participantGameKey("strategy_forced", session.groupId, session.participantId);
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setGuideModal("strategy");
    setGuideSlide(0);
  }, [secsCase, isInvestigator, phase, gameData, session?.groupId, session?.participantId]);

  // NOTE: We deliberately do NOT navigate to /results just because the local
  // game clock (secsHdr) hit 0. When questioning time ends the server opens the
  // 2-minute final-accusation window (phase_changed "final_verdict") and only
  // then ends the game — navigation is driven by the server's `game_ended` event
  // (see onGameEnded), and a reload lands on results via the finalized-status
  // check in applyGameState. Auto-navigating on secsHdr===0 here would skip the
  // final-accusation window entirely.

  // Persist local UI-only state (game data itself is server-authoritative now).
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    sessionStorage.setItem(
      participantGameKey("ui", session.groupId, session.participantId),
      JSON.stringify({ secretOpened, roleViewed })
    );
  }, [secretOpened, roleViewed, session?.groupId, session?.participantId]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Until the client has mounted, server and client render the exact same thing so
  // hydration can't mismatch (session/gameData are only known on the client).
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0d0820] text-white grid place-items-center">
        <p className="text-white/60 animate-pulse">Loading case summary…</p>
      </div>
    );
  }

  if (!session?.groupId) {
    return (
      <div className="min-h-screen bg-[#0d0820] text-white grid place-items-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">No active game session</h1>
          <Link to="/" className="mt-4 inline-block text-primary text-sm">Go home</Link>
        </div>
      </div>
    );
  }

  if (loading || !gameData) {
    return (
      <div className="min-h-screen bg-[#0d0820] text-white grid place-items-center">
        <p className="text-white/60 animate-pulse">Loading case summary…</p>
      </div>
    );
  }

  const questionsLeft = Math.max(0, (gameData?.settings.max_questions ?? 5) - questionsUsed);
  const lieMaxQuestions = gameData?.settings.lie_detector_max_questions ?? 3;
  const lieQuestionsLeft = Math.max(0, lieMaxQuestions - lieQuestionsUsed);

  const sendQuestion = async () => {
    const target = players[selectedAskee];
    const noQuestionsLeft = lieMode ? lieQuestionsLeft <= 0 : questionsLeft <= 0;
    if (!question.trim() || noQuestionsLeft || !target || target.is_you || !session?.participantId || isSubmittingQuestion) return;
    setIsSubmittingQuestion(true);
    try {
      const asked = await participantService.askQuestion({
        group_id: session.groupId,
        participant_id: session.participantId,
        asked_to_session_id: target.session_id,
        question_text: question.trim(),
      });
      // Show it now — don't wait for the socket broadcast (deduped if it also arrives).
      registerQuestion(asked);
      setQuestion("");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not send question.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const submitAnswer = async (text: string) => {
    if (!pendingAnswerForMe || !session?.participantId || !text.trim() || isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);
    try {
      const answered = await participantService.answerQuestion({
        question_id: pendingAnswerForMe.questionId,
        participant_id: session.participantId,
        answer_text: text.trim(),
      });
      registerAnswer(answered);
      setPendingAnswerForMe(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not submit answer.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const castVote = async (vote: "believable" | "suspicious") => {
    if (!voteContext || !lieDetectorRoundId || !session?.participantId) return;
    const votedQuestionId = voteContext.questionId;
    // Mark it handled up front so the 8s resync can't re-open this same answer's
    // popup during the round-trip / before my_lie_votes catches up.
    handledVoteQuestionIds.current.add(votedQuestionId);
    try {
      await participantService.voteLieDetector({
        group_id: session.groupId,
        participant_id: session.participantId,
        round_id: lieDetectorRoundId,
        question_id: votedQuestionId,
        vote_value: vote,
      });
      setVoteContext(null);
    } catch (err) {
      // The server may reject a genuine duplicate ("already voted") — that still
      // means it's handled, so keep it suppressed. Any other failure: let them retry.
      const msg = err instanceof Error ? err.message : "Could not cast vote.";
      if (!/already voted/i.test(msg)) handledVoteQuestionIds.current.delete(votedQuestionId);
      toastError(msg);
      setVoteContext(null);
    }
  };

  // Dismissing the popup without voting also counts as "handled" for this session,
  // so the resync doesn't immediately pop it back up. A page reload gives a fresh
  // chance (this ref is per-session), which is the intended escape hatch.
  const dismissVotePopup = () => {
    if (voteContext) handledVoteQuestionIds.current.add(voteContext.questionId);
    setVoteContext(null);
  };

  // Start the once-per-game Lie Detector. It runs for its full duration (7 min) and
  // closes itself when the server's timer expires — there is no "end early", and once
  // it is running or has been used the header button is disabled, so clicking it does
  // nothing (the guards below are a second line of defence for a fast double-click).
  const toggleLieDetector = async () => {
    if (!session?.participantId || !isInvestigator) return;
    if (lieMode || lieDetectorUsed || isStartingLie) return;
    const target = players[selectedAskee];
    if (!target || target.is_you) {
      toastError("Select a player to target with the lie detector first.");
      return;
    }
    setIsStartingLie(true);
    try {
      const round = await participantService.startLieDetector({
        group_id: session.groupId,
        participant_id: session.participantId,
        suspect_session_id: target.session_id,
      });
      // Switch into Lie Detector mode right away from the response; the room
      // broadcast for the same round is a no-op (activateLieMode is idempotent).
      activateLieMode(round);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Lie detector action failed.");
    } finally {
      setIsStartingLie(false);
    }
  };

  // DEV / TESTING ONLY — skip the current phase timer so the next screen opens
  // without waiting out the clock. Remove the header button that calls this before
  // production. It advances for everyone (the server drives the real transition).
  const handleDevNext = async () => {
    if (!session?.groupId || devSkipping) return;
    setDevSkipping(true);
    try {
      await participantService.devAdvance(session.groupId);
      const state = await participantService.getGameState(session.groupId, session.participantId);
      applyGameState(state);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not skip the timer.");
    } finally {
      setDevSkipping(false);
    }
  };

  const handleAccuse = async (accusedSessionId: number, reasoning: string) => {
    if (!session?.participantId) return;
    try {
      await participantService.submitAccusation({
        group_id: session.groupId,
        participant_id: session.participantId,
        accused_session_id: accusedSessionId,
        reasoning,
      });
      setMyAccusationSubmitted(true);
      setModal(null);
      navigate({ to: "/results" });
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not submit accusation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0817] text-white p-4 md:p-6 font-sans">
      {/* Header */}
      <header className="rounded-2xl border border-[#2c1b44] bg-[#140b22] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={mqlogo} alt="Mystery Quest" className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-bold text-lg tracking-wide">Mystery Quest</span>
        </div>
        <div className="flex items-center gap-5">
          {/* DEV / TESTING ONLY — skip the current timer. Remove before production. */}
          <button
            type="button"
            onClick={handleDevNext}
            disabled={devSkipping}
            title="Testing: skip the current timer and open the next screen"
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {devSkipping ? "Skipping…" : "Next ⏭"}
          </button>
          <div className="rounded-lg border border-[#2c1b44] px-4 py-2 text-sm text-[#b8b8b8]">
            Game Time Remaining <span className="ml-2 font-bold text-white tabular-nums">{fmt(secsHdr)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#f36b8e] grid place-items-center text-xs font-bold text-white">
              {(gameData.participant.name[0] ?? "P").toUpperCase()}
            </div>
            <span className="text-sm font-medium">{gameData.participant.name}</span>
          </div>
        </div>
      </header>




      {phase === "summary" ? (
        <SummaryView
          gameData={gameData}
          people={people}
          photoUrls={photoUrls}
          fmt={fmt}
          secsCase={secsCase}
          isInvestigator={isInvestigator}
          secretOpened={secretOpened}
          onRevealRole={() => setRoleModalOpen(true)}
          setSecretOpened={setSecretOpened}
          setRoleViewed={setRoleViewed}
          setOpenPhotos={setOpenPhotos}
          onBegin={() => setPhase("investigation")}
          onOpenInfoModal={(type) => { setGuideModal(type); setGuideSlide(0); }}
        />
      ) : (
        <InvestigationView
          players={players}
          people={people}
          yourRole={yourPerson}
          isInvestigator={isInvestigator}
          caseSummaryMins={Math.round(gameData.settings.case_summary_view_secs / 60)}
          maxQuestions={gameData.settings.max_questions}
          lieMaxQuestions={lieMaxQuestions}
          lieQuestionsUsed={lieQuestionsUsed}
          lieQuestionsLeft={lieQuestionsLeft}
          lieEndsAt={lieEndsAt}
          questionsLeft={questionsLeft}
          invSecs={secsHdr}
          answerSecs={gameData.settings.question_response_secs}
          selectedAskee={selectedAskee}
          setSelectedAskee={setSelectedAskee}
          question={question}
          setQuestion={setQuestion}
          sendQuestion={sendQuestion}
          isSubmittingQuestion={isSubmittingQuestion}
          activity={activity}
          openModal={setModal}
          onOpenStrategyCards={() => { setGuideModal("strategy"); setGuideSlide(0); }}
          hasStrategyCards={(guideSlides.strategy?.length ?? 0) > 0}
          locked={activity.some((a) => !a.a)}
          lieMode={lieMode}
          onToggleLieDetector={toggleLieDetector}
          lieDetectorUsed={lieDetectorUsed}
          cluesUnlocked={cluesUnlocked}
          myAccusationSubmitted={myAccusationSubmitted}
          frozenSessionIds={frozenSessionIds}
          onlineSessionIds={onlineSessionIds}
          scoresBySessionId={scoresBySessionId}
          lieTally={lieTally}
          tallyByQuestionId={tallyByQuestionId}
          finalVerdictActive={finalVerdictActive}
        />
      )}

      {roleModalOpen && yourPerson && (
        <YourRoleModal person={yourPerson} onClose={() => { setRoleModalOpen(false); setRoleViewed(true); }} />
      )}
      {openPhotos && <PhotosModal photos={photoUrls} onClose={() => setOpenPhotos(false)} />}
      {guideModal !== null && guideSlides[guideModal].length > 0 && (
        <InfoSliderModal
          type={guideModal}
          slideIndex={guideSlide}
          slides={guideSlides[guideModal]}
          onClose={() => setGuideModal(null)}
          onPrev={() => setGuideSlide((i: number) => Math.max(0, i - 1))}
          onNext={() => setGuideSlide((i: number) => Math.min(guideSlides[guideModal].length - 1, i + 1))}
          onSelectSlide={(index) => setGuideSlide(index)}
        />
      )}
      {/* Investigator's timed suspect card — forcefully opens on schedule, auto-closes
          when its window ends. Closing early just dismisses it for the rest of that
          window; the next scheduled card still pops up on time. */}
      {forcedStrategyCard && (
        <InfoSliderModal
          type="strategy"
          slideIndex={0}
          slides={[{
            title: forcedStrategyCard.title,
            description: forcedStrategyCard.description,
            details: forcedStrategyCard.details,
          }]}
          onClose={() =>
            setDismissedForcedCards((prev) => new Set(prev).add(forcedStrategyCard.appears_at_secs))
          }
          onPrev={() => {}}
          onNext={() => {}}
          onSelectSlide={() => {}}
        />
      )}
      {pendingAnswerForMe && gameData && (
        <AnswerModal
          key={pendingAnswerForMe.questionId}
          question={pendingAnswerForMe.q}
          answerSecs={gameData.settings.question_response_secs}
          onSubmit={submitAnswer}
          isSubmitting={isSubmittingAnswer}
          investigatorRole={isInvestigator ? "Investigator" : "Investigator"}
          onTimeout={handleAnswerTimeout}
          activity={activity}
          players={players}
          isInvestigator={isInvestigator}
        />
      )}
      {voteContext && lieDetectorRoundId && (
        <VoteModal
          answererShort={players.find((p) => p.session_id === voteContext.answererSessionId)?.pseudonym ?? "Player"}
          answerText={voteContext.answerText}
          question={activity.find((a) => a.questionId === voteContext.questionId)?.q ?? ""}
          onVote={castVote}
          onClose={dismissVotePopup}
        />
      )}
      {modal === "clue" && (
        <ClueRoomModal
          clues={gameData.clues}
          unlockSecs={gameData.settings.clue_room_unlock_secs}
          unlocked={cluesUnlocked}
          onClose={() => setModal(null)}
        />
      )}
      {finalVerdictActive ? (
        <FinalAccusationModal
          players={players}
          victimName={gameData.game.victim_name}
          isCulprit={isCulprit}
          submitted={myAccusationSubmitted}
          endsAtMs={finalVerdictEndsAt}
          onSubmit={handleAccuse}
        />
      ) : (
        modal === "accuse" && (
          <AccuseModal
            players={players}
            victimName={gameData.game.victim_name}
            submitted={myAccusationSubmitted}
            onSubmit={handleAccuse}
            onClose={() => setModal(null)}
          />
        )
      )}
      {modal === "summary" && (
        <CaseSummaryModal
          gameData={gameData}
          onClose={() => setModal(null)}
        />
      )}
      {showInstinctWarning && (
        <InstinctWarningModal onAcknowledge={() => setShowInstinctWarning(false)} />
      )}
    </div>
  );
}

function InstinctWarningModal({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated p-7 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-amber-500/15 border border-amber-400/40 grid place-items-center">
          <Eye className="h-6 w-6 text-amber-300" />
        </div>
        <h2 className="mt-4 text-xl font-black text-white">Trust Your Instincts</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          This is a game of human instinct, not internet searches. Put the phone down, study the clues, question your suspects, and trust yourself Do not use AI tools, Google, the internet, or any other external source to solve the case. All answers must come from the information provided in the game.
        </p>
        <p className="mt-2 text-sm text-white/70">
          If you are suspected of cheating or using external tools, you may be removed from the game.
Play fair. Trust yourself. Solve the mystery.
        </p>
        <button
          onClick={onAcknowledge}
          className="mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow"
        >
          I Understand — Let's Play
        </button>
      </div>
    </div>
  );
}

/* -------- Summary view (case briefing) -------- */
function SummaryView(props: {
  gameData: GameSummaryResponse;
  people: GamePerson[];
  photoUrls: string[];
  fmt: (s: number) => string;
  secsCase: number;
  isInvestigator: boolean;
  secretOpened: boolean;
  onRevealRole: () => void;
  setSecretOpened: (b: boolean) => void;
  setRoleViewed: (b: boolean) => void;
  setOpenPhotos: (b: boolean) => void;
  onBegin: () => void;
  onOpenInfoModal: (type: "strategy" | "rules") => void;
}) {
  const {
    gameData,
    people,
    photoUrls,
    fmt,
    secsCase,
    isInvestigator,
    secretOpened,
    onRevealRole,
    setSecretOpened,
    setRoleViewed,
    setOpenPhotos,
    onBegin,
    onOpenInfoModal,
  } = props;
  const [boxOpening, setBoxOpening] = useState(false);
  const orderedPeople = useMemo(
    () =>
      [...people]
        .map((person, index) => {
          const { title } = splitCharacterName(person.name);
          const label = (title ?? roleDisplayName(person)).toLowerCase().replace(/\s+/g, " ").trim();
          const orderIndex = KEY_PEOPLE_ORDER.findIndex((item) => label === item || label.includes(item));
          return { person, index, orderIndex: orderIndex === -1 ? 99 : orderIndex };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex || Number(a.person.is_you) - Number(b.person.is_you) || a.index - b.index)
        .map(({ person }) => person),
    [people]
  );

  const revealSecretBox = useCallback(() => {
    if (boxOpening) return;
    // The box stays usable for the whole Case Summary: after the first open, clicking
    // it simply shows the player's role again (no animation, no state reset).
    if (secretOpened) {
      onRevealRole();
      return;
    }
    setBoxOpening(true);
    setTimeout(() => {
      setBoxOpening(false);
      setSecretOpened(true);
      setRoleViewed(false);
      onRevealRole();
    }, 700);
  }, [boxOpening, onRevealRole, secretOpened, setRoleViewed, setSecretOpened]);

  useEffect(() => {
    if (secretOpened || boxOpening) return;
    const timer = window.setTimeout(() => {
      revealSecretBox();
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [boxOpening, revealSecretBox, secretOpened]);
  return (
    <>
      <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-[14px] bg-[#2a1348] border border-[#442371] grid place-items-center">
            <FileText className="h-6 w-6 text-[#c788fa]" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">CASE SUMMARY</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Strategy Guide is for every role EXCEPT the Investigator; it can be
              opened at any time, with no limit. The Investigator sees Game Rules only.
              Also require the player to actually have their own role strategy cards, so
              a role with none doesn't get a button that opens an empty modal. */}
          {!isInvestigator && (gameData.role_strategy_slides?.length ?? 0) > 0 && (
            <button onClick={() => onOpenInfoModal("strategy")} className="inline-flex items-center gap-2 rounded-full bg-[#3ca9f9] px-6 py-2.5 text-[15px] font-bold text-white hover:opacity-90 transition-opacity">
              <Lightbulb className="h-5 w-5" /> Strategy Guide
            </button>
          )}
          <button onClick={() => onOpenInfoModal("rules")} className="inline-flex items-center gap-2 rounded-full bg-[#f4be47] px-6 py-2.5 text-[15px] font-bold text-white hover:opacity-90 transition-opacity">
            <Gamepad2 className="h-5 w-5" /> View Game Rules
          </button>
        </div>
      </div>

      <main className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-8 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-[34px] font-bold text-[#ddc1ff]">{gameData.game.title}</h2>
            {gameData.game.tagline ? (
              <p className="mt-2 text-[15px] text-white/70">{gameData.game.tagline}</p>
            ) : null}
            <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr]">
              <div className="space-y-6 text-[15px] leading-[1.6]">
                {gameData.game.case_summary_html ? (
                  <div
                    className="prose prose-invert max-w-none text-white/80 [&_p]:mb-4 [&_.text-red-500]:text-[#fb5f5f]"
                    dangerouslySetInnerHTML={{ __html: gameData.game.case_summary_html }}
                  />
                ) : null}
                {gameData.game.timeline.length > 0 ? (
                  <>
                    <p className="font-bold text-[13px] uppercase tracking-wider text-white">ON THE NIGHT OF THE MURDER</p>
                    <ol className="relative border-l-2 border-[#69429e] ml-2 space-y-7">
                      {gameData.game.timeline.map((step) => (
                        <Step key={`${step.time}-${step.event}`} time={step.time} text={step.event} />
                      ))}
                    </ol>
                  </>
                ) : null}
                
                <div className="relative mt-4 inline-block w-full max-w-[440px] rotate-[-1deg]">
                  <img src={suspectBanner} alt="" className="w-full h-auto select-none pointer-events-none drop-shadow-[2px_3px_6px_rgba(0,0,0,0.4)]" />
                  <span className="absolute inset-0 flex items-center justify-center px-8 text-center text-[13px] md:text-sm text-[#2b1608] font-medium">
                    Now,&nbsp;<span className="text-[#c11c1c] font-bold">&nbsp;everyone&nbsp;</span>&nbsp;present in the house is a&nbsp;<span className="text-[#c11c1c] font-bold">&nbsp;suspect.</span>
                  </span>
                </div>
              </div>
              <div className="relative flex items-start justify-center">
                {/* Pre-composed evidence collage (pinned photos + compass + quick-facts note) */}
                <img
                  src={caseCollage}
                  alt="Investigation evidence — crime scene photos and quick facts"
                  className="w-full max-w-[440px] h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end w-full">
            <button onClick={() => setOpenPhotos(true)} className="inline-flex items-center gap-2 rounded-[20px] bg-[#b15cf7] px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_0_15px_rgba(177,92,247,0.3)] hover:bg-[#a643f8] transition-colors">
              <Camera className="h-5 w-5" /> View Investigation Photos
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 pb-8">
            <h3 className="text-center text-lg font-bold tracking-tight text-white mb-6">Key People in the Bungalow</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {orderedPeople.map((person: GamePerson) => {
                const { displayName, title } = splitCharacterName(person.name);
                const roleLabel = title ?? roleDisplayName(person);
                const bottomLabel = secretOpened && person.is_you ? "(You)" : displayName;
                const isYou = person.is_you;
                return (
                  <div
                    key={person.id}
                    className={`overflow-hidden rounded-xl border transition-all ${
                      isYou
                        ? "border-[#b15cf7] ring-1 ring-[#b15cf7] bg-[#2a1348]"
                        : "border-[#3b235d] bg-[#1a0c27]"
                    }`}
                  >
                    <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
                      <img
                        src={resolveMediaUrl(person.role_image) ?? mystery}
                        alt={displayName}
                        className="w-full h-full object-cover object-top opacity-90"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#1a0c27] to-transparent" />
                    </div>

                    <div className="px-1 py-2 text-center h-[46px] flex flex-col justify-center">
                      <div className="truncate text-[9.5px] leading-tight text-white/90" title={roleLabel}>
                        {roleLabel}
                      </div>
                      <div className={`mt-0.5 truncate text-[10.5px] font-semibold leading-tight ${isYou ? 'text-[#e675ff]' : 'text-[#de6df2]'}`} title={bottomLabel}>
                        {bottomLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 h-[340px]">
            <div className="rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 text-center relative overflow-hidden flex flex-col justify-between items-center h-full">
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 3.5s ease-in-out infinite; }
                @keyframes boxOpen {
                  0% { transform: scale(1); filter: brightness(1); }
                  40% { transform: scale(1.15) rotate(3deg); filter: brightness(1.3); }
                  70% { transform: scale(1.1) rotate(-3deg); filter: brightness(1.5); opacity: 1; }
                  100% { transform: scale(0.5); filter: brightness(2); opacity: 0; }
                }
                .animate-boxOpen { animation: boxOpen 0.8s forwards; }
              `}</style>
              <h3 className="text-[15px] font-medium text-white px-2 leading-snug">
                Open the Secret Box to<br />reveal your role.
              </h3>
              
              <div
                className="my-3 relative w-40 h-40 transition-transform flex items-center justify-center hover:scale-105"
              >
                <div className="absolute inset-0 bg-[#b15cf7]/20 blur-[30px] rounded-full scale-75" />
                <button
                  type="button"
                  disabled={boxOpening}
                  onClick={revealSecretBox}
                  aria-label={secretOpened ? "View your role again" : "Open the secret box"}
                  className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer"
                >
                  <img src={secretBoxImg} alt="Secret Box" className={`h-[120%] w-[120%] object-contain max-w-none ${boxOpening ? "animate-boxOpen" : "animate-float"}`} />
                </button>
              </div>

              <button
                type="button"
                disabled={boxOpening}
                onClick={revealSecretBox}
                className="w-full rounded-[20px] py-3 text-[14.5px] font-bold transition-all cursor-pointer bg-gradient-to-r from-[#b15cf7] to-[#da61f6] hover:opacity-90 shadow-[0_0_15px_rgba(177,92,247,0.3)] text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {secretOpened ? "View My Role" : "Open Secret Box"}
              </button>
            </div>
            
            <div className="rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 text-center flex flex-col justify-between h-full">
              <p className="text-[15px] leading-relaxed text-white/90 px-1 mt-2">
                You can view the case summary only once. Remember the details!
              </p>
              <div className="mt-4 rounded-3xl border border-[#3b235d] bg-[#221035] p-6 h-[170px] flex flex-col items-center justify-center shadow-inner">
                <div className="text-[13px] text-white/70 leading-snug mb-3">Time Remaining for Case Summary</div>
                <div className="text-[44px] font-bold tabular-nums tracking-wide text-white">{fmt(secsCase)}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* -------- Investigation view -------- */
const PLAYER_GRADS = [
  "from-pink-500 to-orange-400",
  "from-violet-500 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

function InvestigationView(props: {
  players: GamePlayer[];
  people: GamePerson[];
  yourRole: GamePerson | null;
  isInvestigator: boolean;
  caseSummaryMins: number;
  maxQuestions: number;
  lieMaxQuestions: number;
  lieQuestionsUsed: number;
  lieQuestionsLeft: number;
  lieEndsAt: number | null;
  questionsLeft: number;
  invSecs: number;
  answerSecs: number;
  selectedAskee: number;
  setSelectedAskee: (i: number) => void;
  question: string;
  setQuestion: (s: string) => void;
  sendQuestion: () => void;
  isSubmittingQuestion?: boolean;
  activity: ActivityItem[];
  openModal: (m: ModalKey) => void;
  onOpenStrategyCards?: () => void;
  hasStrategyCards?: boolean;
  locked?: boolean;
  lieMode: boolean;
  onToggleLieDetector: () => void;
  lieDetectorUsed?: boolean;
  cluesUnlocked: boolean;
  myAccusationSubmitted: boolean;
  frozenSessionIds: Set<number>;
  onlineSessionIds: Set<number>;
  scoresBySessionId: Map<number, number>;
  lieTally: LieDetectorTally | null;
  tallyByQuestionId: Map<number, LieDetectorTally>;
  finalVerdictActive: boolean;
}) {
  const {
    players,
    people,
    yourRole,
    isInvestigator,
    caseSummaryMins,
    maxQuestions,
    lieMaxQuestions,
    lieQuestionsUsed,
    lieQuestionsLeft,
    lieEndsAt,
    questionsLeft,
    invSecs,
    answerSecs,
    selectedAskee,
    setSelectedAskee,
    question,
    setQuestion,
    sendQuestion,
    isSubmittingQuestion = false,
    activity,
    openModal,
    onOpenStrategyCards,
    hasStrategyCards = false,
    locked = false,
    lieMode,
    onToggleLieDetector,
    lieDetectorUsed = false,
    cluesUnlocked,
    myAccusationSubmitted,
    frozenSessionIds,
    onlineSessionIds,
    scoresBySessionId,
    lieTally,
    tallyByQuestionId,
    finalVerdictActive,
  } = props;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "00")}:${String(s % 60).padStart(2, "00")}`;
  const shortBySessionId = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of players) map.set(Number(p.session_id), p.is_you ? `${p.pseudonym} (You)` : p.pseudonym);
    return map;
  }, [players]);
  const initials = (pseudonym: string) => pseudonym.slice(0, 2).toUpperCase();

  // Each player's own character portrait, keyed by their session_id. The server now
  // sends role_image per player, so avatars key off the player themselves. The old
  // index-based lookup assumed the roles list and the players list shared an order —
  // they do NOT (roles are ordered by role id, players by session), so every avatar
  // in the sidebar, question grid and Lie Detector Q/A showed the wrong person.
  const roleImageBySessionId = useMemo(() => {
    const map = new Map<number, string | null>();
    for (const p of players) {
      map.set(Number(p.session_id), p.role_image ? resolveMediaUrl(p.role_image) : null);
    }
    return map;
  }, [players]);

  // Score Board panel — rendered in the right column normally, and under the
  // question panel while the Lie Detector round is active (per design).
  const scoreBoard = (
    <div className="rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-5">
      <h3 className="text-[15px] font-bold mb-4 text-white">Score Board</h3>
      <div className="grid grid-flow-col auto-cols-fr gap-2 text-center text-[12px]">
        {players.map((p) => (
          <div key={p.session_id} className="flex flex-col gap-1 items-center min-w-0">
            <div className="text-white/60 truncate w-full" title={p.is_you ? "You" : p.pseudonym}>
              {p.is_you ? "You" : p.pseudonym}
            </div>
            <div className="text-amber-400 font-bold">{scoresBySessionId.get(Number(p.session_id)) ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // During a Lie Detector round the right column shows only that round's Q/A.
  const feedItems = lieMode ? activity.filter((a) => a.isLie) : activity;

  return (
    <>
      {/* Investigation toolbar */}
      <div className="mt-5 rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] px-6 py-5 flex items-center gap-4 flex-wrap pb-7">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-purple-500/20 grid place-items-center border border-purple-500/30">
            {lieMode ? <ScanSearch className="h-5 w-5 text-purple-300" /> : <FileText className="h-5 w-5 text-purple-300" />}
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">{lieMode ? "Lie Detector Mode" : "Investigation"}</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-6 flex-wrap">
          <div className="relative flex flex-col items-center justify-center">
            <button onClick={() => openModal("summary")} className="inline-flex items-center gap-2 rounded-full bg-[#00d084] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity">
              <FileText className="h-4 w-4" /> Case Summary
            </button>
            {/*<div className="absolute -bottom-5 text-[10px] text-[#00d084] whitespace-nowrap">Available for {caseSummaryMins}:00 minutes only</div>*/}
          </div>

          {/* Strategy Cards — Investigator only. Opens every suspect's Investigator
              Card (strategy_slides), one slide per suspect, so the Investigator can
              review all suspect profiles on demand. Non-investigator roles open their
              own cards from the Case Summary "Strategy Guide" button instead. */}
          {isInvestigator && hasStrategyCards && (
            <div className="relative flex flex-col items-center justify-center">
              <button onClick={() => onOpenStrategyCards?.()} className="inline-flex items-center gap-2 rounded-full bg-[#3ca9f9] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity">
                <Lightbulb className="h-4 w-4" /> Strategy Cards
              </button>
              <div className="absolute -bottom-5 text-[10px] text-[#3ca9f9] whitespace-nowrap">All suspect profiles</div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="text-[10px] text-white/50">{lieMode ? "Lie Detector Mode Time Left" : "Investigation Time Left"}</div>
            {lieMode ? (
              <DeadlineCountdown endsAtMs={lieEndsAt} className="text-[#facc15] text-xl font-bold tabular-nums leading-none" />
            ) : (
              <div className="text-[#facc15] text-xl font-bold tabular-nums leading-none">{fmt(invSecs)}</div>
            )}
          </div>

          {/* Questions Left only matters to the Investigator — they are the only role
              that asks questions, so hide this counter for everyone else. */}
          {isInvestigator && (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <div className="text-[10px] text-white/50">Questions Left</div>
              <div className="text-white text-xl font-bold leading-none">
                {lieMode ? `${lieQuestionsLeft}/${lieMaxQuestions}` : `${questionsLeft}/${maxQuestions}`}
              </div>
            </div>
          )}

          {isInvestigator && (
            <div className="relative flex flex-col items-center justify-center">
              {/* One-shot control: enabled only before the Lie Detector has been used.
                  While its 7 minutes run — and forever after — it is disabled, so
                  clicking it does nothing. */}
              <button
                type="button"
                onClick={onToggleLieDetector}
                disabled={lieMode || lieDetectorUsed}
                title={lieMode ? "Lie Detector is running" : lieDetectorUsed ? "Lie Detector already used" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-bold transition-opacity ${
                  lieMode || lieDetectorUsed
                    ? "bg-[#3b82f6]/35 text-white/55 cursor-not-allowed"
                    : "bg-[#3b82f6] text-white hover:opacity-90"
                }`}
              >
                <ScanSearch className="h-4 w-4" /> Lie Detector
              </button>
              <div className={`absolute -bottom-5 flex items-center gap-1.5 text-[10px] whitespace-nowrap ${lieMode ? "text-[#00d084]" : lieDetectorUsed ? "text-white/45" : "text-[#00d084]"}`}>
                <div className={`h-1.5 w-1.5 rounded-full ${lieMode ? "bg-[#00d084]" : lieDetectorUsed ? "bg-white/40" : "bg-[#00d084]"}`} />
                {lieMode ? "Active" : lieDetectorUsed ? "Used" : "Available"}
              </div>
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center">
            <button onClick={() => openModal("clue")} className="inline-flex items-center gap-2 rounded-full bg-[#eab308] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity">
              <Lightbulb className="h-4 w-4" /> Clue Room
            </button>
            <div className="absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#eab308] whitespace-nowrap">
              <div className="h-1.5 w-1.5 rounded-full bg-[#eab308]" />
              New Clue
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            <button
              onClick={() => finalVerdictActive && openModal("accuse")}
              disabled={myAccusationSubmitted || !finalVerdictActive}
              title={!finalVerdictActive ? "Unlocks automatically when the game time ends" : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-[#f43f5e] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserX className="h-4 w-4" /> {myAccusationSubmitted ? "Accusation Submitted" : "Final Accusation"}
            </button>
            {!finalVerdictActive && !myAccusationSubmitted && (
              <div className="absolute -bottom-5 text-[10px] text-white/40 whitespace-nowrap">Unlocks when time ends</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr_320px]">
        <div className="flex flex-col h-full bg-[#1e103c] rounded-none lg:rounded-2xl border-0 lg:border lg:border-[#3b2a59] p-5">
          <h3 className="text-[22px] font-bold mb-5 text-white">Players</h3>
          {/* auto-rows-fr: every player row is as tall as the tallest one. */}
          <div className="grid auto-rows-fr gap-4">
            {players.map((p, i) => {
              const sid = Number(p.session_id);
              const frozen = frozenSessionIds.has(sid);
              const isOnline = onlineSessionIds.has(sid);
              const answeringItem = activity.find(a => Number(a.toSessionId) === sid && !a.a);
              const isAnswering = !!answeringItem;
              const roleImage = roleImageBySessionId.get(sid) ?? null;

              // Determine status text and color. A player who has been asked a
              // question reads "Answering" while the response timer runs, even
              // if their socket briefly shows offline (refresh/navigation);
              // "Left" (frozen) still overrides everything.
              let statusText = "Offline";
              let statusColor = "text-white/40";
              let statusDot = "bg-white/40";
              if (isOnline) {
                statusText = "Available";
                statusColor = "text-[#10b981]";
                statusDot = "bg-[#10b981]";
              }
              if (isAnswering) {
                statusText = "Answering";
                statusColor = "text-[#facc15]";
                statusDot = "bg-[#facc15]";
              }
              if (frozen) {
                statusText = "Left";
                statusColor = "text-white/40";
                statusDot = "bg-white/40";
              }

              return (
                <button
                  type="button"
                  key={p.session_id}
                  disabled={p.is_you || frozen}
                  onClick={() => { if (isInvestigator) setSelectedAskee(i); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border border-[#3b2a59] bg-[#2a174c] hover:border-purple-400/40 ${
                    i === selectedAskee && isInvestigator
                      ? "ring-1 ring-purple-400/40 border-purple-400/40"
                      : ""
                  } ${frozen ? "opacity-40" : ""}`}
                >
                  {/* Circular avatar */}
                  <div className="relative h-14 w-14 rounded-full overflow-hidden shrink-0 shadow-lg">
                    <RoleAvatar src={roleImage} fallback={initials(p.pseudonym)} gradient={PLAYER_GRADS[i % PLAYER_GRADS.length]} fallbackTextClass="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] text-white break-words">
                      {p.pseudonym} {p.is_you && <span className="font-normal">(You)</span>}
                    </div>
                    {p.character_name && (
                      <div className="text-[12px] text-purple-300/90 break-words leading-tight mt-0.5">
                        {p.character_name}
                      </div>
                    )}
                  </div>
                  {/* Presence text ("Available"/"Offline") is hidden — only the active
                      "Answering" / "Left" states, which affect gameplay, still show. They sit
                      on the right (not under the name) so every row keeps the same height. */}
                  {(isAnswering || frozen) && (
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      {isAnswering && (
                        <AnswerCountdown
                          askedAt={answeringItem?.askedAt}
                          totalSecs={answerSecs}
                          className="text-[#facc15] text-lg font-semibold tabular-nums whitespace-nowrap leading-none"
                        />
                      )}
                      <div className={`text-[11px] flex items-center gap-1.5 whitespace-nowrap ${statusColor}`}>
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot}`} /> {statusText}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Your Role Section */}
          {yourRole ? (
            <div className="mt-auto pt-8">
              <div className="h-px bg-white/10 mb-6 w-full" />
              <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Your Role</div>
              <div className="text-purple-300 text-base font-black tracking-widest uppercase">{yourRole.role_type || roleDisplayName(yourRole)}</div>
              {/* Only the Investigator asks questions — other roles answer and vote. */}
              {isInvestigator ? (
                <p className="text-[10px] text-white/50 mt-1 leading-relaxed">Ask up to 5 questions to uncover the truth</p>
              ) : (
                <p className="text-[10px] text-white/50 mt-1 leading-relaxed">Answer honestly and vote in the Lie Detector rounds.</p>
              )}
            </div>
          ) : null}
        </div>

        {/* Ask question (Investigator) / observer panel (everyone else) */}
        <div className="space-y-5">
        <div className="rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{lieMode ? "Lie Detector Mode Activated" : isInvestigator ? "Ask a Question" : "Investigation In Progress"}</h3>
              <p className="text-xs text-white/70 mt-1">
                {lieMode
                  ? `Investigator can ask maximum ${lieMaxQuestions} questions to any player in Lie Detector mode. Other players will vote on the answers.`
                  : isInvestigator
                    ? "Select a player to ask a question"
                    : "The Investigator is questioning suspects. If a question comes to you, an answer window will open automatically — you have limited time to respond."}
              </p>
            </div>
            {lieMode && (
              <div className="shrink-0 text-sm text-white whitespace-nowrap">{lieQuestionsUsed}/{lieMaxQuestions} Question</div>
            )}
          </div>
          {isInvestigator ? (
            <>
              {locked && (
                <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Waiting for answer — input locked while the timer runs.
                </div>
              )}
              <fieldset disabled={locked} aria-busy={locked} className={locked ? "opacity-60 pointer-events-none select-none" : ""}>
                <div className="mt-6">
                  <PlayerCardGrid>
                    {players.map((p, i) => (
                      <button
                        type="button"
                        key={p.session_id}
                        onClick={() => setSelectedAskee(i)}
                        disabled={p.is_you || frozenSessionIds.has(p.session_id)}
                        className="h-full transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <PlayerCard player={p} index={i} selected={i === selectedAskee} />
                      </button>
                    ))}
                  </PlayerCardGrid>
                </div>
                <div className="mt-8">
                  <label className="text-xs text-white/70">Type your question (max 120 characters)</label>
                  <div className="mt-1.5 relative">
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 120))}
                      placeholder="Type your question here..."
                      disabled={isSubmittingQuestion}
                      className="w-full h-24 rounded-xl bg-transparent border border-white/15 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7] disabled:cursor-not-allowed resize-none" />
                    <span className="absolute bottom-3 right-3 text-[10px] text-white/50">{question.length}/120</span>
                  </div>
                </div>
                <button type="button" onClick={sendQuestion} disabled={!question.trim() || (lieMode ? lieQuestionsLeft <= 0 : questionsLeft <= 0) || locked || isSubmittingQuestion}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-3 text-sm font-bold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90">
                  {isSubmittingQuestion ? "Sending…" : "Send Question"}
                </button>
              </fieldset>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-white/70 block mb-5">All Players</label>
                <PlayerCardGrid>
                  {players.map((p, i) => (
                    <div key={p.session_id} className={`h-full ${frozenSessionIds.has(p.session_id) ? "opacity-40" : ""}`}>
                      <PlayerCard player={p} index={i} />
                    </div>
                  ))}
                </PlayerCardGrid>
              </div>
            </>
          )}
          <p className="mt-2 text-center text-[11px] text-white/60">All answers are visible to everyone after the player submits.</p>
        </div>
        {lieMode && scoreBoard}
        </div>

        {/* Activity + Score */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-5">
            <h3 className={`text-[15px] font-bold mb-4 ${lieMode ? "text-pink-400" : "text-white"}`}>
              {lieMode ? "Lie Detector Mode Q/A" : "Recent Activity"}
            </h3>
            <ul className={`space-y-3 overflow-auto pr-1 ${lieMode ? "max-h-[560px]" : "max-h-[400px]"}`}>
              {feedItems.length === 0 && (
                <li className="text-xs text-white/50 text-center py-6">
                  {lieMode ? "No questions asked yet in Lie Detector mode." : "No activity yet."}
                </li>
              )}
              {feedItems.map((a) => {
                const targetShort = shortBySessionId.get(Number(a.toSessionId)) ?? "Player";
                const targetImage = roleImageBySessionId.get(Number(a.toSessionId)) ?? null;
                const askerImage = a.fromSessionId != null ? roleImageBySessionId.get(Number(a.fromSessionId)) ?? null : null;
                return (
                  <li key={a.questionId} className="rounded-xl bg-[#2a174c] border border-transparent p-4 relative">
                    <div className="flex items-start gap-3">
                      <ActivityAvatar image={askerImage} fallback={isInvestigator ? "YOU" : "INV"} />
                      <div className="flex-1">
                        <div className="text-[11px] text-white/50">
                          {isInvestigator ? "You asked" : "Investigator asked"}{" "}
                          <span className="text-pink-400">{targetShort}</span>
                        </div>
                        <div className="text-[13px] text-white mt-1">{a.q}</div>
                        <div className="text-[10px] text-white/30 mt-1">02:35</div>
                      </div>
                    </div>
                    {a.a && (
                      <div className="mt-4 flex items-start gap-3 relative">
                        <ActivityAvatar image={targetImage} fallback={targetShort.slice(0, 2).toUpperCase()} />
                        <div className="flex-1 pr-24">
                          <div className="text-[11px] text-pink-400">
                            {targetShort}{" "}
                            <span className="text-white/50">{a.autoSkipped ? "did not answer" : "Answered"}</span>
                          </div>
                          <div className={`text-[13px] text-white mt-1 ${a.autoSkipped ? "text-white/50 italic" : ""}`}>{a.a}</div>
                          <div className="text-[10px] text-white/30 mt-1">03:37</div>
                        </div>
                        {/* Believable / Suspicious tally shows on every answered lie
                            question — the counts default to 0 before anyone votes so
                            the labels are always visible (not only once a vote lands). */}
                        {a.isLie && !a.autoSkipped && (
                          <div className="absolute right-0 top-3 text-right space-y-2">
                            <div className="text-sm text-emerald-400">Believable ({(tallyByQuestionId.get(a.questionId) ?? a.tally)?.believable ?? 0})</div>
                            <div className="text-sm text-rose-400">Suspicious ({(tallyByQuestionId.get(a.questionId) ?? a.tally)?.suspicious ?? 0})</div>
                          </div>
                        )}
                      </div>
                    )}
                    {!a.a && (
                      <div className="mt-4 flex items-start gap-3">
                        <ActivityAvatar image={targetImage} fallback={targetShort.slice(0, 2).toUpperCase()} />
                        <div className="flex-1">
                          <div className="text-[11px] text-pink-400">
                            {targetShort} <span className="text-white/50">Answering</span>
                          </div>
                          <div className="text-[13px] text-amber-400 mt-1">Waiting for answer...</div>
                          <div className="text-[10px] text-white/30 mt-1">03:37</div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {!lieMode && scoreBoard}
        </div>
      </div>
    </>
  );
}

/* -------- Modals -------- */
function Step({ time, text }: { time: string; text: string }) {
  return (
    <li className="relative pl-7">
      <div className="absolute left-[-9px] top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-[3px] border-[#9352e8] bg-[#1a0c27]">
        <div className="h-2 w-2 rounded-full bg-[#9352e8]" />
      </div>
      <div className="flex gap-3">
        <span className="text-white text-[13px] w-[70px] shrink-0 font-medium">{time}</span>
        <span className="text-white/80 text-[13px] leading-[1.6]">{text}</span>
      </div>
    </li>
  );
}

function ModalShell({ children, onClose, max = "max-w-lg" }: { children: React.ReactNode; onClose: () => void; max?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`relative w-full ${max} rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated`}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 h-9 w-9 grid place-items-center rounded-xl bg-purple-700/40 hover:bg-purple-600/60">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/** Admin rich-text (summernote) renders as HTML; older plain text keeps its line breaks. */
function RichText({ text, className = "" }: { text: string; className?: string }) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(text);
  if (looksHtml) {
    return (
      <div
        className={`${className} [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_p]:mt-2 [&_strong]:text-white [&_b]:text-white [&_a]:text-emerald-300 [&_a]:underline`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return <p className={`${className} whitespace-pre-line`}>{text}</p>;
}

function InfoSliderModal({
  type,
  slideIndex,
  slides,
  onClose,
  onPrev,
  onNext,
  onSelectSlide,
}: {
  type: "strategy" | "rules";
  slideIndex: number;
  slides: Array<{ title: string; description: string; details: string[] }>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectSlide: (index: number) => void;
}) {
  const slide = slides[slideIndex];
  return (
    <ModalShell onClose={onClose} max="max-w-3xl">
      <div className="p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-300">{type === "strategy" ? "Strategy Guide" : "Game Rules"}</div>
            <h2 className="mt-2 text-3xl font-black text-white">{slide.title}</h2>
            {slide.description && (
              <RichText text={slide.description} className="mt-3 max-w-2xl text-sm leading-6 text-white/70" />
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70">
            <span>{slideIndex + 1}</span>
            <span>/</span>
            <span>{slides.length}</span>
          </div>
        </div>

        {slide.details.length > 0 && (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="grid gap-4">
              {slide.details.map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <RichText text={item} className="text-sm text-white/80" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectSlide(index)}
                className={`h-2.5 w-10 rounded-full ${index === slideIndex ? "bg-emerald-300" : "bg-white/20 hover:bg-white/30"}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onPrev} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50" disabled={slideIndex === 0}>
              Previous
            </button>
            <button onClick={onNext} className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold shadow-glow" disabled={slideIndex === slides.length - 1}>
              Next
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function roleDisplayName(person: GamePerson): string {
  const label = person.role_label || person.role;
  const match = label.match(/you are (?:the )?(.+)/i);
  return match ? match[1].trim() : label;
}

function splitCharacterName(rawName: string): { displayName: string; title: string | null } {
  const match = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { displayName: match[1].trim(), title: match[2].trim() };
  }
  return { displayName: rawName.trim(), title: null };
}

/**
 * 60×60 badge on the player's own role card. Shows the role icon uploaded in the
 * admin wizard; falls back to the default shield if none was uploaded or the image
 * fails to load (missing file / wrong storage URL).
 */
function RoleIconBadge({ icon }: { icon?: string | null }) {
  const [failed, setFailed] = useState(false);
  const src = icon && !failed ? resolveMediaUrl(icon) : null;
  return (
    <div className="absolute top-3 left-3 z-10 h-[60px] w-[60px] rounded-full overflow-hidden border border-purple-400/40 bg-black/50 grid place-items-center shadow-lg">
      {src ? (
        <img src={src} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      ) : (
        <ShieldCheck className="h-7 w-7 text-purple-300" />
      )}
    </div>
  );
}

function YourRoleModal({ person, onClose }: { person: GamePerson; onClose: () => void }) {
  const roleName = roleDisplayName(person);
  const roleTagline = person.role_subtitle || person.role_label || person.role;
  return (
    <ModalShell onClose={onClose} max="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,240px)_1fr] overflow-hidden rounded-3xl bg-[#1a0f2e]">
        <div className={`relative bg-gradient-to-br ${person.grad} min-h-[280px] md:min-h-[360px]`}>
          <RoleIconBadge icon={person.role_icon} />
          {person.role_image ? (
            <img src={resolveMediaUrl(person.role_image) ?? ""} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full grid place-items-center">
              <Eye className="h-16 w-16 text-white/80" />
            </div>
          )}
        </div>
        <div className="p-6 md:p-7 flex flex-col">
          <div className="text-sm text-purple-300/90">Your Role</div>
          <h2 className="mt-1 text-3xl md:text-4xl font-black tracking-wide text-purple-200 uppercase">
            {roleName}
          </h2>
          {roleTagline ? (
            <p className="mt-2 text-sm text-white/75 leading-relaxed">{roleTagline}</p>
          ) : null}
          {person.objective ? <Section title="OBJECTIVE" items={[person.objective]} icon={ri1} /> : null}
          {person.youKnow.length > 0 ? <Section title="WHAT YOU KNOW" items={person.youKnow} icon={ri2} /> : null}
          {person.keep.length > 0 ? <Section title="KEEP IN MIND" items={person.keep} icon={ri3} /> : null}
          <div className="mt-auto pt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3 flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-4 w-4 text-white/70 shrink-0" /> Keep your role secret
          </div>
          <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
          Okay, Continue
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Section({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="text-[13px] font-bold tracking-widest text-purple-300 flex items-center gap-2">
        <img src={icon} alt="" className="h-5 w-5 object-contain shrink-0" /> {title}
      </div>
      <ul className="mt-2 space-y-1 text-[13px] text-white/85 list-disc pl-5">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function PhotosModal({ photos, onClose }: { photos: string[]; onClose: () => void }) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (zoomedImage) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur p-4" onClick={() => setZoomedImage(null)}>
        <button className="absolute top-6 right-6 h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
          <X className="h-5 w-5" />
        </button>
        <img src={zoomedImage} alt="Zoomed Evidence" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
      </div>
    );
  }

  return (
    <ModalShell onClose={onClose} max="max-w-2xl">
      <div className="p-7">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full border border-purple-400/40 grid place-items-center"><Camera className="h-5 w-5 text-purple-300" /></div>
          <div><h3 className="text-lg font-bold">Investigation Photos</h3><p className="text-xs text-white/65">You can submit your accusation now.</p></div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {(photos.length > 0 ? photos : [mystery]).map((src, i) => (
            <div key={i} onClick={() => setZoomedImage(src)} className="relative group aspect-square overflow-hidden rounded-xl ring-1 ring-white/10 cursor-zoom-in">
              <img src={src} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
              <div className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 text-zinc-800 grid place-items-center"><ZoomIn className="h-3.5 w-3.5" /></div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-white/70">Every photo holds a secret. Look closely.</p>
        <button onClick={onClose} className="mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">Okay Continue</button>
      </div>
    </ModalShell>
  );
}

function AnswerModal({
  question,
  answerSecs,
  onSubmit,
  isSubmitting = false,
  investigatorRole = "Investigator",
  onTimeout,
  activity,
  players,
  isInvestigator,
}: {
  question: string;
  answerSecs: number;
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  investigatorRole?: string;
  onTimeout?: () => void;
  activity: ActivityItem[];
  players: GamePlayer[];
  isInvestigator: boolean;
}) {
  const [ans, setAns] = useState("");
  const secs = useCountdown(answerSecs, onTimeout);
  const isTimeUp = secs === 0;

  // Reset answer when question changes
  useEffect(() => {
    setAns("");
  }, [question]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-3 overflow-y-auto py-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#4a2f78] bg-gradient-to-br from-[#33215c] to-[#1d1236] shadow-elevated">
        {/* Answering is mandatory — the modal can't be dismissed, so this is a
            styled, non-interactive close affordance to match the design. */}
        <button aria-hidden tabIndex={-1} className="absolute top-5 right-5 z-10 h-10 w-10 grid place-items-center rounded-xl bg-[#7c3aed]/25 border border-purple-400/40 text-white/80 cursor-not-allowed">
          <X className="h-4 w-4" />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-black/50 grid place-items-center"><ShieldCheck className="h-6 w-6 text-purple-300" /></div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">You have been asked<br/>a Question</h3>
              <p className="text-sm text-white/70 mt-1">By SC ({investigatorRole})</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-purple-400/30 bg-[#3a2260]/40 p-6 text-center">
            <div className="text-sm text-white/70 mb-2">Question</div>
            <div className="text-lg md:text-xl text-white leading-relaxed font-medium">{question}</div>
          </div>
          <div className={`mt-4 text-center`}>
            <Clock className={`h-5 w-5 mx-auto ${
              isTimeUp ? "text-rose-400" : "text-white/40"
            }`} />
            <div className={`text-xs mt-1 ${
              isTimeUp ? "text-rose-300 font-bold" : "text-white/80"
            }`}>Time Left to answer</div>
            <div className={`text-3xl font-black tabular-nums tracking-wider mt-1 ${
              isTimeUp ? "text-rose-400" : "text-amber-400"
            }`}>{fmt(secs)}</div>
            {isTimeUp && (
              <p className="text-[11px] text-rose-300 font-semibold mt-2">⚠️ Time's up! -10 points penalty applied.</p>
            )}
          </div>
          <div className="mt-6">
            <label className="text-xs text-white block mb-1">Type your answer (max 120 characters)</label>
            <div className="relative">
              <textarea
                value={ans}
                onChange={(e) => setAns(e.target.value.slice(0, 120))}
                placeholder="Type your answer here..."
                disabled={isTimeUp || isSubmitting}
                className={`w-full h-20 rounded-xl bg-black/20 border border-white/20 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7] resize-none ${
                  isTimeUp || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-white/40">{ans.length}/120</span>
            </div>
          </div>
          <button
            onClick={() => onSubmit(ans)}
            disabled={!ans.trim() || isTimeUp || isSubmitting}
            className={`mt-5 w-full rounded-full py-3 text-sm font-bold shadow-glow ${
              isTimeUp || isSubmitting
                ? "bg-white/5 text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white disabled:opacity-40"
            }`}
          >
            {isSubmitting ? "Submitting…" : "Submit Answer"}
          </button>
          <p className="mt-3 text-center text-xs text-white/70">Your answer will be visible to all players.</p>
        </div>
      </div>
    </div>
  );
}

function VoteModal({
  answererShort,
  answerText,
  question,
  onVote,
  onClose,
}: {
  answererShort: string;
  answerText: string;
  question: string;
  onVote: (vote: "believable" | "suspicious") => void;
  onClose: () => void;
}) {
  const [vote, setVote] = useState<"believable" | "suspicious" | null>(null);
  return (
    <ModalShell onClose={onClose}>
      <div className="p-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 grid place-items-center flex-shrink-0"><ScanSearch className="h-6 w-6 text-white" /></div>
          <div>
            <h2 className="text-2xl font-black">Vote on the Answer</h2>
            <p className="text-sm text-white/60 mt-1">By SC (Investigator)</p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border-2 border-purple-400/50 bg-purple-500/15 p-5 text-center">
          <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Question</div>
          <div className="text-lg font-bold text-purple-200">{question}</div>
        </div>

        <div className="mt-6">
          <div className="text-sm text-pink-300 font-semibold mb-2">{answererShort}'s Answer</div>
          <div className="rounded-xl border border-white/15 bg-black/30 p-4 text-base text-white/90 leading-relaxed">{answerText}</div>
        </div>

        <div className="mt-8">
          <div className="text-sm text-pink-300 font-semibold mb-4">Select Votes</div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setVote("believable")}
              className={`rounded-xl border py-4 px-4 text-center text-base font-semibold text-emerald-300 transition-all ${
                vote === "believable"
                  ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                  : "border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              Believable
            </button>
            <button
              onClick={() => setVote("suspicious")}
              className={`rounded-xl border py-4 px-4 text-center text-base font-semibold text-rose-400 transition-all ${
                vote === "suspicious"
                  ? "border-rose-400 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                  : "border-rose-500/60 hover:border-rose-400 hover:bg-rose-500/10"
              }`}
            >
              Suspicious
            </button>
          </div>
        </div>

        <button
          onClick={() => vote && onVote(vote)}
          disabled={!vote}
          className="mt-10 w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-4 text-base font-bold text-white shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
        >
          Submit Vote
        </button>
        <p className="mt-3 text-center text-xs text-white/60">Your votes will be visible to all players.</p>
      </div>
    </ModalShell>
  );
}

function ClueRoomModal({
  clues,
  unlockSecs,
  unlocked,
  onClose,
}: {
  clues: GameSummaryResponse['clues'];
  unlockSecs: number;
  unlocked: boolean;
  onClose: () => void;
}) {
  const firstClue = clues[0] ?? null;
  const unlockLabel = `${Math.floor(unlockSecs / 60)}:${String(unlockSecs % 60).padStart(2, '0')}`;
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const clueImageUrl = firstClue?.clue_image ? resolveMediaUrl(firstClue.clue_image) ?? mystery : null;

  if (zoomedImage) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur p-4" onClick={() => setZoomedImage(null)}>
        <button className="absolute top-6 right-6 h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
          <X className="h-5 w-5" />
        </button>
        <img src={zoomedImage} alt="Zoomed Clue" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <ModalShell onClose={onClose} max="max-w-md">
        <div className="p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-amber-300/35 to-amber-600/15 border border-amber-400/60 grid place-items-center shadow-[0_0_22px_rgba(251,191,36,0.4)]">
            <Lightbulb className="h-7 w-7 text-amber-200" />
          </div>
          <h3 className="mt-4 text-lg font-black tracking-widest">CLUE ROOM LOCKED</h3>
          <p className="mt-3 text-sm text-white/75">
            The Clue Room opens when {unlockLabel} minutes remain in the session. Keep questioning —
            the evidence will be revealed to everyone at the same time.
          </p>
          <button onClick={onClose} className="mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">
            Back to Investigation
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} max="max-w-2xl">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-300/35 to-amber-600/15 border border-amber-400/60 grid place-items-center shadow-[0_0_22px_rgba(251,191,36,0.4)]"><Lightbulb className="h-6 w-6 text-amber-200" /></div>
          <div>
            <h3 className="text-lg font-black tracking-widest">CLUE ROOM</h3>
            <div className="text-xs text-emerald-400">Unlocked at 10:00</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {/* Decorative "Key Evidences" folder graphic (static asset); the real
                admin-uploaded clue image is shown in the Clue Details panel. */}
            <img src={top} alt="Key Evidences" className="h-52 w-full object-contain" />
            <div className="mt-3 text-amber-300 text-sm font-bold">{firstClue?.clue_title ?? 'Clue unavailable'}</div>
            <p className="text-xs text-white/80 mt-1">{firstClue?.clue_short_description ?? 'A clue will appear here once it is unlocked.'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-amber-300 text-sm font-bold">Clue Details</div>
            {firstClue?.clue_detail ? (
              <p className="text-xs text-white/80 mt-1">{firstClue.clue_detail}</p>
            ) : (
              <p className="text-xs text-white/80 mt-1">No additional clue details are available.</p>
            )}
            {clueImageUrl ? (
              <div
                onClick={() => setZoomedImage(clueImageUrl)}
                className="relative group mt-3 overflow-hidden rounded-xl bg-zinc-900 cursor-zoom-in"
              >
                <img src={clueImageUrl} alt={firstClue?.clue_title ?? "Clue"} className="h-36 w-full object-cover" />
                <div className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 text-zinc-800 grid place-items-center"><ZoomIn className="h-3.5 w-3.5" /></div>
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-white/70">This clue is visible to all players. Use it wisely.</p>
      </div>
    </ModalShell>
  );
}

function AccuseModal({
  players,
  victimName,
  submitted,
  onSubmit,
  onClose,
}: {
  players: GamePlayer[];
  victimName: string | null;
  submitted: boolean;
  onSubmit: (accusedSessionId: number, reasoning: string) => void;
  onClose: () => void;
}) {
  const [pickSessionId, setPickSessionId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  // The killer is always a non-investigator suspect, and the Investigator's identity
  // is public — so never offer them as someone to accuse.
  const candidates = players.filter((p) => !p.is_you && !p.is_investigator);
  return (
    <ModalShell onClose={onClose} max="max-w-2xl">
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full border border-rose-400/50 bg-rose-500/10 grid place-items-center"><UserX className="h-5 w-5 text-rose-300" /></div>
          <div>
            <h3 className="text-lg font-bold">{victimName ? `Who Killed ${victimName}?` : "Make Your Final Accusation"}</h3>
            <p className="text-xs text-white/65">The investigation is over. Trust your instincts. Name the killer.</p>
          </div>
        </div>
        {submitted ? (
          <p className="mt-6 text-center text-sm text-emerald-300">Your accusation has been submitted. Waiting for the other players…</p>
        ) : (
          <>
            <div className="mt-5">
              <PlayerCardGrid minCardPx={104}>
                {candidates.map((p, i) => (
                  <button key={p.session_id} type="button" onClick={() => setPickSessionId(p.session_id)} className="h-full">
                    <PlayerCard player={p} index={i} selected={pickSessionId === p.session_id} avatarClass="h-16 w-16" />
                  </button>
                ))}
              </PlayerCardGrid>
            </div>
            <div className="mt-5">
              <label className="text-xs text-white/80">Why do you think this player is the culprit?</label>
              <div className="mt-1 relative">
                <textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 120))} placeholder="Type your reason here..." className="w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400" />
                <span className="absolute bottom-2 right-3 text-[10px] text-white/50">{reason.length}/120</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => pickSessionId != null && onSubmit(pickSessionId, reason.trim())}
              disabled={pickSessionId == null || !reason.trim()}
              className="mt-5 block text-center w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
            <p className="mt-2 text-center text-[11px] text-white/60">Choose carefully. An innocent person's fate rests on your decision. Once submitted, you cannot change your answer.</p>
          </>
        )}
      </div>
    </ModalShell>
  );
}

/**
 * Forced end-of-game accusation screen. Shown to everyone once the main game
 * clock runs out and the server opens the fixed final-accusation window. It
 * cannot be dismissed — the only way out is to submit (non-culprits) or for the
 * window to close (the server then ends the game and routes to results).
 */
function FinalAccusationModal({
  players,
  victimName,
  isCulprit,
  submitted,
  endsAtMs,
  onSubmit,
}: {
  players: GamePlayer[];
  victimName: string | null;
  isCulprit: boolean;
  submitted: boolean;
  endsAtMs: number | null;
  onSubmit: (accusedSessionId: number, reasoning: string) => void;
}) {
  const [pickSessionId, setPickSessionId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  // The killer is always a non-investigator suspect, and the Investigator's identity
  // is public — so never offer them as someone to accuse.
  const candidates = players.filter((p) => !p.is_you && !p.is_investigator);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-500/30 bg-[#160b28] shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full border border-rose-400/50 bg-rose-500/10 grid place-items-center"><UserX className="h-5 w-5 text-rose-300" /></div>
              <div>
                <h3 className="text-lg font-bold">{victimName ? `Who Killed ${victimName}?` : "Make Your Final Accusation"}</h3>
                <p className="text-xs text-white/65">Time's up. The investigation is over — name the killer before the window closes.</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-widest text-white/50">Time left</div>
              <DeadlineCountdown endsAtMs={endsAtMs} className="text-rose-400 text-2xl font-black tabular-nums leading-none" />
            </div>
          </div>

          {submitted ? (
            <p className="mt-8 text-center text-sm text-emerald-300">Your accusation is locked in. Waiting for the other players and the final verdict…</p>
          ) : (
            <>
              {/* Every player accuses — the culprit too, so nobody can spot them by who
                  isn't voting. Only the culprit sees this reminder, on their own screen. */}
              {isCulprit && (
                <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-200">
                  You are the culprit — keep your cover and accuse someone else.
                </p>
              )}
              <div className="mt-5">
                <PlayerCardGrid minCardPx={104}>
                  {candidates.map((p, i) => (
                    <button key={p.session_id} type="button" onClick={() => setPickSessionId(p.session_id)} className="h-full">
                      <PlayerCard player={p} index={i} selected={pickSessionId === p.session_id} avatarClass="h-16 w-16" />
                    </button>
                  ))}
                </PlayerCardGrid>
              </div>
              <div className="mt-5">
                <label className="text-xs text-white/80">Why do you think this player is the culprit?</label>
                <div className="mt-1 relative">
                  <textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 120))} placeholder="Type your reason here..." className="w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400" />
                  <span className="absolute bottom-2 right-3 text-[10px] text-white/50">{reason.length}/120</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => pickSessionId != null && onSubmit(pickSessionId, reason.trim())}
                disabled={pickSessionId == null || !reason.trim()}
                className="mt-5 block text-center w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Final Accusation
              </button>
              <p className="mt-2 text-center text-[11px] text-white/60">Choose carefully. Once submitted, you cannot change your answer.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseSummaryModal({ gameData, onClose }: { gameData: GameSummaryResponse; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} max="max-w-4xl">
      <div className="max-h-[86vh] overflow-y-auto">
        {/* Header — matches the main Case Summary screen */}
        <div className="flex items-center gap-4 px-6 pt-6 md:px-8 md:pt-8">
          <div className="h-12 w-12 rounded-[14px] bg-[#2a1348] border border-[#442371] grid place-items-center">
            <FileText className="h-6 w-6 text-[#c788fa]" />
          </div>
          <h3 className="text-2xl font-bold tracking-wide">CASE SUMMARY</h3>
        </div>

        <div className="p-6 md:p-8">
          <div className="rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 md:p-8 relative overflow-hidden">
            <h2 className="text-[26px] md:text-[34px] font-bold text-[#ddc1ff]">{gameData.game.title}</h2>
            {gameData.game.tagline ? (
              <p className="mt-2 text-[15px] text-white/70">{gameData.game.tagline}</p>
            ) : null}

            <div className="mt-7 grid gap-8 md:grid-cols-[1.3fr_1fr]">
              <div className="space-y-6 text-[15px] leading-[1.6]">
                {gameData.game.case_summary_html ? (
                  <div
                    className="prose prose-invert max-w-none text-white/80 [&_p]:mb-4 [&_.text-red-500]:text-[#fb5f5f]"
                    dangerouslySetInnerHTML={{ __html: gameData.game.case_summary_html }}
                  />
                ) : (
                  <p className="text-white/70">
                    No case summary content is available yet. Use the timeline and quick facts to guide your investigation.
                  </p>
                )}
                {gameData.game.timeline.length > 0 ? (
                  <>
                    <p className="font-bold text-[13px] uppercase tracking-wider text-white">ON THE NIGHT OF THE MURDER</p>
                    <ol className="relative border-l-2 border-[#69429e] ml-2 space-y-7">
                      {gameData.game.timeline.map((step) => (
                        <Step key={`${step.time}-${step.event}`} time={step.time} text={step.event} />
                      ))}
                    </ol>
                  </>
                ) : null}

                <div className="relative mt-4 inline-block w-full max-w-[440px] rotate-[-1deg]">
                  <img src={suspectBanner} alt="" className="w-full h-auto select-none pointer-events-none drop-shadow-[2px_3px_6px_rgba(0,0,0,0.4)]" />
                  <span className="absolute inset-0 flex items-center justify-center px-8 text-center text-[13px] md:text-sm text-[#2b1608] font-medium">
                    Now,&nbsp;<span className="text-[#c11c1c] font-bold">&nbsp;everyone&nbsp;</span>&nbsp;present in the house is a&nbsp;<span className="text-[#c11c1c] font-bold">&nbsp;suspect.</span>
                  </span>
                </div>
              </div>

              <div className="relative flex items-start justify-center">
                {/* Pre-composed evidence collage (pinned photos + compass + quick-facts note) */}
                <img
                  src={caseCollage}
                  alt="Investigation evidence — crime scene photos and quick facts"
                  className="w-full max-w-[440px] h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          <button onClick={onClose} className="mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">Close Summary</button>
        </div>
      </div>
    </ModalShell>
  );
}
