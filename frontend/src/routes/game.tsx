import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileText, Lightbulb, Gamepad2, Camera, X, MapPin, Calendar, Cloud, Video,
  ZoomIn, ShieldCheck, Eye, Send, Clock, UserX, ScanSearch,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { participantService } from "@/api/services/participant.service";
import type { GameStateResponse } from "@/api/services/participant.service";
import type { GameSummaryResponse, GameSummaryRole, GamePlayer, LieDetectorTally } from "@/api/types/participant";
import { getParticipantSession, participantGameKey } from "@/lib/participant-session";
import { getSocket } from "@/lib/socket";
import { resolveMediaUrl } from "@/utils/media";
import { toastError } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";
import secretBoxImg from "@/assets/secret_box.png";

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

  console.log("[useCountdown] Initializing", { initialSeconds, onTimeout });

  useEffect(() => {
    console.log("[useCountdown] Effect running (only initialSeconds changes!)", { initialSeconds });
    // Reset timer if initialSeconds changes
    setSeconds(initialSeconds);
    let timeoutCalled = false;

    console.log("[useCountdown] Setting interval");
    const intervalId = setInterval(() => {
      setSeconds((s) => {
        const next = Math.max(0, s - 1);
        console.log("[useCountdown] Tick", { previous: s, next });
        if (next === 0 && !timeoutCalled && onTimeoutRef.current) {
          timeoutCalled = true;
          onTimeoutRef.current();
        }
        return next;
      });
    }, 1000);

    return () => {
      console.log("[useCountdown] Clearing interval");
      clearInterval(intervalId);
    };
  }, [initialSeconds]); // Only depend on initialSeconds!

  console.log("[useCountdown] Returning", { seconds });
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
  return (
    <div className="h-8 w-8 rounded-full bg-black/40 overflow-hidden shrink-0 border border-white/10 grid place-items-center text-[10px] text-white font-bold">
      {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : fallback}
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
  const [cluesUnlocked, setCluesUnlocked] = useState(false);
  const [lieDetectorRoundId, setLieDetectorRoundId] = useState<number | null>(null);
  // Absolute deadline (ms epoch) of the active Lie Detector round, and how many
  // of the max-3 lie questions the Investigator has spent so far.
  const [lieEndsAt, setLieEndsAt] = useState<number | null>(null);
  const [lieQuestionsUsed, setLieQuestionsUsed] = useState(0);
  const [myAccusationSubmitted, setMyAccusationSubmitted] = useState(false);
  const [onlineSessionIds, setOnlineSessionIds] = useState<Set<number>>(new Set());
  const [frozenSessionIds, setFrozenSessionIds] = useState<Set<number>>(new Set());
  const [scoresBySessionId, setScoresBySessionId] = useState<Map<number, number>>(new Map());

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
  const isCulprit = yourPerson?.role_type === "culprit";

  // Strategy Guide cards are Investigator-only: the Investigator gets the timed
  // suspect-profile cards, and every other role gets no strategy slides at all
  // (they see the game screen only). Game Rules stay available to everyone.
  const guideSlides = useMemo(
    () => ({
      strategy: isInvestigator ? gameData?.strategy_slides ?? [] : [],
      rules: gameData?.rules ?? [],
    }),
    [gameData, isInvestigator]
  );

  const photoUrls = useMemo(
    () =>
      (gameData?.photos ?? []).map(
        (p: { image: string | null }) => resolveMediaUrl(p.image) ?? mystery
      ),
    [gameData]
  );

  // investigation state
  const lieMode = lieDetectorRoundId !== null;
  const [selectedAskee, setSelectedAskee] = useState(0);
  const [question, setQuestion] = useState("");
  const [modal, setModal] = useState<ModalKey>(null);
  // Normal (non-Lie-Detector) questions the Investigator has spent so far —
  // lie-round questions come out of their own separate 3-question budget.
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pendingAnswerForMe, setPendingAnswerForMe] = useState<ActivityItem | null>(null);
  const [answerTimeoutPenalty, setAnswerTimeoutPenalty] = useState(0);

  const handleAnswerTimeout = useCallback(() => {
    // Don't close the modal yet, just handle timeout logic (we'll wait for new_answer event from server to close)
    setAnswerTimeoutPenalty(-10);
  }, []);
  const [voteContext, setVoteContext] = useState<{ questionId: number; answerText: string; answererSessionId: number } | null>(null);
  const [lieTally, setLieTally] = useState<LieDetectorTally | null>(null);
  const [invElapsed, setInvElapsed] = useState(0);
  const autoCardRef = useRef<number | null>(null);
  // Lie Detector round length (secs) kept in a ref so socket handlers can start
  // the local countdown without re-subscribing when gameData loads.
  const lieTimerSecsRef = useRef(420);
  useEffect(() => {
    if (gameData) lieTimerSecsRef.current = gameData.settings.lie_detector_timer_secs || 420;
  }, [gameData]);

  const applyGameState = useCallback((state: GameStateResponse) => {
    console.log("[GamePage] applyGameState called", { myPlayerSessionId: myPlayer?.session_id });
    setGameState(state);
    setMyAccusationSubmitted(Boolean(state.group.my_accusation_submitted));

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
    setLieDetectorRoundId(activeRound ? activeRound.id : null);

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

    const clueTimerUnlocked = state.group.timers.some((t) => t.timer_type === "clue_room_unlock" && !t.is_active);
    if (clueTimerUnlocked) setCluesUnlocked(true);

    // Build activity items
    const activityItems = state.group.questions.map((q) => {
      const isLie = isLieQuestion(q.created_at);
      const ans = q.answers?.[0];
      return {
        questionId: q.id,
        toSessionId: q.asked_to,
        fromSessionId: q.asked_by,
        askedAt: q.created_at,
        q: q.question_text,
        a: ans?.answer_text,
        autoSkipped: ans?.auto_skipped,
        tally: isLie ? activeRound?.tally : undefined,
        isLie,
      };
    });
    setQuestionsUsed(activityItems.filter((item) => !item.isLie).length);
    setLieQuestionsUsed(activityItems.filter((item) => item.isLie).length);
    if (activeRound?.tally) setLieTally(activeRound.tally);
    console.log("[GamePage] Built activity items", { activityItems, myPlayerSessionId: myPlayer?.session_id });
    setActivity(activityItems);

    // Check if there's an unanswered question for the current player and set pendingAnswerForMe
    const unansweredQuestionForMe = activityItems.find((item) => !item.a && Number(item.toSessionId) === Number(myPlayer?.session_id));
    console.log("[GamePage] Found unanswered question for me?", { unansweredQuestionForMe });
    if (unansweredQuestionForMe) {
      console.log("[GamePage] Setting pendingAnswerForMe from applyGameState");
      setPendingAnswerForMe(unansweredQuestionForMe);
    } else {
      setPendingAnswerForMe(null);
    }
  }, [myPlayer?.session_id]);

  useEffect(() => {
    if (!session?.groupId) {
      setLoading(false);
      return;
    }

    const timerKey = participantGameKey("timers", session.groupId, session.participantId);
    const uiKey = participantGameKey("ui", session.groupId, session.participantId);
    const savedTimer = sessionStorage.getItem(timerKey);

    Promise.all([
      participantService.getGameSummary(session.groupId, session.participantId),
      participantService.getGameState(session.groupId, session.participantId),
    ])
      .then(([data, state]) => {
        setGameData(data);
        applyGameState(state);

        // The HTTP snapshot above can land after the socket's join presence
        // broadcast and clobber it with stale offline data. Ask the server for a
        // fresh presence event now that our snapshot is applied, so the live
        // online set always wins.
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

        if (savedTimer) {
          try {
            const { hdrStartTime, caseStartTime } = JSON.parse(savedTimer);
            const hdrElapsed = Math.floor((Date.now() - hdrStartTime) / 1000);
            const caseElapsed = Math.floor((Date.now() - caseStartTime) / 1000);

            setSecsHdr(Math.max(0, data.settings.game_duration_secs - hdrElapsed));
            setSecsCase(Math.max(0, data.settings.case_summary_view_secs - caseElapsed));
            setPhase(caseElapsed >= data.settings.case_summary_view_secs ? "investigation" : "summary");
          } catch {
            const now = Date.now();
            sessionStorage.setItem(timerKey, JSON.stringify({ hdrStartTime: now, caseStartTime: now }));
            setSecsHdr(data.settings.game_duration_secs);
            setSecsCase(data.settings.case_summary_view_secs);
          }
        } else {
          const now = Date.now();
          sessionStorage.setItem(timerKey, JSON.stringify({ hdrStartTime: now, caseStartTime: now }));
          setSecsHdr(data.settings.game_duration_secs);
          setSecsCase(data.settings.case_summary_view_secs);
        }
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

    const onNewQuestion = (q: { id: number; asked_to: number; question_text: string; asked_by?: number; created_at?: string }) => {
      console.log("[GamePage] onNewQuestion received", { q, myPlayerSessionId: myPlayer?.session_id });
      const item: ActivityItem = { questionId: q.id, toSessionId: q.asked_to, q: q.question_text, fromSessionId: q.asked_by, askedAt: q.created_at ?? new Date().toISOString(), isLie: lieDetectorRoundId !== null };
      if (lieDetectorRoundId !== null) setLieQuestionsUsed((n) => n + 1);
      console.log("[GamePage] Created activity item", item);
      setActivity((prev) => [item, ...prev]);
      if (lieDetectorRoundId === null) setQuestionsUsed((n) => n + 1);
      const isForMe = myPlayer?.session_id != null && Number(myPlayer.session_id) === Number(q.asked_to);
      console.log("[GamePage] isForMe?", isForMe);
      if (isForMe) {
        console.log("[GamePage] Setting pendingAnswerForMe!");
        setPendingAnswerForMe(item);
      }
    };
    const onNewAnswer = (a: { question_id: number; participant_session_id: number; answer_text: string; auto_skipped?: boolean }) => {
      setActivity((prev) =>
        prev.map((item) => (item.questionId === a.question_id ? { ...item, a: a.answer_text, autoSkipped: a.auto_skipped } : item))
      );
      setPendingAnswerForMe((prev) => (prev && prev.questionId === a.question_id ? null : prev));
      // During a Lie Detector round, everyone except the answerer votes on the answer.
      if (lieDetectorRoundId && !a.auto_skipped && myPlayer?.session_id !== a.participant_session_id) {
        setVoteContext({ questionId: a.question_id, answerText: a.answer_text, answererSessionId: a.participant_session_id });
      }
    };
    const onNewVote = ({ tally }: { round_id: number; tally: LieDetectorTally }) => {
      setLieTally(tally);
    };
    const onLieDetectorStarted = (round: { id: number }) => {
      setLieDetectorRoundId(round.id);
      setLieEndsAt(Date.now() + lieTimerSecsRef.current * 1000);
      setLieQuestionsUsed(0);
      setLieTally(null);
    };
    const onLieDetectorEnded = () => {
      setLieDetectorRoundId(null);
      setLieEndsAt(null);
    };
    const onPhaseChanged = (payload: { new_phase: string }) => {
      if (payload.new_phase === "questioning") {
        setLieDetectorRoundId(null);
        setLieEndsAt(null);
      }
    };
    const onCluesUnlocked = () => setCluesUnlocked(true);
    const onAccusationSubmitted = (payload: { participant_session_id: number }) => {
      if (myPlayer?.session_id === payload.participant_session_id) setMyAccusationSubmitted(true);
    };
    const onParticipantLeft = (payload: { participant_session_id: number }) => {
      setFrozenSessionIds((prev) => new Set(prev).add(payload.participant_session_id));
    };
    // Live presence: server broadcasts the whole group's online/left sets whenever
    // anyone joins, leaves, or disconnects — keeps the sidebar dots in sync.
    const onPresenceUpdated = (payload: { online: number[]; left?: number[] }) => {
      setOnlineSessionIds(new Set(payload.online ?? []));
      if (payload.left && payload.left.length) {
        setFrozenSessionIds((prev) => new Set([...prev, ...payload.left!]));
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
  }, [session?.groupId, session?.participantId, navigate, myPlayer?.session_id, lieDetectorRoundId]);

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

  // Only the Investigator sees the Strategy Guide cards; every other role just
  // sees the game screen, so there is no non-investigator auto-open here.

  // Investigation-phase elapsed clock, used to drive the investigator's timed
  // suspect-profile cards (appears_at_secs / closes_at_secs windows).
  useEffect(() => {
    if (loading || phase !== "investigation") return;
    const t = setInterval(() => setInvElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading, phase]);

  useEffect(() => {
    if (!isInvestigator || phase !== "investigation" || !gameData) return;
    const slides = gameData.strategy_slides;
    const idx = slides.findIndex(
      (s) => s.closes_at_secs > s.appears_at_secs && invElapsed >= s.appears_at_secs && invElapsed < s.closes_at_secs
    );
    if (idx >= 0 && autoCardRef.current !== idx) {
      autoCardRef.current = idx;
      setGuideModal("strategy");
      setGuideSlide(idx);
    } else if (idx === -1 && autoCardRef.current !== null) {
      autoCardRef.current = null;
      setGuideModal((m) => (m === "strategy" ? null : m));
    }
  }, [invElapsed, isInvestigator, phase, gameData]);

  // Redirect to results page when the game time is over (only once per session)
  useEffect(() => {
    if (loading) return;
    if (!session?.groupId) return;
    if (gameData && secsHdr === 0) {
      const endedKey = participantGameKey("ended", session.groupId, session.participantId);
      if (sessionStorage.getItem(endedKey)) return;
      sessionStorage.setItem(endedKey, "1");
      navigate({ to: "/results" });
    }
  }, [secsHdr, loading, session?.groupId, session?.participantId, gameData, navigate]);

  // Persist local UI-only state (game data itself is server-authoritative now).
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    sessionStorage.setItem(
      participantGameKey("ui", session.groupId, session.participantId),
      JSON.stringify({ secretOpened, roleViewed })
    );
  }, [secretOpened, roleViewed, session?.groupId, session?.participantId]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
    if (!question.trim() || noQuestionsLeft || !target || target.is_you || !session?.participantId) return;
    try {
      await participantService.askQuestion({
        group_id: session.groupId,
        participant_id: session.participantId,
        asked_to_session_id: target.session_id,
        question_text: question.trim(),
      });
      setQuestion("");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not send question.");
    }
  };

  const submitAnswer = async (text: string) => {
    if (!pendingAnswerForMe || !session?.participantId || !text.trim()) return;
    try {
      await participantService.answerQuestion({
        question_id: pendingAnswerForMe.questionId,
        participant_id: session.participantId,
        answer_text: text.trim(),
      });
      setPendingAnswerForMe(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not submit answer.");
    }
  };

  const castVote = async (vote: "believable" | "suspicious") => {
    if (!voteContext || !lieDetectorRoundId || !session?.participantId) return;
    try {
      await participantService.voteLieDetector({
        group_id: session.groupId,
        participant_id: session.participantId,
        round_id: lieDetectorRoundId,
        vote_value: vote,
      });
      setVoteContext(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not cast vote.");
      setVoteContext(null);
    }
  };

  const toggleLieDetector = async () => {
    if (!session?.participantId || !isInvestigator) return;
    try {
      if (lieMode && lieDetectorRoundId) {
        await participantService.endLieDetector({
          group_id: session.groupId,
          participant_id: session.participantId,
          round_id: lieDetectorRoundId,
        });
      } else {
        const target = players[selectedAskee];
        if (!target || target.is_you) {
          toastError("Select a player to target with the lie detector first.");
          return;
        }
        await participantService.startLieDetector({
          group_id: session.groupId,
          participant_id: session.participantId,
          suspect_session_id: target.session_id,
        });
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Lie detector action failed.");
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
    <div className="min-h-screen bg-[#0d0820] text-white p-4 md:p-6">
      {/* Header */}
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold">{gameData.activity.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm">
            Game Time Remaining <span className="ml-2 font-bold tabular-nums">{fmt(secsHdr)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold">
              {(gameData.participant.name[0] ?? "P").toUpperCase()}
            </div>
            <span className="text-sm">{gameData.participant.name}</span>
          </div>
        </div>
      </header>

      <div className="mt-4">
      </div>

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
          isCulprit={isCulprit}
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
          activity={activity}
          openModal={setModal}
          locked={activity.some((a) => !a.a)}
          lieMode={lieMode}
          onToggleLieDetector={toggleLieDetector}
          cluesUnlocked={cluesUnlocked}
          myAccusationSubmitted={myAccusationSubmitted}
          frozenSessionIds={frozenSessionIds}
          onlineSessionIds={onlineSessionIds}
          scoresBySessionId={scoresBySessionId}
          lieTally={lieTally}
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
      {pendingAnswerForMe && gameData && (
        <AnswerModal
          key={pendingAnswerForMe.questionId}
          question={pendingAnswerForMe.q}
          answerSecs={gameData.settings.question_response_secs}
          onSubmit={submitAnswer}
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
          onClose={() => setVoteContext(null)}
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
      {modal === "accuse" && !isCulprit && (
        <AccuseModal
          players={players}
          victimName={gameData.game.victim_name}
          submitted={myAccusationSubmitted}
          onSubmit={handleAccuse}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "summary" && (
        <CaseSummaryModal
          gameData={gameData}
          photoUrls={photoUrls}
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
          This is a game of human instinct, not internet searches. Put the phone down, look your
          suspects in the eye, and trust yourself. No AI tool can feel when someone is lying. You can.
        </p>
        <p className="mt-2 text-sm text-white/70">
          Using external tools will spoil the game for yourself and everyone at the table.
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
    if (secretOpened || boxOpening) return;
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
      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center">
            <FileText className="h-5 w-5 text-purple-200" />
          </div>
          <h1 className="text-xl font-bold tracking-wide">CASE SUMMARY</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Strategy Guide is Investigator-only; other roles see Game Rules only. */}
          {isInvestigator && (
            <button onClick={() => onOpenInfoModal("strategy")} className="inline-flex items-center gap-2 rounded-full bg-gradient-blue px-5 py-2.5 text-sm font-semibold shadow-glow">
              <Lightbulb className="h-4 w-4" /> Strategy Guide
            </button>
          )}
          <button onClick={() => onOpenInfoModal("rules")} className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold shadow-glow">
            <Gamepad2 className="h-4 w-4" /> View Game Rules
          </button>
        </div>
      </div>

      <main className="mt-5 grid gap-5 lg:grid-cols-[2fr_1.4fr]">
        <div className="rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1c1440] to-[#140e2b] p-7 relative overflow-hidden">
          <h2 className="text-3xl font-black text-purple-200">{gameData.game.title}</h2>
          {gameData.game.tagline ? (
            <p className="mt-2 text-sm text-white/70">{gameData.game.tagline}</p>
          ) : null}
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-4 text-sm leading-relaxed">
              {gameData.game.case_summary_html ? (
                <div
                  className="prose prose-invert prose-sm max-w-none [&_p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: gameData.game.case_summary_html }}
                />
              ) : null}
              {gameData.game.timeline.length > 0 ? (
                <>
                  <p className="font-bold uppercase tracking-wider text-white/90">On the night of the murder</p>
                  <ol className="space-y-3 border-l-2 border-purple-500/40 pl-4">
                    {gameData.game.timeline.map((step) => (
                      <Step key={`${step.time}-${step.event}`} time={step.time} text={step.event} />
                    ))}
                  </ol>
                </>
              ) : null}
              <div className="inline-block bg-amber-100/95 text-zinc-900 text-xs px-3 py-1.5 rounded-sm rotate-[-1deg]">
                Now, <span className="text-rose-700 font-bold">everyone</span> present in the house is a{" "}
                <span className="text-rose-700 font-bold">suspect.</span>
              </div>
            </div>
            <div className="relative min-h-[320px]">
              <div className="absolute top-2 left-4 rotate-[-6deg] rounded-md bg-white p-2 shadow-elevated">
                <img src={photoUrls[0] ?? mystery} alt="" className="h-32 w-44 object-cover" />
              </div>
              <div className="absolute top-12 right-2 rotate-[5deg] rounded-md bg-white p-2 shadow-elevated">
                <img src={photoUrls[1] ?? mystery} alt="" className="h-28 w-40 object-cover" />
              </div>
              {gameData.game.quick_facts.length > 0 ? (
                <div className="absolute bottom-0 left-2 right-6 rotate-[-2deg] rounded-md bg-amber-100/95 text-zinc-900 p-4 shadow-elevated">
                  <div className="text-xs font-bold tracking-wider">QUICK FACTS</div>
                  <ul className="mt-2 space-y-1 text-[12px]">
                    {gameData.game.quick_facts.map((fact) => {
                      const Icon = FACT_ICONS[fact.icon] ?? MapPin;
                      return (
                        <li key={`${fact.label}-${fact.value}`} className="flex gap-2 items-center">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {fact.label}: {fact.value}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => setOpenPhotos(true)} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold shadow-glow">
              <Camera className="h-4 w-4" /> View Investigation Photos
            </button>
            <button onClick={onBegin} className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-6 py-3 text-sm font-semibold shadow-glow">
              <ScanSearch className="h-4 w-4" /> Begin Investigation
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1c1440] to-[#140e2b] p-7">
            <h3 className="text-center text-lg font-bold tracking-tight text-white">Key People in the Bungalow</h3>
            <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
              {orderedPeople.map((person: GamePerson) => {
                const { displayName, title } = splitCharacterName(person.name);
                const roleLabel = title ?? roleDisplayName(person);
                // Your character is only revealed after the Secret Box is opened —
                // before that, every card looks the same.
                const bottomLabel = secretOpened && person.is_you ? "(You)" : displayName;
                return (
                  <div
                    key={person.id}
                    className={`overflow-hidden rounded-xl border shadow-sm transition-all ${
                      secretOpened && person.is_you
                        ? "ring-2 ring-fuchsia-500 border-fuchsia-500/80 bg-[#241334]"
                        : "bg-[#1b1223] border-white/10"
                    }`}
                  >
                    <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
                      <img
                        src={resolveMediaUrl(person.role_image) ?? mystery}
                        alt={displayName}
                        className="w-full object-cover object-top"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#1b1223] to-transparent" />
                    </div>

                    <div className="px-1 py-2 bg-[#2a1830] text-center">
                      <div className="truncate text-[10px] leading-tight text-white/80" title={roleLabel}>
                        {roleLabel}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] font-semibold leading-tight text-pink-400" title={bottomLabel}>
                        {bottomLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-purple-500/20 bg-gradient-to-b from-[#241a44] to-[#160f2e] p-8 text-center relative overflow-hidden flex flex-col justify-between items-center min-h-[360px]">
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-12px); }
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
                @keyframes boxOpen {
                  0% { transform: scale(1); filter: brightness(1); }
                  40% { transform: scale(1.15) rotate(3deg); filter: brightness(1.3); }
                  70% { transform: scale(1.1) rotate(-3deg); filter: brightness(1.5); opacity: 1; }
                  100% { transform: scale(0.5); filter: brightness(2); opacity: 0; }
                }
                .animate-boxOpen { animation: boxOpen 0.8s forwards; }
              `}</style>
              <h3 className="text-xl font-medium text-white px-4 leading-snug">
                Open the Secret Box to<br />reveal your role.
              </h3>
              
              <div 
                className={`my-6 relative w-48 h-48 transition-transform ${secretOpened ? 'opacity-50 grayscale pointer-events-none' : 'hover:scale-105'}`}
              >
                {!secretOpened && <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />}
                <button
                  type="button"
                  disabled={secretOpened || boxOpening}
                  onClick={revealSecretBox}
                  className="relative z-10 h-full w-full rounded-[28px] overflow-hidden"
                >
                  <img src={secretBoxImg} alt="Secret Box" className={`h-full w-full object-contain ${secretOpened ? "opacity-50" : boxOpening ? "animate-boxOpen" : "animate-float"}`} />
                </button>
              </div>

              <button
                disabled={secretOpened || boxOpening}
                onClick={revealSecretBox}
                className={`w-full rounded-full py-3.5 text-[15px] font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all ${
                  secretOpened 
                    ? "bg-white/5 text-white/40 cursor-not-allowed shadow-none" 
                    : "bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:opacity-90 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white"
                }`}
              >
                {secretOpened ? "Role Revealed" : "Open Secret Box"}
              </button>
            </div>
            <div className="rounded-[2rem] border border-purple-500/20 bg-gradient-to-b from-[#241a44] to-[#160f2e] p-7 text-center flex flex-col justify-center">
              <p className="text-xl leading-relaxed text-white px-2">
                You can view the case summary only once. Remember the details!
              </p>
              <div className="mt-6 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#2a1a4d] to-[#1a1033] px-6 py-8 grid place-items-center">
                <div>
                  <div className="text-base text-white/80 leading-snug">Time Remaining for Case Summary</div>
                  <div className="mt-4 text-5xl font-black tabular-nums tracking-wide">{fmt(secsCase)}</div>
                </div>
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
  isCulprit: boolean;
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
  activity: ActivityItem[];
  openModal: (m: ModalKey) => void;
  locked?: boolean;
  lieMode: boolean;
  onToggleLieDetector: () => void;
  cluesUnlocked: boolean;
  myAccusationSubmitted: boolean;
  frozenSessionIds: Set<number>;
  onlineSessionIds: Set<number>;
  scoresBySessionId: Map<number, number>;
  lieTally: LieDetectorTally | null;
}) {
  const {
    players,
    people,
    yourRole,
    isInvestigator,
    isCulprit,
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
    activity,
    openModal,
    locked = false,
    lieMode,
    onToggleLieDetector,
    cluesUnlocked,
    myAccusationSubmitted,
    frozenSessionIds,
    onlineSessionIds,
    scoresBySessionId,
    lieTally,
  } = props;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "00")}:${String(s % 60).padStart(2, "00")}`;
  const shortBySessionId = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of players) map.set(Number(p.session_id), p.is_you ? `${p.pseudonym} (You)` : p.pseudonym);
    return map;
  }, [players]);
  const initials = (pseudonym: string) => pseudonym.slice(0, 2).toUpperCase();

  // Build role image lookup by index position (session_id is null for other players by design)
  // people[i] corresponds to players[i] in order from the server
  const roleImageByIndex = useMemo(() => {
    return people.map((person) =>
      person.role_image ? resolveMediaUrl(person.role_image) : null
    );
  }, [people]);

  // Same role images keyed by the player's session_id, so Recent Activity can
  // show the real character portrait for whoever asked / is answering.
  const roleImageBySessionId = useMemo(() => {
    const map = new Map<number, string | null>();
    players.forEach((p, i) => map.set(Number(p.session_id), roleImageByIndex[i] ?? null));
    return map;
  }, [players, roleImageByIndex]);

  // Score Board panel — rendered in the right column normally, and under the
  // question panel while the Lie Detector round is active (per design).
  const scoreBoard = (
    <div className="rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-5">
      <h3 className="text-[15px] font-bold mb-4 text-white">Score Board</h3>
      <div className="flex items-center justify-between gap-2 text-center text-[12px]">
        {players.map((p) => (
          <div key={p.session_id} className="flex flex-col gap-1 items-center">
            <div className="text-white/60 truncate">{p.is_you ? "You" : p.pseudonym}</div>
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
            <div className="absolute -bottom-5 text-[10px] text-[#00d084] whitespace-nowrap">Available for {caseSummaryMins}:00 minutes only</div>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="text-[10px] text-white/50">{lieMode ? "Lie Detector Mode Time Left" : "Investigation Time Left"}</div>
            {lieMode ? (
              <DeadlineCountdown endsAtMs={lieEndsAt} className="text-[#facc15] text-xl font-bold tabular-nums leading-none" />
            ) : (
              <div className="text-[#facc15] text-xl font-bold tabular-nums leading-none">{fmt(invSecs)}</div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="text-[10px] text-white/50">Questions Left</div>
            <div className="text-white text-xl font-bold leading-none">
              {lieMode ? `${lieQuestionsLeft}/${lieMaxQuestions}` : `${questionsLeft}/${maxQuestions}`}
            </div>
          </div>

          {isInvestigator && (
            <div className="relative flex flex-col items-center justify-center">
              <button onClick={onToggleLieDetector} className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-bold transition-opacity ${lieMode ? "bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-[#3b82f6] text-white hover:opacity-90"}`}>
                <ScanSearch className="h-4 w-4" /> Lie Detector
              </button>
              <div className="absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#00d084] whitespace-nowrap">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00d084]" />
                {lieMode ? "Active" : "Available"}
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

          {!isCulprit && (
            <button
              onClick={() => openModal("accuse")}
              disabled={myAccusationSubmitted}
              className="inline-flex items-center gap-2 rounded-full bg-[#f43f5e] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserX className="h-4 w-4" /> {myAccusationSubmitted ? "Accusation Submitted" : "Final Accusation"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr_320px]">
        <div className="flex flex-col h-full bg-[#1e103c] rounded-none lg:rounded-2xl border-0 lg:border lg:border-[#3b2a59] p-5">
          <h3 className="text-[22px] font-bold mb-5 text-white">Players</h3>
          <div className="space-y-4">
            {players.map((p, i) => {
              const sid = Number(p.session_id);
              const frozen = frozenSessionIds.has(sid);
              const isOnline = onlineSessionIds.has(sid);
              const answeringItem = activity.find(a => Number(a.toSessionId) === sid && !a.a);
              const isAnswering = !!answeringItem;
              const roleImage = roleImageByIndex[i] ?? null;

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
                    {roleImage ? (
                      <img src={roleImage} alt="role" className="w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-sm font-bold text-white`}>
                        {initials(p.pseudonym)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] text-white break-words">
                      {p.pseudonym} {p.is_you && <span className="font-normal">(You)</span>}
                    </div>
                    <div className={`text-[15px] flex items-center gap-2 mt-1 ${statusColor}`}>
                      <div className={`h-2 w-2 rounded-full shrink-0 ${statusDot}`} /> {statusText}
                    </div>
                  </div>
                  {isAnswering && (
                    <AnswerCountdown
                      askedAt={answeringItem?.askedAt}
                      totalSecs={answerSecs}
                      className="shrink-0 text-[#facc15] text-lg font-semibold tabular-nums whitespace-nowrap"
                    />
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
              <div className="text-purple-300 text-base font-black tracking-widest uppercase">{roleDisplayName(yourRole)}</div>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">Ask up to 5 questions to uncover the truth</p>
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
                <div className="mt-6 flex flex-wrap gap-6 justify-start">
                  {players.map((p, i) => {
                    const roleImage = roleImageByIndex[i] ?? null;
                    const isSelected = i === selectedAskee;
                    return (
                      <button
                        type="button"
                        key={p.session_id}
                        onClick={() => setSelectedAskee(i)}
                        disabled={p.is_you || frozenSessionIds.has(p.session_id)}
                        className={`relative flex flex-col items-center gap-3 text-center transition disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {/* Rounded rect card with circular portrait inside */}
                        <div className={`relative w-[120px] h-[155px] rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all bg-transparent ${
                          isSelected
                            ? "border-[#c492ed]"
                            : "border-[#4a3473] hover:border-purple-400/60"
                        }`}>
                          {/* Circular portrait */}
                          <div className="h-[90px] w-[90px] rounded-full overflow-hidden shadow-lg flex-shrink-0">
                            {roleImage ? (
                              <img src={roleImage} alt={p.pseudonym} className="object-cover" />
                            ) : (
                              <div className={`h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-2xl font-bold text-white`}>
                                {initials(p.pseudonym)}
                              </div>
                            )}
                          </div>
                          {/* Name */}
                          <div className="text-[14px] text-white leading-tight flex flex-col items-center gap-0.5">
                            {p.pseudonym}
                            {p.is_you && <span className="text-[11px] text-white/70">(You)</span>}
                          </div>
                        </div>
                        {/* Selected indicator dot */}
                        {isSelected && (
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-[#1a0f2e] border-[3px] border-[#c492ed] flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <label className="text-xs text-white/70">Type your question (max 120 characters)</label>
                  <div className="mt-1.5 relative">
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 120))}
                      placeholder="Type your question here..."
                      className="w-full h-24 rounded-xl bg-transparent border border-white/15 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7] disabled:cursor-not-allowed resize-none" />
                    <span className="absolute bottom-3 right-3 text-[10px] text-white/50">{question.length}/120</span>
                  </div>
                </div>
                <button type="button" onClick={sendQuestion} disabled={!question.trim() || (lieMode ? lieQuestionsLeft <= 0 : questionsLeft <= 0) || locked}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-3 text-sm font-bold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90">
                  Send Question
                </button>
              </fieldset>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-white/70 block mb-5">All Players</label>
                <div className="flex flex-wrap gap-6 justify-start">
                  {players.map((p, i) => {
                    const frozen = frozenSessionIds.has(p.session_id);
                    const roleImage = roleImageByIndex[i] ?? null;
                    return (
                      <div key={p.session_id} className={`flex flex-col items-center gap-0 ${frozen ? "opacity-40" : ""}`}>
                        {/* Card with circular portrait inside */}
                        <div className="relative w-[120px] h-[155px] rounded-2xl flex flex-col items-center justify-center gap-3 border border-[#4a3473] bg-transparent">
                          <div className="h-[90px] w-[90px] rounded-full overflow-hidden shadow-lg flex-shrink-0">
                            {roleImage ? (
                              <img src={roleImage} alt={p.pseudonym} className="w-full object-cover" />
                            ) : (
                              <div className={`h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-2xl font-bold text-white`}>
                                {initials(p.pseudonym)}
                              </div>
                            )}
                          </div>
                          <div className="text-[14px] text-white leading-tight text-center flex flex-col items-center gap-0.5">
                            {p.pseudonym}
                            {p.is_you && <span className="text-[11px] text-white/70">(You)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        {a.isLie && (a.tally ?? lieTally) && (
                          <div className="absolute right-0 top-3 text-right space-y-2">
                            <div className="text-sm text-emerald-400">Believable ({(a.tally ?? lieTally)!.believable})</div>
                            <div className="text-sm text-rose-400">Suspicious ({(a.tally ?? lieTally)!.suspicious})</div>
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
    <li className="relative flex gap-4">
      <span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-purple-400 ring-4 ring-purple-500/20" />
      <span className="text-purple-200 font-medium w-20 shrink-0">{time}</span>
      <span className="text-white/85">{text}</span>
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
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{slide.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70">
            <span>{slideIndex + 1}</span>
            <span>/</span>
            <span>{slides.length}</span>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="grid gap-4">
            {slide.details.map((item, index) => (
              <div key={index} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <p className="text-sm text-white/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

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

function YourRoleModal({ person, onClose }: { person: GamePerson; onClose: () => void }) {
  const roleName = roleDisplayName(person);
  const roleTagline = person.role_subtitle || person.role_label || person.role;
  return (
    <ModalShell onClose={onClose} max="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,240px)_1fr] overflow-hidden rounded-3xl bg-[#1a0f2e]">
        <div className={`relative bg-gradient-to-br ${person.grad} min-h-[280px] md:min-h-[360px]`}>
          <div className="absolute top-3 left-3 z-10 h-9 w-9 rounded-full border border-purple-400/40 bg-black/40 grid place-items-center">
            <ShieldCheck className="h-4 w-4 text-purple-300" />
          </div>
          {person.role_image ? (
            <img src={resolveMediaUrl(person.role_image) ?? ""} alt="" className="h-full w-full object-cover" />
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
          {person.objective ? <Section title="OBJECTIVE" items={[person.objective]} icon="🎯" /> : null}
          {person.youKnow.length > 0 ? <Section title="WHAT YOU KNOW" items={person.youKnow} icon="💡" /> : null}
          {person.keep.length > 0 ? <Section title="KEEP IN MIND" items={person.keep} icon="📌" /> : null}
          <div className="mt-auto pt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3 flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-4 w-4 text-white/70 shrink-0" /> Keep your role secret
          </div>
          <button onClick={onClose} className="mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">
            Okay, Continue
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Section({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  return (
    <div className="mt-4">
      <div className="text-[11px] font-bold tracking-widest text-purple-300 flex items-center gap-2"><span>{icon}</span> {title}</div>
      <ul className="mt-1.5 space-y-1 text-xs text-white/85 list-disc pl-5">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
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
        <p className="mt-5 text-center text-xs text-white/70">Check the image carefully, you might get clues.</p>
        <button onClick={onClose} className="mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">Okay Continue</button>
      </div>
    </ModalShell>
  );
}

function AnswerModal({
  question,
  answerSecs,
  onSubmit,
  investigatorRole = "Investigator",
  onTimeout,
  activity,
  players,
  isInvestigator,
}: {
  question: string;
  answerSecs: number;
  onSubmit: (text: string) => void;
  investigatorRole?: string;
  onTimeout?: () => void;
  activity: ActivityItem[];
  players: GamePlayer[];
  isInvestigator: boolean;
}) {
  console.log("[AnswerModal] Rendered!", { question, answerSecs, onTimeout, activity, players, isInvestigator });
  const [ans, setAns] = useState("");
  const secs = useCountdown(answerSecs, onTimeout);
  const isTimeUp = secs === 0;

  // Reset answer when question changes
  useEffect(() => {
    console.log("[AnswerModal] question changed, resetting answer", { question });
    setAns("");
  }, [question]);

  const shortBySessionId = new Map(players.map(p => [p.session_id, p.is_you ? `${p.pseudonym} (You)` : p.pseudonym]));

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-3 overflow-y-auto py-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] shadow-elevated">
        <button onClick={() => {}} className="absolute top-4 right-4 z-10 h-8 w-8 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 text-white opacity-80 cursor-not-allowed">
          <X className="h-3 w-3" />
        </button>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-black/40 grid place-items-center"><ShieldCheck className="h-6 w-6 text-purple-300" /></div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">You have been asked<br/>a Question</h3>
              <p className="text-sm text-white/70 mt-1">By SC ({investigatorRole})</p>
            </div>
          </div>

          {/* Activity History */}
          {activity.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-white/80 mb-2">Activity History</h4>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 max-h-[180px] overflow-y-auto space-y-2">
                {activity.map((a) => {
                  const targetShort = shortBySessionId.get(a.toSessionId) ?? "Player";
                  return (
                    <div key={a.questionId} className="rounded-lg bg-[#2a174c] p-2">
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-black/40 border border-white/10 grid place-items-center text-[6px] text-white font-bold shrink-0">
                          {isInvestigator ? "YOU" : "INV"}
                        </div>
                        <div className="flex-1">
                          <div className="text-[9px] text-white/50">
                            {isInvestigator ? "You asked" : "Investigator asked"}{" "}
                            <span className="text-pink-400">{targetShort}</span>
                          </div>
                          <div className="text-[11px] text-white mt-0.5">{a.q}</div>
                        </div>
                      </div>
                      {a.a && (
                        <div className="mt-2 flex items-start gap-2">
                          <div className="h-4 w-4 rounded-full bg-black/40 border border-white/10 grid place-items-center text-[6px] text-white font-bold shrink-0">
                            {targetShort.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-[9px] text-pink-400">
                              {targetShort}{" "}
                              <span className="text-white/50">{a.autoSkipped ? "did not answer" : "Answered"}</span>
                            </div>
                            <div className={`text-[11px] text-white mt-0.5 ${a.autoSkipped ? "text-white/50 italic" : ""}`}>{a.a}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-purple-500/30 bg-[#2b1754] p-4 text-center">
            <div className="text-xs text-white/70 mb-1">Current Question</div>
            <div className="text-base text-white leading-relaxed">{question}</div>
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
                disabled={isTimeUp}
                className={`w-full h-20 rounded-xl bg-black/20 border border-white/20 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7] resize-none ${
                  isTimeUp ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-white/40">{ans.length}/120</span>
            </div>
          </div>
          <button
            onClick={() => onSubmit(ans)}
            disabled={!ans.trim() || isTimeUp}
            className={`mt-5 w-full rounded-full py-3 text-sm font-bold shadow-glow ${
              isTimeUp
                ? "bg-white/5 text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white disabled:opacity-40"
            }`}
          >
            Submit Answer
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

  if (!unlocked) {
    return (
      <ModalShell onClose={onClose} max="max-w-md">
        <div className="p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full border border-amber-400/50 bg-amber-500/10 grid place-items-center">
            <Lightbulb className="h-6 w-6 text-amber-300" />
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
          <div className="h-12 w-12 rounded-full border border-amber-400/50 bg-amber-500/10 grid place-items-center"><Lightbulb className="h-5 w-5 text-amber-300" /></div>
          <div>
            <h3 className="text-lg font-black tracking-widest">CLUE ROOM</h3>
            <div className="text-xs text-emerald-400">Unlocked — visible to all players</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 grid place-items-center text-amber-200 font-black tracking-widest">TOP SECRET</div>
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
            {firstClue?.clue_image ? (
              <div className="mt-3 overflow-hidden rounded-xl bg-zinc-900">
                <img src={resolveMediaUrl(firstClue.clue_image) ?? mystery} alt={firstClue.clue_title} className="h-36 w-full object-cover" />
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
  const candidates = players.filter((p) => !p.is_you);
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
            <div className="mt-5 grid grid-cols-5 gap-2">
              {candidates.map((p, i) => (
                <button key={p.session_id} type="button" onClick={() => setPickSessionId(p.session_id)} className={`relative rounded-xl border p-2 text-center ${pickSessionId === p.session_id ? "border-purple-400 ring-2 ring-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                  <div className={`mx-auto h-14 w-14 rounded-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-sm font-bold`}>
                    {p.pseudonym.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="mt-1.5 text-[11px] font-semibold">{p.pseudonym}</div>
                  {pickSessionId === p.session_id && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-purple-500 ring-2 ring-purple-300" />}
                </button>
              ))}
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

function CaseSummaryModal({ gameData, photoUrls, onClose }: { gameData: GameSummaryResponse; photoUrls: string[]; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} max="max-w-4xl">
      <div className="p-7 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full border border-purple-400/40 grid place-items-center"><FileText className="h-5 w-5 text-purple-300" /></div>
          <div>
            <h3 className="text-2xl font-bold">Case Summary</h3>
            <p className="text-xs text-white/65">Review the details of the case.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 text-sm leading-relaxed">
            {gameData.game.case_summary_html ? (
              <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-3" dangerouslySetInnerHTML={{ __html: gameData.game.case_summary_html }} />
            ) : (
              <p className="text-white/70">No case summary content is available yet. Use the timeline and quick facts below to guide your investigation.</p>
            )}
            {gameData.game.timeline.length > 0 && (
              <>
                <p className="font-bold uppercase tracking-wider text-white/90">On the night of the murder</p>
                <ol className="space-y-3 border-l-2 border-purple-500/40 pl-4">
                  {gameData.game.timeline.map((step) => (
                    <Step key={`${step.time}-${step.event}`} time={step.time} text={step.event} />
                  ))}
                </ol>
              </>
            )}
            <div className="inline-block bg-amber-100/95 text-zinc-900 text-xs px-3 py-1.5 rounded-sm">
              Now, <span className="text-rose-700 font-bold">everyone</span> present in the house is a <span className="text-rose-700 font-bold">suspect.</span>
            </div>
          </div>
          <div className="relative min-h-[320px]">
            <div className="absolute top-2 left-4 rotate-[-6deg] rounded-md bg-white p-2 shadow-elevated">
              <img src={photoUrls[0] ?? mystery} alt="Case photo" className="h-32 w-44 object-cover" />
            </div>
            <div className="absolute top-12 right-2 rotate-[5deg] rounded-md bg-white p-2 shadow-elevated">
              <img src={photoUrls[1] ?? mystery} alt="Case photo" className="h-28 w-40 object-cover" />
            </div>
            {gameData.game.quick_facts.length > 0 ? (
              <div className="absolute bottom-0 left-2 right-6 rotate-[-2deg] rounded-md bg-amber-100/95 text-zinc-900 p-4 shadow-elevated">
                <div className="text-xs font-bold tracking-wider">QUICK FACTS</div>
                <ul className="mt-2 space-y-1 text-[12px]">
                  {gameData.game.quick_facts.map((fact) => {
                    const Icon = FACT_ICONS[fact.icon] ?? MapPin;
                    return (
                      <li key={`${fact.label}-${fact.value}`} className="flex gap-2 items-center">
                        <Icon className="h-3.5 w-3.5" />
                        {fact.label}: {fact.value}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <button onClick={onClose} className="mt-8 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">Close Summary</button>
      </div>
    </ModalShell>
  );
}
