import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { FileText, Lightbulb, Gamepad2, Video, Cloud, Calendar, MapPin, Camera, ScanSearch, UserX, Clock, ShieldCheck, Eye, X, ZoomIn } from "lucide-react";
import { L as Logo } from "./Logo-B423IJ3f.js";
import { p as participantService } from "./participant.service-CRAKZY7j.js";
import { g as getParticipantSession, p as participantGameKey } from "./participant-session-CZEpXMRe.js";
import { g as getSocket } from "./socket-Bwou9MYK.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { a as isCookAndCreateSlug } from "./common-CBq9_QVG.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { c as Route } from "./router-BvkvNwFV.js";
import "./config-OQZNPa_v.js";
import "socket.io-client";
import "clsx";
import "sonner";
import "@tanstack/react-query";
const secretBoxImg = "/assets/secret_box-DiVFSjEw.png";
function useCountdown(initialSeconds, onTimeout) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);
  console.log("[useCountdown] Initializing", {
    initialSeconds,
    onTimeout
  });
  useEffect(() => {
    console.log("[useCountdown] Effect running (only initialSeconds changes!)", {
      initialSeconds
    });
    setSeconds(initialSeconds);
    let timeoutCalled = false;
    console.log("[useCountdown] Setting interval");
    const intervalId = setInterval(() => {
      setSeconds((s) => {
        const next = Math.max(0, s - 1);
        console.log("[useCountdown] Tick", {
          previous: s,
          next
        });
        if (next === 0 && !timeoutCalled && onTimeoutRef.current) {
          timeoutCalled = true;
          onTimeoutRef.current();
        }
        return next;
      });
    }, 1e3);
    return () => {
      console.log("[useCountdown] Clearing interval");
      clearInterval(intervalId);
    };
  }, [initialSeconds]);
  console.log("[useCountdown] Returning", {
    seconds
  });
  return seconds;
}
function AnswerCountdown({
  askedAt,
  totalSecs,
  className
}) {
  const computeRemaining = useCallback(() => {
    if (!askedAt) return totalSecs;
    const started = new Date(askedAt.replace(" ", "T")).getTime();
    if (Number.isNaN(started)) return totalSecs;
    const elapsed = Math.floor((Date.now() - started) / 1e3);
    return Math.min(totalSecs, Math.max(0, totalSecs - elapsed));
  }, [askedAt, totalSecs]);
  const [remaining, setRemaining] = useState(computeRemaining);
  useEffect(() => {
    setRemaining(computeRemaining());
    const id = setInterval(() => setRemaining(computeRemaining()), 1e3);
    return () => clearInterval(id);
  }, [computeRemaining]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxs("span", { className, children: [
    mm,
    ":",
    ss
  ] });
}
function DeadlineCountdown({
  endsAtMs,
  className
}) {
  const compute = useCallback(() => endsAtMs == null ? 0 : Math.max(0, Math.floor((endsAtMs - Date.now()) / 1e3)), [endsAtMs]);
  const [remaining, setRemaining] = useState(compute);
  useEffect(() => {
    setRemaining(compute());
    const id = setInterval(() => setRemaining(compute()), 1e3);
    return () => clearInterval(id);
  }, [compute]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxs("span", { className, children: [
    mm,
    ":",
    ss
  ] });
}
function ActivityAvatar({
  image,
  fallback
}) {
  return /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-black/40 overflow-hidden shrink-0 border border-white/10 grid place-items-center text-[10px] text-white font-bold", children: image ? /* @__PURE__ */ jsx("img", { src: image, alt: "", className: "h-full w-full object-cover" }) : fallback });
}
function mapRoleToPerson(r) {
  return {
    ...r,
    role: r.role_label,
    youKnow: r.you_know,
    keep: r.keep_in_mind
  };
}
const FACT_ICONS = {
  location: MapPin,
  calendar: Calendar,
  cloud: Cloud,
  video: Video
};
const KEY_PEOPLE_ORDER = ["farmer leader", "farmer-leader", "son", "daughter-in-law", "daughter in law", "servant", "investigator"];
function GamePage() {
  const navigate = useNavigate();
  const {
    game: gameSlug
  } = Route.useSearch();
  const session = useMemo(() => getParticipantSession(), []);
  const slugCandidate = gameSlug ?? session?.gameSlug;
  useEffect(() => {
    if (isCookAndCreateSlug(slugCandidate)) {
      navigate({
        to: "/cookandcreate/game",
        search: {
          game: slugCandidate ?? ""
        }
      });
    }
  }, [slugCandidate, navigate]);
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [phase, setPhase] = useState("summary");
  const [secsHdr, setSecsHdr] = useState(0);
  const [secsCase, setSecsCase] = useState(0);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [secretOpened, setSecretOpened] = useState(false);
  const [roleViewed, setRoleViewed] = useState(false);
  const [openPhotos, setOpenPhotos] = useState(false);
  const [guideModal, setGuideModal] = useState(null);
  const [guideSlide, setGuideSlide] = useState(0);
  const [showInstinctWarning, setShowInstinctWarning] = useState(false);
  const [cluesUnlocked, setCluesUnlocked] = useState(false);
  const [lieDetectorRoundId, setLieDetectorRoundId] = useState(null);
  const [lieEndsAt, setLieEndsAt] = useState(null);
  const [lieQuestionsUsed, setLieQuestionsUsed] = useState(0);
  const [myAccusationSubmitted, setMyAccusationSubmitted] = useState(false);
  const [onlineSessionIds, setOnlineSessionIds] = useState(/* @__PURE__ */ new Set());
  const [frozenSessionIds, setFrozenSessionIds] = useState(/* @__PURE__ */ new Set());
  const [scoresBySessionId, setScoresBySessionId] = useState(/* @__PURE__ */ new Map());
  const people = useMemo(() => (gameData?.roles ?? []).map(mapRoleToPerson), [gameData]);
  const players = useMemo(() => gameData?.players ?? [], [gameData]);
  const myPlayer = useMemo(() => players.find((p) => p.is_you) ?? null, [players]);
  const yourPerson = useMemo(() => people.find((p) => p.is_you) ?? null, [people]);
  const isInvestigator = yourPerson?.role_type === "investigator";
  const isCulprit = yourPerson?.role_type === "culprit";
  const guideSlides = useMemo(() => ({
    strategy: isInvestigator ? gameData?.strategy_slides ?? [] : [],
    rules: gameData?.rules ?? []
  }), [gameData, isInvestigator]);
  const photoUrls = useMemo(() => (gameData?.photos ?? []).map((p) => resolveMediaUrl(p.image) ?? mystery), [gameData]);
  const lieMode = lieDetectorRoundId !== null;
  const [selectedAskee, setSelectedAskee] = useState(0);
  const [question, setQuestion] = useState("");
  const [modal, setModal] = useState(null);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [activity, setActivity] = useState([]);
  const [pendingAnswerForMe, setPendingAnswerForMe] = useState(null);
  const [answerTimeoutPenalty, setAnswerTimeoutPenalty] = useState(0);
  const handleAnswerTimeout = useCallback(() => {
    setAnswerTimeoutPenalty(-10);
  }, []);
  const [voteContext, setVoteContext] = useState(null);
  const [lieTally, setLieTally] = useState(null);
  const [invElapsed, setInvElapsed] = useState(0);
  const autoCardRef = useRef(null);
  const lieTimerSecsRef = useRef(420);
  useEffect(() => {
    if (gameData) lieTimerSecsRef.current = gameData.settings.lie_detector_timer_secs || 420;
  }, [gameData]);
  const applyGameState = useCallback((state) => {
    console.log("[GamePage] applyGameState called", {
      myPlayerSessionId: myPlayer?.session_id
    });
    setGameState(state);
    setMyAccusationSubmitted(Boolean(state.group.my_accusation_submitted));
    const online = /* @__PURE__ */ new Set();
    const frozen = /* @__PURE__ */ new Set();
    const scores = /* @__PURE__ */ new Map();
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
    const lieTimer = activeRound ? state.group.timers.find((t) => t.timer_type === "lie_detector" && t.is_active && Number(t.reference_id) === Number(activeRound.id)) : null;
    setLieEndsAt(lieTimer ? new Date(lieTimer.expires_at.replace(" ", "T")).getTime() : null);
    const parseMs = (v) => {
      if (!v) return NaN;
      return new Date(v.replace(" ", "T")).getTime();
    };
    const isLieQuestion = (createdAt) => {
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
        tally: isLie ? activeRound?.tally : void 0,
        isLie
      };
    });
    setQuestionsUsed(activityItems.filter((item) => !item.isLie).length);
    setLieQuestionsUsed(activityItems.filter((item) => item.isLie).length);
    if (activeRound?.tally) setLieTally(activeRound.tally);
    console.log("[GamePage] Built activity items", {
      activityItems,
      myPlayerSessionId: myPlayer?.session_id
    });
    setActivity(activityItems);
    const unansweredQuestionForMe = activityItems.find((item) => !item.a && Number(item.toSessionId) === Number(myPlayer?.session_id));
    console.log("[GamePage] Found unanswered question for me?", {
      unansweredQuestionForMe
    });
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
    Promise.all([participantService.getGameSummary(session.groupId, session.participantId), participantService.getGameState(session.groupId, session.participantId)]).then(([data, state]) => {
      setGameData(data);
      applyGameState(state);
      getSocket().emit("request_presence", {
        groupId: session.groupId
      });
      const savedState = sessionStorage.getItem(uiKey);
      if (savedState) {
        try {
          const {
            secretOpened: so = false,
            roleViewed: rv = false
          } = JSON.parse(savedState);
          setSecretOpened(Boolean(so));
          setRoleViewed(Boolean(rv));
          if (so && !rv) setRoleModalOpen(true);
        } catch {
        }
      }
      const instinctWarningKey = participantGameKey("instinct_warning", session.groupId, session.participantId);
      if (!sessionStorage.getItem(instinctWarningKey)) {
        setShowInstinctWarning(true);
        sessionStorage.setItem(instinctWarningKey, "1");
      }
      if (savedTimer) {
        try {
          const {
            hdrStartTime,
            caseStartTime
          } = JSON.parse(savedTimer);
          const hdrElapsed = Math.floor((Date.now() - hdrStartTime) / 1e3);
          const caseElapsed = Math.floor((Date.now() - caseStartTime) / 1e3);
          setSecsHdr(Math.max(0, data.settings.game_duration_secs - hdrElapsed));
          setSecsCase(Math.max(0, data.settings.case_summary_view_secs - caseElapsed));
          setPhase(caseElapsed >= data.settings.case_summary_view_secs ? "investigation" : "summary");
        } catch {
          const now = Date.now();
          sessionStorage.setItem(timerKey, JSON.stringify({
            hdrStartTime: now,
            caseStartTime: now
          }));
          setSecsHdr(data.settings.game_duration_secs);
          setSecsCase(data.settings.case_summary_view_secs);
        }
      } else {
        const now = Date.now();
        sessionStorage.setItem(timerKey, JSON.stringify({
          hdrStartTime: now,
          caseStartTime: now
        }));
        setSecsHdr(data.settings.game_duration_secs);
        setSecsCase(data.settings.case_summary_view_secs);
      }
    }).catch((err) => {
      toastError(err instanceof Error ? err.message : "Could not load game.");
      navigate({
        to: "/lobby",
        search: {
          invite_url: session.inviteUrl,
          game: gameSlug ?? session.gameSlug
        }
      });
    }).finally(() => setLoading(false));
  }, [session?.groupId, session?.participantId, navigate, gameSlug, session?.inviteUrl, session?.gameSlug, applyGameState]);
  useEffect(() => {
    if (!session?.groupId || !session?.participantId) return;
    const socket = getSocket();
    socket.emit("join_game_group", {
      groupId: session.groupId,
      participantId: session.participantId
    });
    const onNewQuestion = (q) => {
      console.log("[GamePage] onNewQuestion received", {
        q,
        myPlayerSessionId: myPlayer?.session_id
      });
      const item = {
        questionId: q.id,
        toSessionId: q.asked_to,
        q: q.question_text,
        fromSessionId: q.asked_by,
        askedAt: q.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
        isLie: lieDetectorRoundId !== null
      };
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
    const onNewAnswer = (a) => {
      setActivity((prev) => prev.map((item) => item.questionId === a.question_id ? {
        ...item,
        a: a.answer_text,
        autoSkipped: a.auto_skipped
      } : item));
      setPendingAnswerForMe((prev) => prev && prev.questionId === a.question_id ? null : prev);
      if (lieDetectorRoundId && !a.auto_skipped && myPlayer?.session_id !== a.participant_session_id) {
        setVoteContext({
          questionId: a.question_id,
          answerText: a.answer_text,
          answererSessionId: a.participant_session_id
        });
      }
    };
    const onNewVote = ({
      tally
    }) => {
      setLieTally(tally);
    };
    const onLieDetectorStarted = (round) => {
      setLieDetectorRoundId(round.id);
      setLieEndsAt(Date.now() + lieTimerSecsRef.current * 1e3);
      setLieQuestionsUsed(0);
      setLieTally(null);
    };
    const onLieDetectorEnded = () => {
      setLieDetectorRoundId(null);
      setLieEndsAt(null);
    };
    const onPhaseChanged = (payload) => {
      if (payload.new_phase === "questioning") {
        setLieDetectorRoundId(null);
        setLieEndsAt(null);
      }
    };
    const onCluesUnlocked = () => setCluesUnlocked(true);
    const onAccusationSubmitted = (payload) => {
      if (myPlayer?.session_id === payload.participant_session_id) setMyAccusationSubmitted(true);
    };
    const onParticipantLeft = (payload) => {
      setFrozenSessionIds((prev) => new Set(prev).add(payload.participant_session_id));
    };
    const onPresenceUpdated = (payload) => {
      setOnlineSessionIds(new Set(payload.online ?? []));
      if (payload.left && payload.left.length) {
        setFrozenSessionIds((prev) => /* @__PURE__ */ new Set([...prev, ...payload.left]));
      }
    };
    const onScoresUpdated = (payload) => {
      const next = /* @__PURE__ */ new Map();
      for (const s of payload.scores ?? []) next.set(Number(s.session_id), Number(s.total_score));
      setScoresBySessionId(next);
    };
    const onGameEnded = () => {
      if (session?.groupId && session.participantId) {
        sessionStorage.setItem(participantGameKey("ended", session.groupId, session.participantId), "1");
      }
      navigate({
        to: "/results"
      });
    };
    const onGameIncomplete = () => {
      if (session?.groupId && session.participantId) {
        sessionStorage.setItem(participantGameKey("ended", session.groupId, session.participantId), "1");
      }
      toastError("The Investigator has left the game. The session has ended.");
      navigate({
        to: "/results"
      });
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
      setSecsHdr((s) => Math.max(0, s - 1));
      if (phase === "summary") {
        setSecsCase((s) => Math.max(0, s - 1));
      }
    }, 1e3);
    return () => clearInterval(t);
  }, [loading, phase]);
  useEffect(() => {
    if (phase === "summary" && secsCase === 0 && gameData) {
      setPhase("investigation");
    }
  }, [secsCase, phase, gameData]);
  useEffect(() => {
    if (loading || phase !== "investigation") return;
    const t = setInterval(() => setInvElapsed((s) => s + 1), 1e3);
    return () => clearInterval(t);
  }, [loading, phase]);
  useEffect(() => {
    if (!isInvestigator || phase !== "investigation" || !gameData) return;
    const slides = gameData.strategy_slides;
    const idx = slides.findIndex((s) => s.closes_at_secs > s.appears_at_secs && invElapsed >= s.appears_at_secs && invElapsed < s.closes_at_secs);
    if (idx >= 0 && autoCardRef.current !== idx) {
      autoCardRef.current = idx;
      setGuideModal("strategy");
      setGuideSlide(idx);
    } else if (idx === -1 && autoCardRef.current !== null) {
      autoCardRef.current = null;
      setGuideModal((m) => m === "strategy" ? null : m);
    }
  }, [invElapsed, isInvestigator, phase, gameData]);
  useEffect(() => {
    if (loading) return;
    if (!session?.groupId) return;
    if (gameData && secsHdr === 0) {
      const endedKey = participantGameKey("ended", session.groupId, session.participantId);
      if (sessionStorage.getItem(endedKey)) return;
      sessionStorage.setItem(endedKey, "1");
      navigate({
        to: "/results"
      });
    }
  }, [secsHdr, loading, session?.groupId, session?.participantId, gameData, navigate]);
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    sessionStorage.setItem(participantGameKey("ui", session.groupId, session.participantId), JSON.stringify({
      secretOpened,
      roleViewed
    }));
  }, [secretOpened, roleViewed, session?.groupId, session?.participantId]);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  if (!session?.groupId) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0d0820] text-white grid place-items-center p-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "No active game session" }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-4 inline-block text-primary text-sm", children: "Go home" })
    ] }) });
  }
  if (loading || !gameData) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0d0820] text-white grid place-items-center", children: /* @__PURE__ */ jsx("p", { className: "text-white/60 animate-pulse", children: "Loading case summary…" }) });
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
        question_text: question.trim()
      });
      setQuestion("");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not send question.");
    }
  };
  const submitAnswer = async (text) => {
    if (!pendingAnswerForMe || !session?.participantId || !text.trim()) return;
    try {
      await participantService.answerQuestion({
        question_id: pendingAnswerForMe.questionId,
        participant_id: session.participantId,
        answer_text: text.trim()
      });
      setPendingAnswerForMe(null);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not submit answer.");
    }
  };
  const castVote = async (vote) => {
    if (!voteContext || !lieDetectorRoundId || !session?.participantId) return;
    try {
      await participantService.voteLieDetector({
        group_id: session.groupId,
        participant_id: session.participantId,
        round_id: lieDetectorRoundId,
        vote_value: vote
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
          round_id: lieDetectorRoundId
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
          suspect_session_id: target.session_id
        });
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Lie detector action failed.");
    }
  };
  const handleAccuse = async (accusedSessionId, reasoning) => {
    if (!session?.participantId) return;
    try {
      await participantService.submitAccusation({
        group_id: session.groupId,
        participant_id: session.participantId,
        accused_session_id: accusedSessionId,
        reasoning
      });
      setMyAccusationSubmitted(true);
      setModal(null);
      navigate({
        to: "/results"
      });
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not submit accusation.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0e0817] text-white p-4 md:p-6 font-sans", children: [
    /* @__PURE__ */ jsxs("header", { className: "rounded-2xl border border-[#2c1b44] bg-[#140b22] px-6 py-3.5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-lg tracking-wide", children: gameData.activity.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[#2c1b44] px-4 py-2 text-sm text-[#b8b8b8]", children: [
          "Game Time Remaining ",
          /* @__PURE__ */ jsx("span", { className: "ml-2 font-bold text-white tabular-nums", children: fmt(secsHdr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-[#f36b8e] grid place-items-center text-xs font-bold text-white", children: (gameData.participant.name[0] ?? "P").toUpperCase() }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: gameData.participant.name })
        ] })
      ] })
    ] }),
    phase === "summary" ? /* @__PURE__ */ jsx(SummaryView, { gameData, people, photoUrls, fmt, secsCase, isInvestigator, secretOpened, onRevealRole: () => setRoleModalOpen(true), setSecretOpened, setRoleViewed, setOpenPhotos, onBegin: () => setPhase("investigation"), onOpenInfoModal: (type) => {
      setGuideModal(type);
      setGuideSlide(0);
    } }) : /* @__PURE__ */ jsx(InvestigationView, { players, people, yourRole: yourPerson, isInvestigator, isCulprit, caseSummaryMins: Math.round(gameData.settings.case_summary_view_secs / 60), maxQuestions: gameData.settings.max_questions, lieMaxQuestions, lieQuestionsUsed, lieQuestionsLeft, lieEndsAt, questionsLeft, invSecs: secsHdr, answerSecs: gameData.settings.question_response_secs, selectedAskee, setSelectedAskee, question, setQuestion, sendQuestion, activity, openModal: setModal, locked: activity.some((a) => !a.a), lieMode, onToggleLieDetector: toggleLieDetector, cluesUnlocked, myAccusationSubmitted, frozenSessionIds, onlineSessionIds, scoresBySessionId, lieTally }),
    roleModalOpen && yourPerson && /* @__PURE__ */ jsx(YourRoleModal, { person: yourPerson, onClose: () => {
      setRoleModalOpen(false);
      setRoleViewed(true);
    } }),
    openPhotos && /* @__PURE__ */ jsx(PhotosModal, { photos: photoUrls, onClose: () => setOpenPhotos(false) }),
    guideModal !== null && guideSlides[guideModal].length > 0 && /* @__PURE__ */ jsx(InfoSliderModal, { type: guideModal, slideIndex: guideSlide, slides: guideSlides[guideModal], onClose: () => setGuideModal(null), onPrev: () => setGuideSlide((i) => Math.max(0, i - 1)), onNext: () => setGuideSlide((i) => Math.min(guideSlides[guideModal].length - 1, i + 1)), onSelectSlide: (index) => setGuideSlide(index) }),
    pendingAnswerForMe && gameData && /* @__PURE__ */ jsx(AnswerModal, { question: pendingAnswerForMe.q, answerSecs: gameData.settings.question_response_secs, onSubmit: submitAnswer, investigatorRole: isInvestigator ? "Investigator" : "Investigator", onTimeout: handleAnswerTimeout, activity, players, isInvestigator }, pendingAnswerForMe.questionId),
    voteContext && lieDetectorRoundId && /* @__PURE__ */ jsx(VoteModal, { answererShort: players.find((p) => p.session_id === voteContext.answererSessionId)?.pseudonym ?? "Player", answerText: voteContext.answerText, question: activity.find((a) => a.questionId === voteContext.questionId)?.q ?? "", onVote: castVote, onClose: () => setVoteContext(null) }),
    modal === "clue" && /* @__PURE__ */ jsx(ClueRoomModal, { clues: gameData.clues, unlockSecs: gameData.settings.clue_room_unlock_secs, unlocked: cluesUnlocked, onClose: () => setModal(null) }),
    modal === "accuse" && !isCulprit && /* @__PURE__ */ jsx(AccuseModal, { players, victimName: gameData.game.victim_name, submitted: myAccusationSubmitted, onSubmit: handleAccuse, onClose: () => setModal(null) }),
    modal === "summary" && /* @__PURE__ */ jsx(CaseSummaryModal, { gameData, photoUrls, onClose: () => setModal(null) }),
    showInstinctWarning && /* @__PURE__ */ jsx(InstinctWarningModal, { onAcknowledge: () => setShowInstinctWarning(false) })
  ] });
}
function InstinctWarningModal({
  onAcknowledge
}) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[70] grid place-items-center bg-black/80 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated p-7 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-14 w-14 rounded-full bg-amber-500/15 border border-amber-400/40 grid place-items-center", children: /* @__PURE__ */ jsx(Eye, { className: "h-6 w-6 text-amber-300" }) }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-black text-white", children: "Trust Your Instincts" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-white/80", children: "This is a game of human instinct, not internet searches. Put the phone down, look your suspects in the eye, and trust yourself. No AI tool can feel when someone is lying. You can." }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/70", children: "Using external tools will spoil the game for yourself and everyone at the table." }),
    /* @__PURE__ */ jsx("button", { onClick: onAcknowledge, className: "mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "I Understand — Let's Play" })
  ] }) });
}
function SummaryView(props) {
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
    onOpenInfoModal
  } = props;
  const [boxOpening, setBoxOpening] = useState(false);
  const orderedPeople = useMemo(() => [...people].map((person, index) => {
    const {
      title
    } = splitCharacterName(person.name);
    const label = (title ?? roleDisplayName(person)).toLowerCase().replace(/\s+/g, " ").trim();
    const orderIndex = KEY_PEOPLE_ORDER.findIndex((item) => label === item || label.includes(item));
    return {
      person,
      index,
      orderIndex: orderIndex === -1 ? 99 : orderIndex
    };
  }).sort((a, b) => a.orderIndex - b.orderIndex || Number(a.person.is_you) - Number(b.person.is_you) || a.index - b.index).map(({
    person
  }) => person), [people]);
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
    }, 15e3);
    return () => window.clearTimeout(timer);
  }, [boxOpening, revealSecretBox, secretOpened]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-[14px] bg-[#2a1348] border border-[#442371] grid place-items-center", children: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-[#c788fa]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-wide", children: "CASE SUMMARY" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        isInvestigator && /* @__PURE__ */ jsxs("button", { onClick: () => onOpenInfoModal("strategy"), className: "inline-flex items-center gap-2 rounded-full bg-[#3ca9f9] px-6 py-2.5 text-[15px] font-bold text-white hover:opacity-90 transition-opacity", children: [
          /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5" }),
          " Strategy Guide"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => onOpenInfoModal("rules"), className: "inline-flex items-center gap-2 rounded-full bg-[#f4be47] px-6 py-2.5 text-[15px] font-bold text-white hover:opacity-90 transition-opacity", children: [
          /* @__PURE__ */ jsx(Gamepad2, { className: "h-5 w-5" }),
          " View Game Rules"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-8 relative overflow-hidden flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-[34px] font-bold text-[#ddc1ff]", children: gameData.game.title }),
          gameData.game.tagline ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-[15px] text-white/70", children: gameData.game.tagline }) : null,
          /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr]", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-6 text-[15px] leading-[1.6]", children: [
              gameData.game.case_summary_html ? /* @__PURE__ */ jsx("div", { className: "prose prose-invert max-w-none text-white/80 [&_p]:mb-4 [&_.text-red-500]:text-[#fb5f5f]", dangerouslySetInnerHTML: {
                __html: gameData.game.case_summary_html
              } }) : null,
              gameData.game.timeline.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-[13px] uppercase tracking-wider text-white", children: "ON THE NIGHT OF THE MURDER" }),
                /* @__PURE__ */ jsx("ol", { className: "relative border-l-2 border-[#69429e] ml-2 space-y-7", children: gameData.game.timeline.map((step) => /* @__PURE__ */ jsx(Step, { time: step.time, text: step.event }, `${step.time}-${step.event}`)) })
              ] }) : null,
              /* @__PURE__ */ jsxs("div", { className: "inline-block mt-4 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#c9a773] text-[#331100] text-sm px-5 py-3 shadow-lg rotate-[-1deg] border border-[#a68653]", style: {
                boxShadow: "2px 3px 6px rgba(0,0,0,0.4)",
                borderRadius: "2px 6px 3px 5px"
              }, children: [
                "Now, ",
                /* @__PURE__ */ jsx("span", { className: "text-[#c11c1c] font-bold", children: "everyone" }),
                " present in the house is a",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-[#c11c1c] font-bold", children: "suspect." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative min-h-[400px]", children: [
              /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-0 rotate-[-5deg] bg-[#eae6e1] p-1.5 shadow-[2px_4px_12px_rgba(0,0,0,0.5)] w-[180px] z-10 border border-[#b4aea4]", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 text-2xl drop-shadow-md z-20", children: "📌" }),
                /* @__PURE__ */ jsx("img", { src: photoUrls[0] ?? mystery, alt: "", className: "h-[120px] w-full object-cover border border-[#c9c5be]" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "absolute top-[80px] left-[70px] rotate-[6deg] bg-[#1a1a1a] p-1.5 shadow-[2px_4px_12px_rgba(0,0,0,0.5)] w-[190px] z-20 border border-[#333]", children: /* @__PURE__ */ jsx("img", { src: photoUrls[1] ?? mystery, alt: "", className: "h-[130px] w-full object-cover opacity-90 sepia-[0.3]" }) }),
              /* @__PURE__ */ jsx("div", { className: "absolute top-[170px] left-[10px] w-14 h-14 z-30", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full rounded-full border-4 border-[#b59a60] bg-[#e1c583] flex items-center justify-center shadow-[2px_3px_8px_rgba(0,0,0,0.6)] rotate-[-15deg]", children: /* @__PURE__ */ jsx("div", { className: "w-1 h-8 bg-[#333] rotate-45 relative", children: /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-600" }) }) }) }),
              gameData.game.quick_facts.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "absolute bottom-[20px] right-[10px] rotate-[-3deg] bg-[#c3a478] text-[#331800] p-4 shadow-[3px_5px_15px_rgba(0,0,0,0.5)] w-[190px] z-40 border border-[#a68653]", style: {
                background: "linear-gradient(135deg, #ccae81 0%, #ba9866 100%)"
              }, children: [
                /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-md z-50 text-red-600", children: "📌" }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] font-bold tracking-wider mb-2 text-[#4a2600]", children: "QUICK FACTS" }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-[10px] font-medium", children: gameData.game.quick_facts.map((fact) => {
                  const Icon = FACT_ICONS[fact.icon] ?? MapPin;
                  return /* @__PURE__ */ jsxs("li", { className: "flex gap-1.5 items-start", children: [
                    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3 shrink-0 mt-0.5 opacity-80" }),
                    /* @__PURE__ */ jsxs("span", { className: "leading-tight", children: [
                      fact.label,
                      ": ",
                      fact.value
                    ] })
                  ] }, `${fact.label}-${fact.value}`);
                }) })
              ] }) : null
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 flex justify-center w-full", children: /* @__PURE__ */ jsxs("button", { onClick: () => setOpenPhotos(true), className: "inline-flex items-center gap-2 rounded-[20px] bg-[#b15cf7] px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_0_15px_rgba(177,92,247,0.3)] hover:bg-[#a643f8] transition-colors", children: [
          /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5" }),
          " View Investigation Photos"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 pb-8", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-center text-lg font-bold tracking-tight text-white mb-6", children: "Key People in the Bungalow" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2.5", children: orderedPeople.map((person) => {
            const {
              displayName,
              title
            } = splitCharacterName(person.name);
            const roleLabel = title ?? roleDisplayName(person);
            const bottomLabel = secretOpened && person.is_you ? "(You)" : displayName;
            const isYou = person.is_you;
            return /* @__PURE__ */ jsxs("div", { className: `overflow-hidden rounded-xl border transition-all ${isYou ? "border-[#b15cf7] ring-1 ring-[#b15cf7] bg-[#2a1348]" : "border-[#3b235d] bg-[#1a0c27]"}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-[4/5] bg-black overflow-hidden", children: [
                /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(person.role_image) ?? mystery, alt: displayName, className: "w-full h-full object-cover object-top opacity-90" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#1a0c27] to-transparent" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "px-1 py-2 text-center h-[46px] flex flex-col justify-center", children: [
                /* @__PURE__ */ jsx("div", { className: "truncate text-[9.5px] leading-tight text-white/90", title: roleLabel, children: roleLabel }),
                /* @__PURE__ */ jsx("div", { className: `mt-0.5 truncate text-[10.5px] font-semibold leading-tight ${isYou ? "text-[#e675ff]" : "text-[#de6df2]"}`, title: bottomLabel, children: bottomLabel })
              ] })
            ] }, person.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2 h-[340px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 text-center relative overflow-hidden flex flex-col justify-between items-center h-full", children: [
            /* @__PURE__ */ jsx("style", { children: `
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
              ` }),
            /* @__PURE__ */ jsxs("h3", { className: "text-[15px] font-medium text-white px-2 leading-snug", children: [
              "Open the Secret Box to",
              /* @__PURE__ */ jsx("br", {}),
              "reveal your role."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `my-3 relative w-40 h-40 transition-transform flex items-center justify-center ${secretOpened ? "opacity-50 grayscale pointer-events-none" : "hover:scale-105"}`, children: [
              !secretOpened && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[#b15cf7]/20 blur-[30px] rounded-full scale-75" }),
              /* @__PURE__ */ jsx("button", { type: "button", disabled: secretOpened || boxOpening, onClick: revealSecretBox, className: "relative z-10 w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: secretBoxImg, alt: "Secret Box", className: `h-[120%] w-[120%] object-contain max-w-none ${secretOpened ? "opacity-50" : boxOpening ? "animate-boxOpen" : "animate-float"}` }) })
            ] }),
            /* @__PURE__ */ jsx("button", { disabled: secretOpened || boxOpening, onClick: revealSecretBox, className: `w-full rounded-[20px] py-3 text-[14.5px] font-bold transition-all ${secretOpened ? "bg-[#2a1b3d] text-white/40 cursor-not-allowed border border-[#3b235d]" : "bg-gradient-to-r from-[#b15cf7] to-[#da61f6] hover:opacity-90 shadow-[0_0_15px_rgba(177,92,247,0.3)] text-white"}`, children: secretOpened ? "Role Revealed" : "Open Secret Box" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-[#3b235d] bg-[#1a0c27] p-6 text-center flex flex-col justify-between h-full", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[15px] leading-relaxed text-white/90 px-1 mt-2", children: "You can view the case summary only once. Remember the details!" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-3xl border border-[#3b235d] bg-[#221035] p-6 h-[170px] flex flex-col items-center justify-center shadow-inner", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[13px] text-white/70 leading-snug mb-3", children: "Time Remaining for Case Summary" }),
              /* @__PURE__ */ jsx("div", { className: "text-[44px] font-bold tabular-nums tracking-wide text-white", children: fmt(secsCase) })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
const PLAYER_GRADS = ["from-pink-500 to-orange-400", "from-violet-500 to-purple-500", "from-cyan-400 to-blue-500", "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500"];
function InvestigationView(props) {
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
    lieTally
  } = props;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "00")}:${String(s % 60).padStart(2, "00")}`;
  const shortBySessionId = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const p of players) map.set(Number(p.session_id), p.is_you ? `${p.pseudonym} (You)` : p.pseudonym);
    return map;
  }, [players]);
  const initials = (pseudonym) => pseudonym.slice(0, 2).toUpperCase();
  const roleImageByIndex = useMemo(() => {
    return people.map((person) => person.role_image ? resolveMediaUrl(person.role_image) : null);
  }, [people]);
  const roleImageBySessionId = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    players.forEach((p, i) => map.set(Number(p.session_id), roleImageByIndex[i] ?? null));
    return map;
  }, [players, roleImageByIndex]);
  const scoreBoard = /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-[15px] font-bold mb-4 text-white", children: "Score Board" }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-2 text-center text-[12px]", children: players.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-white/60 truncate", children: p.is_you ? "You" : p.pseudonym }),
      /* @__PURE__ */ jsx("div", { className: "text-amber-400 font-bold", children: scoresBySessionId.get(Number(p.session_id)) ?? 0 })
    ] }, p.session_id)) })
  ] });
  const feedItems = lieMode ? activity.filter((a) => a.isLie) : activity;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] px-6 py-5 flex items-center gap-4 flex-wrap pb-7", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-full bg-purple-500/20 grid place-items-center border border-purple-500/30", children: lieMode ? /* @__PURE__ */ jsx(ScanSearch, { className: "h-5 w-5 text-purple-300" }) : /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-purple-300" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-wide text-white", children: lieMode ? "Lie Detector Mode" : "Investigation" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-6 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => openModal("summary"), className: "inline-flex items-center gap-2 rounded-full bg-[#00d084] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
            " Case Summary"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 text-[10px] text-[#00d084] whitespace-nowrap", children: [
            "Available for ",
            caseSummaryMins,
            ":00 minutes only"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-0.5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50", children: lieMode ? "Lie Detector Mode Time Left" : "Investigation Time Left" }),
          lieMode ? /* @__PURE__ */ jsx(DeadlineCountdown, { endsAtMs: lieEndsAt, className: "text-[#facc15] text-xl font-bold tabular-nums leading-none" }) : /* @__PURE__ */ jsx("div", { className: "text-[#facc15] text-xl font-bold tabular-nums leading-none", children: fmt(invSecs) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-0.5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50", children: "Questions Left" }),
          /* @__PURE__ */ jsx("div", { className: "text-white text-xl font-bold leading-none", children: lieMode ? `${lieQuestionsLeft}/${lieMaxQuestions}` : `${questionsLeft}/${maxQuestions}` })
        ] }),
        isInvestigator && /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: onToggleLieDetector, className: `inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-bold transition-opacity ${lieMode ? "bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-[#3b82f6] text-white hover:opacity-90"}`, children: [
            /* @__PURE__ */ jsx(ScanSearch, { className: "h-4 w-4" }),
            " Lie Detector"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#00d084] whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-[#00d084]" }),
            lieMode ? "Active" : "Available"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => openModal("clue"), className: "inline-flex items-center gap-2 rounded-full bg-[#eab308] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity", children: [
            /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4" }),
            " Clue Room"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#eab308] whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-[#eab308]" }),
            "New Clue"
          ] })
        ] }),
        !isCulprit && /* @__PURE__ */ jsxs("button", { onClick: () => openModal("accuse"), disabled: myAccusationSubmitted, className: "inline-flex items-center gap-2 rounded-full bg-[#f43f5e] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsx(UserX, { className: "h-4 w-4" }),
          " ",
          myAccusationSubmitted ? "Accusation Submitted" : "Final Accusation"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-[260px_1fr_320px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-[#1e103c] rounded-none lg:rounded-2xl border-0 lg:border lg:border-[#3b2a59] p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[22px] font-bold mb-5 text-white", children: "Players" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: players.map((p, i) => {
          const sid = Number(p.session_id);
          const frozen = frozenSessionIds.has(sid);
          const isOnline = onlineSessionIds.has(sid);
          const answeringItem = activity.find((a) => Number(a.toSessionId) === sid && !a.a);
          const isAnswering = !!answeringItem;
          const roleImage = roleImageByIndex[i] ?? null;
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
          return /* @__PURE__ */ jsxs("button", { type: "button", disabled: p.is_you || frozen, onClick: () => {
            if (isInvestigator) setSelectedAskee(i);
          }, className: `w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border border-[#3b2a59] bg-[#2a174c] hover:border-purple-400/40 ${i === selectedAskee && isInvestigator ? "ring-1 ring-purple-400/40 border-purple-400/40" : ""} ${frozen ? "opacity-40" : ""}`, children: [
            /* @__PURE__ */ jsx("div", { className: "relative h-14 w-14 rounded-full overflow-hidden shrink-0 shadow-lg", children: roleImage ? /* @__PURE__ */ jsx("img", { src: roleImage, alt: "role", className: "w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: `h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-sm font-bold text-white`, children: initials(p.pseudonym) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-[17px] text-white break-words", children: [
                p.pseudonym,
                " ",
                p.is_you && /* @__PURE__ */ jsx("span", { className: "font-normal", children: "(You)" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: `text-[15px] flex items-center gap-2 mt-1 ${statusColor}`, children: [
                /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full shrink-0 ${statusDot}` }),
                " ",
                statusText
              ] })
            ] }),
            isAnswering && /* @__PURE__ */ jsx(AnswerCountdown, { askedAt: answeringItem?.askedAt, totalSecs: answerSecs, className: "shrink-0 text-[#facc15] text-lg font-semibold tabular-nums whitespace-nowrap" })
          ] }, p.session_id);
        }) }),
        yourRole ? /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-8", children: [
          /* @__PURE__ */ jsx("div", { className: "h-px bg-white/10 mb-6 w-full" }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50 mb-1 uppercase tracking-widest", children: "Your Role" }),
          /* @__PURE__ */ jsx("div", { className: "text-purple-300 text-base font-black tracking-widest uppercase", children: roleDisplayName(yourRole) }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/50 mt-1 leading-relaxed", children: "Ask up to 5 questions to uncover the truth" })
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: lieMode ? "Lie Detector Mode Activated" : isInvestigator ? "Ask a Question" : "Investigation In Progress" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-white/70 mt-1", children: lieMode ? `Investigator can ask maximum ${lieMaxQuestions} questions to any player in Lie Detector mode. Other players will vote on the answers.` : isInvestigator ? "Select a player to ask a question" : "The Investigator is questioning suspects. If a question comes to you, an answer window will open automatically — you have limited time to respond." })
            ] }),
            lieMode && /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-sm text-white whitespace-nowrap", children: [
              lieQuestionsUsed,
              "/",
              lieMaxQuestions,
              " Question"
            ] })
          ] }),
          isInvestigator ? /* @__PURE__ */ jsxs(Fragment, { children: [
            locked && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
              " Waiting for answer — input locked while the timer runs."
            ] }),
            /* @__PURE__ */ jsxs("fieldset", { disabled: locked, "aria-busy": locked, className: locked ? "opacity-60 pointer-events-none select-none" : "", children: [
              /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-6 justify-start", children: players.map((p, i) => {
                const roleImage = roleImageByIndex[i] ?? null;
                const isSelected = i === selectedAskee;
                return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelectedAskee(i), disabled: p.is_you || frozenSessionIds.has(p.session_id), className: `relative flex flex-col items-center gap-3 text-center transition disabled:opacity-40 disabled:cursor-not-allowed`, children: [
                  /* @__PURE__ */ jsxs("div", { className: `relative w-[120px] h-[155px] rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all bg-transparent ${isSelected ? "border-[#c492ed]" : "border-[#4a3473] hover:border-purple-400/60"}`, children: [
                    /* @__PURE__ */ jsx("div", { className: "h-[90px] w-[90px] rounded-full overflow-hidden shadow-lg flex-shrink-0", children: roleImage ? /* @__PURE__ */ jsx("img", { src: roleImage, alt: p.pseudonym, className: "object-cover" }) : /* @__PURE__ */ jsx("div", { className: `h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-2xl font-bold text-white`, children: initials(p.pseudonym) }) }),
                    /* @__PURE__ */ jsxs("div", { className: "text-[14px] text-white leading-tight flex flex-col items-center gap-0.5", children: [
                      p.pseudonym,
                      p.is_you && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-white/70", children: "(You)" })
                    ] })
                  ] }),
                  isSelected && /* @__PURE__ */ jsx("div", { className: "absolute -bottom-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-[#1a0f2e] border-[3px] border-[#c492ed] flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-3 w-3 bg-white rounded-full" }) })
                ] }, p.session_id);
              }) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs text-white/70", children: "Type your question (max 120 characters)" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 relative", children: [
                  /* @__PURE__ */ jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value.slice(0, 120)), placeholder: "Type your question here...", className: "w-full h-24 rounded-xl bg-transparent border border-white/15 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7] disabled:cursor-not-allowed resize-none" }),
                  /* @__PURE__ */ jsxs("span", { className: "absolute bottom-3 right-3 text-[10px] text-white/50", children: [
                    question.length,
                    "/120"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: sendQuestion, disabled: !question.trim() || (lieMode ? lieQuestionsLeft <= 0 : questionsLeft <= 0) || locked, className: "mt-5 w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-3 text-sm font-bold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90", children: "Send Question" })
            ] })
          ] }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-white/70 block mb-5", children: "All Players" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-6 justify-start", children: players.map((p, i) => {
              const frozen = frozenSessionIds.has(p.session_id);
              const roleImage = roleImageByIndex[i] ?? null;
              return /* @__PURE__ */ jsx("div", { className: `flex flex-col items-center gap-0 ${frozen ? "opacity-40" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "relative w-[120px] h-[155px] rounded-2xl flex flex-col items-center justify-center gap-3 border border-[#4a3473] bg-transparent", children: [
                /* @__PURE__ */ jsx("div", { className: "h-[90px] w-[90px] rounded-full overflow-hidden shadow-lg flex-shrink-0", children: roleImage ? /* @__PURE__ */ jsx("img", { src: roleImage, alt: p.pseudonym, className: "w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: `h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-2xl font-bold text-white`, children: initials(p.pseudonym) }) }),
                /* @__PURE__ */ jsxs("div", { className: "text-[14px] text-white leading-tight text-center flex flex-col items-center gap-0.5", children: [
                  p.pseudonym,
                  p.is_you && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-white/70", children: "(You)" })
                ] })
              ] }) }, p.session_id);
            }) })
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "All answers are visible to everyone after the player submits." })
        ] }),
        lieMode && scoreBoard
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: `text-[15px] font-bold mb-4 ${lieMode ? "text-pink-400" : "text-white"}`, children: lieMode ? "Lie Detector Mode Q/A" : "Recent Activity" }),
          /* @__PURE__ */ jsxs("ul", { className: `space-y-3 overflow-auto pr-1 ${lieMode ? "max-h-[560px]" : "max-h-[400px]"}`, children: [
            feedItems.length === 0 && /* @__PURE__ */ jsx("li", { className: "text-xs text-white/50 text-center py-6", children: lieMode ? "No questions asked yet in Lie Detector mode." : "No activity yet." }),
            feedItems.map((a) => {
              const targetShort = shortBySessionId.get(Number(a.toSessionId)) ?? "Player";
              const targetImage = roleImageBySessionId.get(Number(a.toSessionId)) ?? null;
              const askerImage = a.fromSessionId != null ? roleImageBySessionId.get(Number(a.fromSessionId)) ?? null : null;
              return /* @__PURE__ */ jsxs("li", { className: "rounded-xl bg-[#2a174c] border border-transparent p-4 relative", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx(ActivityAvatar, { image: askerImage, fallback: isInvestigator ? "YOU" : "INV" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/50", children: [
                      isInvestigator ? "You asked" : "Investigator asked",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-pink-400", children: targetShort })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-[13px] text-white mt-1", children: a.q }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/30 mt-1", children: "02:35" })
                  ] })
                ] }),
                a.a && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start gap-3 relative", children: [
                  /* @__PURE__ */ jsx(ActivityAvatar, { image: targetImage, fallback: targetShort.slice(0, 2).toUpperCase() }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 pr-24", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-pink-400", children: [
                      targetShort,
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-white/50", children: a.autoSkipped ? "did not answer" : "Answered" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: `text-[13px] text-white mt-1 ${a.autoSkipped ? "text-white/50 italic" : ""}`, children: a.a }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/30 mt-1", children: "03:37" })
                  ] }),
                  a.isLie && (a.tally ?? lieTally) && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-3 text-right space-y-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-emerald-400", children: [
                      "Believable (",
                      (a.tally ?? lieTally).believable,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-rose-400", children: [
                      "Suspicious (",
                      (a.tally ?? lieTally).suspicious,
                      ")"
                    ] })
                  ] })
                ] }),
                !a.a && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx(ActivityAvatar, { image: targetImage, fallback: targetShort.slice(0, 2).toUpperCase() }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-pink-400", children: [
                      targetShort,
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-white/50", children: "Answering" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-[13px] text-amber-400 mt-1", children: "Waiting for answer..." }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/30 mt-1", children: "03:37" })
                  ] })
                ] })
              ] }, a.questionId);
            })
          ] })
        ] }),
        !lieMode && scoreBoard
      ] })
    ] })
  ] });
}
function Step({
  time,
  text
}) {
  return /* @__PURE__ */ jsxs("li", { className: "relative pl-7", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute left-[-9px] top-0.5 h-[18px] w-[18px] rounded-full border-[3px] border-[#9352e8] bg-[#1a0c27]" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-white text-[13px] w-[70px] shrink-0 font-medium", children: time }),
      /* @__PURE__ */ jsx("span", { className: "text-white/80 text-[13px] leading-[1.6]", children: text })
    ] })
  ] });
}
function ModalShell({
  children,
  onClose,
  max = "max-w-lg"
}) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { onClick: (e) => e.stopPropagation(), className: `relative w-full ${max} rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated`, children: [
    /* @__PURE__ */ jsx("button", { onClick: onClose, className: "absolute top-4 right-4 z-10 h-9 w-9 grid place-items-center rounded-xl bg-purple-700/40 hover:bg-purple-600/60", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) }),
    children
  ] }) });
}
function InfoSliderModal({
  type,
  slideIndex,
  slides,
  onClose,
  onPrev,
  onNext,
  onSelectSlide
}) {
  const slide = slides[slideIndex];
  return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-3xl", children: /* @__PURE__ */ jsxs("div", { className: "p-7", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-emerald-300", children: type === "strategy" ? "Strategy Guide" : "Game Rules" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-3xl font-black text-white", children: slide.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-white/70", children: slide.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70", children: [
        /* @__PURE__ */ jsx("span", { children: slideIndex + 1 }),
        /* @__PURE__ */ jsx("span", { children: "/" }),
        /* @__PURE__ */ jsx("span", { children: slides.length })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5", children: /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: slide.details.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/80", children: item })
    ] }, index)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2", children: slides.map((_, index) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onSelectSlide(index), className: `h-2.5 w-10 rounded-full ${index === slideIndex ? "bg-emerald-300" : "bg-white/20 hover:bg-white/30"}` }, index)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: onPrev, className: "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50", disabled: slideIndex === 0, children: "Previous" }),
        /* @__PURE__ */ jsx("button", { onClick: onNext, className: "inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold shadow-glow", disabled: slideIndex === slides.length - 1, children: "Next" })
      ] })
    ] })
  ] }) });
}
function roleDisplayName(person) {
  const label = person.role_label || person.role;
  const match = label.match(/you are (?:the )?(.+)/i);
  return match ? match[1].trim() : label;
}
function splitCharacterName(rawName) {
  const match = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return {
      displayName: match[1].trim(),
      title: match[2].trim()
    };
  }
  return {
    displayName: rawName.trim(),
    title: null
  };
}
function YourRoleModal({
  person,
  onClose
}) {
  const roleName = roleDisplayName(person);
  const roleTagline = person.role_subtitle || person.role_label || person.role;
  return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-3xl", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[minmax(200px,240px)_1fr] overflow-hidden rounded-3xl bg-[#1a0f2e]", children: [
    /* @__PURE__ */ jsxs("div", { className: `relative bg-gradient-to-br ${person.grad} min-h-[280px] md:min-h-[360px]`, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3 z-10 h-9 w-9 rounded-full border border-purple-400/40 bg-black/40 grid place-items-center", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-purple-300" }) }),
      person.role_image ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(person.role_image) ?? "", alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "h-full grid place-items-center", children: /* @__PURE__ */ jsx(Eye, { className: "h-16 w-16 text-white/80" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-7 flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm text-purple-300/90", children: "Your Role" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-1 text-3xl md:text-4xl font-black tracking-wide text-purple-200 uppercase", children: roleName }),
      roleTagline ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/75 leading-relaxed", children: roleTagline }) : null,
      person.objective ? /* @__PURE__ */ jsx(Section, { title: "OBJECTIVE", items: [person.objective], icon: "🎯" }) : null,
      person.youKnow.length > 0 ? /* @__PURE__ */ jsx(Section, { title: "WHAT YOU KNOW", items: person.youKnow, icon: "💡" }) : null,
      person.keep.length > 0 ? /* @__PURE__ */ jsx(Section, { title: "KEEP IN MIND", items: person.keep, icon: "📌" }) : null,
      /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3 flex items-center gap-2 text-sm text-white/80", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-white/70 shrink-0" }),
        " Keep your role secret"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Okay, Continue" })
    ] })
  ] }) });
}
function Section({
  title,
  items,
  icon
}) {
  return /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-bold tracking-widest text-purple-300 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { children: icon }),
      " ",
      title
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "mt-1.5 space-y-1 text-xs text-white/85 list-disc pl-5", children: items.map((t, i) => /* @__PURE__ */ jsx("li", { children: t }, i)) })
  ] });
}
function PhotosModal({
  photos,
  onClose
}) {
  const [zoomedImage, setZoomedImage] = useState(null);
  if (zoomedImage) {
    return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur p-4", onClick: () => setZoomedImage(null), children: [
      /* @__PURE__ */ jsx("button", { className: "absolute top-6 right-6 h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("img", { src: zoomedImage, alt: "Zoomed Evidence", className: "max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl", onClick: (e) => e.stopPropagation() })
    ] });
  }
  return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-7", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full border border-purple-400/40 grid place-items-center", children: /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5 text-purple-300" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Investigation Photos" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/65", children: "You can submit your accusation now." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 grid grid-cols-3 gap-3", children: (photos.length > 0 ? photos : [mystery]).map((src, i) => /* @__PURE__ */ jsxs("div", { onClick: () => setZoomedImage(src), className: "relative group aspect-square overflow-hidden rounded-xl ring-1 ring-white/10 cursor-zoom-in", children: [
      /* @__PURE__ */ jsx("img", { src, alt: `Evidence ${i + 1}`, className: "h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 text-zinc-800 grid place-items-center", children: /* @__PURE__ */ jsx(ZoomIn, { className: "h-3.5 w-3.5" }) })
    ] }, i)) }),
    /* @__PURE__ */ jsx("p", { className: "mt-5 text-center text-xs text-white/70", children: "Check the image carefully, you might get clues." }),
    /* @__PURE__ */ jsx("button", { onClick: onClose, className: "mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Okay Continue" })
  ] }) });
}
function AnswerModal({
  question,
  answerSecs,
  onSubmit,
  investigatorRole = "Investigator",
  onTimeout,
  activity,
  players,
  isInvestigator
}) {
  console.log("[AnswerModal] Rendered!", {
    question,
    answerSecs,
    onTimeout,
    activity,
    players,
    isInvestigator
  });
  const [ans, setAns] = useState("");
  const secs = useCountdown(answerSecs, onTimeout);
  const isTimeUp = secs === 0;
  useEffect(() => {
    console.log("[AnswerModal] question changed, resetting answer", {
      question
    });
    setAns("");
  }, [question]);
  const shortBySessionId = new Map(players.map((p) => [p.session_id, p.is_you ? `${p.pseudonym} (You)` : p.pseudonym]));
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-3 overflow-y-auto py-4", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg rounded-2xl border border-[#3b2a59] bg-[#1a0f2e] shadow-elevated", children: [
    /* @__PURE__ */ jsx("button", { onClick: () => {
    }, className: "absolute top-4 right-4 z-10 h-8 w-8 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 text-white opacity-80 cursor-not-allowed", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full border border-white/10 bg-black/40 grid place-items-center", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6 text-purple-300" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-bold tracking-tight text-white", children: [
            "You have been asked",
            /* @__PURE__ */ jsx("br", {}),
            "a Question"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/70 mt-1", children: [
            "By SC (",
            investigatorRole,
            ")"
          ] })
        ] })
      ] }),
      activity.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-white/80 mb-2", children: "Activity History" }),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/10 bg-black/20 p-3 max-h-[180px] overflow-y-auto space-y-2", children: activity.map((a) => {
          const targetShort = shortBySessionId.get(a.toSessionId) ?? "Player";
          return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-[#2a174c] p-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded-full bg-black/40 border border-white/10 grid place-items-center text-[6px] text-white font-bold shrink-0", children: isInvestigator ? "YOU" : "INV" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-white/50", children: [
                  isInvestigator ? "You asked" : "Investigator asked",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-pink-400", children: targetShort })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white mt-0.5", children: a.q })
              ] })
            ] }),
            a.a && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded-full bg-black/40 border border-white/10 grid place-items-center text-[6px] text-white font-bold shrink-0", children: targetShort.slice(0, 2).toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-pink-400", children: [
                  targetShort,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-white/50", children: a.autoSkipped ? "did not answer" : "Answered" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: `text-[11px] text-white mt-0.5 ${a.autoSkipped ? "text-white/50 italic" : ""}`, children: a.a })
              ] })
            ] })
          ] }, a.questionId);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-purple-500/30 bg-[#2b1754] p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-white/70 mb-1", children: "Current Question" }),
        /* @__PURE__ */ jsx("div", { className: "text-base text-white leading-relaxed", children: question })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `mt-4 text-center`, children: [
        /* @__PURE__ */ jsx(Clock, { className: `h-5 w-5 mx-auto ${isTimeUp ? "text-rose-400" : "text-white/40"}` }),
        /* @__PURE__ */ jsx("div", { className: `text-xs mt-1 ${isTimeUp ? "text-rose-300 font-bold" : "text-white/80"}`, children: "Time Left to answer" }),
        /* @__PURE__ */ jsx("div", { className: `text-3xl font-black tabular-nums tracking-wider mt-1 ${isTimeUp ? "text-rose-400" : "text-amber-400"}`, children: fmt(secs) }),
        isTimeUp && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-rose-300 font-semibold mt-2", children: "⚠️ Time's up! -10 points penalty applied." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white block mb-1", children: "Type your answer (max 120 characters)" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("textarea", { value: ans, onChange: (e) => setAns(e.target.value.slice(0, 120)), placeholder: "Type your answer here...", disabled: isTimeUp, className: `w-full h-20 rounded-xl bg-black/20 border border-white/20 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#a855f7] resize-none ${isTimeUp ? "opacity-50 cursor-not-allowed" : ""}` }),
          /* @__PURE__ */ jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/40", children: [
            ans.length,
            "/120"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => onSubmit(ans), disabled: !ans.trim() || isTimeUp, className: `mt-5 w-full rounded-full py-3 text-sm font-bold shadow-glow ${isTimeUp ? "bg-white/5 text-white/40 cursor-not-allowed" : "bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white disabled:opacity-40"}`, children: "Submit Answer" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-xs text-white/70", children: "Your answer will be visible to all players." })
    ] })
  ] }) });
}
function VoteModal({
  answererShort,
  answerText,
  question,
  onVote,
  onClose
}) {
  const [vote, setVote] = useState(null);
  return /* @__PURE__ */ jsx(ModalShell, { onClose, children: /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 grid place-items-center flex-shrink-0", children: /* @__PURE__ */ jsx(ScanSearch, { className: "h-6 w-6 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black", children: "Vote on the Answer" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "By SC (Investigator)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-7 rounded-2xl border-2 border-purple-400/50 bg-purple-500/15 p-5 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-white/50 uppercase tracking-widest font-bold mb-2", children: "Question" }),
      /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-purple-200", children: question })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-pink-300 font-semibold mb-2", children: [
        answererShort,
        "'s Answer"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/15 bg-black/30 p-4 text-base text-white/90 leading-relaxed", children: answerText })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm text-pink-300 font-semibold mb-4", children: "Select Votes" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setVote("believable"), className: `rounded-xl border py-4 px-4 text-center text-base font-semibold text-emerald-300 transition-all ${vote === "believable" ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.35)]" : "border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10"}`, children: "Believable" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setVote("suspicious"), className: `rounded-xl border py-4 px-4 text-center text-base font-semibold text-rose-400 transition-all ${vote === "suspicious" ? "border-rose-400 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.35)]" : "border-rose-500/60 hover:border-rose-400 hover:bg-rose-500/10"}`, children: "Suspicious" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: () => vote && onVote(vote), disabled: !vote, className: "mt-10 w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-4 text-base font-bold text-white shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90", children: "Submit Vote" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-xs text-white/60", children: "Your votes will be visible to all players." })
  ] }) });
}
function ClueRoomModal({
  clues,
  unlockSecs,
  unlocked,
  onClose
}) {
  const firstClue = clues[0] ?? null;
  const unlockLabel = `${Math.floor(unlockSecs / 60)}:${String(unlockSecs % 60).padStart(2, "0")}`;
  if (!unlocked) {
    return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto h-14 w-14 rounded-full border border-amber-400/50 bg-amber-500/10 grid place-items-center", children: /* @__PURE__ */ jsx(Lightbulb, { className: "h-6 w-6 text-amber-300" }) }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-black tracking-widest", children: "CLUE ROOM LOCKED" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-white/75", children: [
        "The Clue Room opens when ",
        unlockLabel,
        " minutes remain in the session. Keep questioning — the evidence will be revealed to everyone at the same time."
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Back to Investigation" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full border border-amber-400/50 bg-amber-500/10 grid place-items-center", children: /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5 text-amber-300" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-black tracking-widest", children: "CLUE ROOM" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-emerald-400", children: "Unlocked — visible to all players" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-square rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 grid place-items-center text-amber-200 font-black tracking-widest", children: "TOP SECRET" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-amber-300 text-sm font-bold", children: firstClue?.clue_title ?? "Clue unavailable" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/80 mt-1", children: firstClue?.clue_short_description ?? "A clue will appear here once it is unlocked." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-amber-300 text-sm font-bold", children: "Clue Details" }),
        firstClue?.clue_detail ? /* @__PURE__ */ jsx("p", { className: "text-xs text-white/80 mt-1", children: firstClue.clue_detail }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-white/80 mt-1", children: "No additional clue details are available." }),
        firstClue?.clue_image ? /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-hidden rounded-xl bg-zinc-900", children: /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(firstClue.clue_image) ?? mystery, alt: firstClue.clue_title, className: "h-36 w-full object-cover" }) }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-5 text-center text-xs text-white/70", children: "This clue is visible to all players. Use it wisely." })
  ] }) });
}
function AccuseModal({
  players,
  victimName,
  submitted,
  onSubmit,
  onClose
}) {
  const [pickSessionId, setPickSessionId] = useState(null);
  const [reason, setReason] = useState("");
  const candidates = players.filter((p) => !p.is_you);
  return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full border border-rose-400/50 bg-rose-500/10 grid place-items-center", children: /* @__PURE__ */ jsx(UserX, { className: "h-5 w-5 text-rose-300" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: victimName ? `Who Killed ${victimName}?` : "Make Your Final Accusation" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/65", children: "The investigation is over. Trust your instincts. Name the killer." })
      ] })
    ] }),
    submitted ? /* @__PURE__ */ jsx("p", { className: "mt-6 text-center text-sm text-emerald-300", children: "Your accusation has been submitted. Waiting for the other players…" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-5 gap-2", children: candidates.map((p, i) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setPickSessionId(p.session_id), className: `relative rounded-xl border p-2 text-center ${pickSessionId === p.session_id ? "border-purple-400 ring-2 ring-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: [
        /* @__PURE__ */ jsx("div", { className: `mx-auto h-14 w-14 rounded-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-sm font-bold`, children: p.pseudonym.slice(0, 2).toUpperCase() }),
        /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-[11px] font-semibold", children: p.pseudonym }),
        pickSessionId === p.session_id && /* @__PURE__ */ jsx("div", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-purple-500 ring-2 ring-purple-300" })
      ] }, p.session_id)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-white/80", children: "Why do you think this player is the culprit?" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 relative", children: [
          /* @__PURE__ */ jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value.slice(0, 120)), placeholder: "Type your reason here...", className: "w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400" }),
          /* @__PURE__ */ jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/50", children: [
            reason.length,
            "/120"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => pickSessionId != null && onSubmit(pickSessionId, reason.trim()), disabled: pickSessionId == null || !reason.trim(), className: "mt-5 block text-center w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed", children: "Submit Answer" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "Choose carefully. An innocent person's fate rests on your decision. Once submitted, you cannot change your answer." })
    ] })
  ] }) });
}
function CaseSummaryModal({
  gameData,
  photoUrls,
  onClose
}) {
  return /* @__PURE__ */ jsx(ModalShell, { onClose, max: "max-w-4xl", children: /* @__PURE__ */ jsxs("div", { className: "p-7 overflow-y-auto max-h-[80vh]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full border border-purple-400/40 grid place-items-center", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-purple-300" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold", children: "Case Summary" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/65", children: "Review the details of the case." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm leading-relaxed", children: [
        gameData.game.case_summary_html ? /* @__PURE__ */ jsx("div", { className: "prose prose-invert prose-sm max-w-none [&_p]:mb-3", dangerouslySetInnerHTML: {
          __html: gameData.game.case_summary_html
        } }) : /* @__PURE__ */ jsx("p", { className: "text-white/70", children: "No case summary content is available yet. Use the timeline and quick facts below to guide your investigation." }),
        gameData.game.timeline.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold uppercase tracking-wider text-white/90", children: "On the night of the murder" }),
          /* @__PURE__ */ jsx("ol", { className: "space-y-3 border-l-2 border-purple-500/40 pl-4", children: gameData.game.timeline.map((step) => /* @__PURE__ */ jsx(Step, { time: step.time, text: step.event }, `${step.time}-${step.event}`)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "inline-block bg-amber-100/95 text-zinc-900 text-xs px-3 py-1.5 rounded-sm", children: [
          "Now, ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-700 font-bold", children: "everyone" }),
          " present in the house is a ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-700 font-bold", children: "suspect." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative min-h-[320px]", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-4 rotate-[-6deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsx("img", { src: photoUrls[0] ?? mystery, alt: "Case photo", className: "h-32 w-44 object-cover" }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-12 right-2 rotate-[5deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsx("img", { src: photoUrls[1] ?? mystery, alt: "Case photo", className: "h-28 w-40 object-cover" }) }),
        gameData.game.quick_facts.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-2 right-6 rotate-[-2deg] rounded-md bg-amber-100/95 text-zinc-900 p-4 shadow-elevated", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-bold tracking-wider", children: "QUICK FACTS" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-[12px]", children: gameData.game.quick_facts.map((fact) => {
            const Icon = FACT_ICONS[fact.icon] ?? MapPin;
            return /* @__PURE__ */ jsxs("li", { className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
              fact.label,
              ": ",
              fact.value
            ] }, `${fact.label}-${fact.value}`);
          }) })
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: onClose, className: "mt-8 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Close Summary" })
  ] }) });
}
export {
  GamePage as component
};
