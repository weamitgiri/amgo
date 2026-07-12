import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { FileText, Lightbulb, Gamepad2, Video, Cloud, Calendar, MapPin, Camera, ScanSearch, UserX, Clock, Send, ShieldCheck, Eye, X, ZoomIn, ThumbsUp, ThumbsDown } from "lucide-react";
import { g as getParticipantSession, a as participantGameKey, p as participantService, L as Logo } from "./participant-session-MItZ-Ggq.js";
import { g as getSocket } from "./socket-Bwou9MYK.js";
import { r as resolveMediaUrl } from "./media-BmyD47-a.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { c as Route } from "./router-qdPwl0jo.js";
import "./config-qISbZfHI.js";
import "socket.io-client";
import "sonner";
import "@tanstack/react-query";
const secretBoxImg = "/assets/secret_box-DiVFSjEw.png";
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
    strategy: isInvestigator ? gameData?.strategy_slides ?? [] : gameData?.role_strategy_slides ?? [],
    rules: gameData?.rules ?? []
  }), [gameData, isInvestigator]);
  const photoUrls = useMemo(() => (gameData?.photos ?? []).map((p) => resolveMediaUrl(p.image) ?? mystery), [gameData]);
  const lieMode = lieDetectorRoundId !== null;
  const [selectedAskee, setSelectedAskee] = useState(0);
  const [question, setQuestion] = useState("");
  const [modal, setModal] = useState(null);
  const [questionsLeft, setQuestionsLeft] = useState(5);
  const [activity, setActivity] = useState([]);
  const [pendingAnswerForMe, setPendingAnswerForMe] = useState(null);
  const [voteContext, setVoteContext] = useState(null);
  const [lieTally, setLieTally] = useState(null);
  const [invElapsed, setInvElapsed] = useState(0);
  const autoCardRef = useRef(null);
  const applyGameState = useCallback((state) => {
    setGameState(state);
    setMyAccusationSubmitted(Boolean(state.group.my_accusation_submitted));
    const online = /* @__PURE__ */ new Set();
    const frozen = /* @__PURE__ */ new Set();
    const scores = /* @__PURE__ */ new Map();
    for (const s of state.group.participant_sessions) {
      if (s.is_online) online.add(s.id);
      if (s.left_at) frozen.add(s.id);
      scores.set(s.id, s.total_score);
    }
    setOnlineSessionIds(online);
    setFrozenSessionIds(frozen);
    setScoresBySessionId(scores);
    const activeRound = state.group.lie_detector_rounds.find((r) => r.status === "active");
    setLieDetectorRoundId(activeRound ? activeRound.id : null);
    const clueTimerUnlocked = state.group.timers.some((t) => t.timer_type === "clue_room_unlock" && !t.is_active);
    if (clueTimerUnlocked) setCluesUnlocked(true);
    setActivity(state.group.questions.map((q) => {
      const ans = q.answers?.[0];
      return {
        questionId: q.id,
        toSessionId: q.asked_to,
        q: q.question_text,
        a: ans?.answer_text,
        autoSkipped: ans?.auto_skipped,
        tally: activeRound?.tally
      };
    }));
  }, []);
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
      setQuestionsLeft(Math.max(0, data.settings.max_questions - state.group.questions.length));
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
      const item = {
        questionId: q.id,
        toSessionId: q.asked_to,
        q: q.question_text
      };
      setActivity((prev) => [item, ...prev]);
      setQuestionsLeft((n) => Math.max(0, n - 1));
      if (myPlayer?.session_id === q.asked_to) {
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
    const onLieDetectorStarted = (round) => setLieDetectorRoundId(round.id);
    const onLieDetectorEnded = () => setLieDetectorRoundId(null);
    const onPhaseChanged = (payload) => {
      if (payload.new_phase === "questioning") {
        setLieDetectorRoundId(null);
      }
    };
    const onCluesUnlocked = () => setCluesUnlocked(true);
    const onAccusationSubmitted = (payload) => {
      if (myPlayer?.session_id === payload.participant_session_id) setMyAccusationSubmitted(true);
    };
    const onParticipantLeft = (payload) => {
      setFrozenSessionIds((prev) => new Set(prev).add(payload.participant_session_id));
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
    if (loading || !gameData || isInvestigator) return;
    const delayMs = (gameData.settings.strategy_guide_delay_secs || 120) * 1e3;
    const timer = window.setTimeout(() => {
      setGuideModal("strategy");
      setGuideSlide(0);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [loading, gameData, isInvestigator]);
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
  const sendQuestion = async () => {
    const target = players[selectedAskee];
    if (!question.trim() || questionsLeft <= 0 || !target || target.is_you || !session?.participantId) return;
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0d0820] text-white p-4 md:p-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: gameData.activity.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm", children: [
          "Game Time Remaining ",
          /* @__PURE__ */ jsx("span", { className: "ml-2 font-bold tabular-nums", children: fmt(secsHdr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold", children: (gameData.participant.name[0] ?? "P").toUpperCase() }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: gameData.participant.name })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4" }),
    phase === "summary" ? /* @__PURE__ */ jsx(SummaryView, { gameData, people, photoUrls, fmt, secsCase, secretOpened, onRevealRole: () => setRoleModalOpen(true), setSecretOpened, setRoleViewed, setOpenPhotos, onBegin: () => setPhase("investigation"), onOpenInfoModal: (type) => {
      setGuideModal(type);
      setGuideSlide(0);
    } }) : /* @__PURE__ */ jsx(InvestigationView, { players, yourRole: yourPerson, isInvestigator, isCulprit, caseSummaryMins: Math.round(gameData.settings.case_summary_view_secs / 60), maxQuestions: gameData.settings.max_questions, lieMaxQuestions: gameData.settings.lie_detector_max_questions, questionsLeft, invSecs: secsHdr, selectedAskee, setSelectedAskee, question, setQuestion, sendQuestion, activity, openModal: setModal, locked: activity.some((a) => !a.a), lieMode, onToggleLieDetector: toggleLieDetector, cluesUnlocked, myAccusationSubmitted, frozenSessionIds, onlineSessionIds, scoresBySessionId, lieTally }),
    roleModalOpen && yourPerson && /* @__PURE__ */ jsx(YourRoleModal, { person: yourPerson, onClose: () => {
      setRoleModalOpen(false);
      setRoleViewed(true);
    } }),
    openPhotos && /* @__PURE__ */ jsx(PhotosModal, { photos: photoUrls, onClose: () => setOpenPhotos(false) }),
    guideModal !== null && guideSlides[guideModal].length > 0 && /* @__PURE__ */ jsx(InfoSliderModal, { type: guideModal, slideIndex: guideSlide, slides: guideSlides[guideModal], onClose: () => setGuideModal(null), onPrev: () => setGuideSlide((i) => Math.max(0, i - 1)), onNext: () => setGuideSlide((i) => Math.min(guideSlides[guideModal].length - 1, i + 1)), onSelectSlide: (index) => setGuideSlide(index) }),
    pendingAnswerForMe && /* @__PURE__ */ jsx(AnswerModal, { question: pendingAnswerForMe.q, answerSecs: gameData.settings.question_response_secs, onSubmit: submitAnswer }),
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
    secretOpened,
    onRevealRole,
    setSecretOpened,
    setRoleViewed,
    setOpenPhotos,
    onBegin,
    onOpenInfoModal
  } = props;
  const [boxOpening, setBoxOpening] = useState(false);
  const caseMins = Math.round(gameData.settings.case_summary_view_secs / 60);
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
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-purple-200" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-wide", children: "CASE SUMMARY" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => onOpenInfoModal("strategy"), className: "inline-flex items-center gap-2 rounded-full bg-gradient-blue px-5 py-2.5 text-sm font-semibold shadow-glow", children: [
          /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4" }),
          " Strategy Guide"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => onOpenInfoModal("rules"), className: "inline-flex items-center gap-2 rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold shadow-glow", children: [
          /* @__PURE__ */ jsx(Gamepad2, { className: "h-4 w-4" }),
          " View Game Rules"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mt-5 grid gap-5 lg:grid-cols-[2fr_1.4fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-7 relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black text-purple-200", children: gameData.game.title }),
        gameData.game.tagline ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/70", children: gameData.game.tagline }) : null,
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm leading-relaxed", children: [
            gameData.game.case_summary_html ? /* @__PURE__ */ jsx("div", { className: "prose prose-invert prose-sm max-w-none [&_p]:mb-3", dangerouslySetInnerHTML: {
              __html: gameData.game.case_summary_html
            } }) : null,
            gameData.game.timeline.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold uppercase tracking-wider text-white/90", children: "On the night of the murder" }),
              /* @__PURE__ */ jsx("ol", { className: "space-y-3 border-l-2 border-purple-500/40 pl-4", children: gameData.game.timeline.map((step) => /* @__PURE__ */ jsx(Step, { time: step.time, text: step.event }, `${step.time}-${step.event}`)) })
            ] }) : null,
            /* @__PURE__ */ jsxs("div", { className: "inline-block bg-amber-100/95 text-zinc-900 text-xs px-3 py-1.5 rounded-sm rotate-[-1deg]", children: [
              "Now, ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-700 font-bold", children: "everyone" }),
              " present in the house is a",
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-700 font-bold", children: "suspect." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative min-h-[320px]", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-4 rotate-[-6deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsx("img", { src: photoUrls[0] ?? mystery, alt: "", className: "h-32 w-44 object-cover" }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-12 right-2 rotate-[5deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsx("img", { src: photoUrls[1] ?? mystery, alt: "", className: "h-28 w-40 object-cover" }) }),
            gameData.game.quick_facts.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-2 right-6 rotate-[-2deg] rounded-md bg-amber-100/95 text-zinc-900 p-4 shadow-elevated", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-bold tracking-wider", children: "QUICK FACTS" }),
              /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-[12px]", children: gameData.game.quick_facts.map((fact) => {
                const Icon = FACT_ICONS[fact.icon] ?? MapPin;
                return /* @__PURE__ */ jsxs("li", { className: "flex gap-2 items-center", children: [
                  /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 shrink-0" }),
                  fact.label,
                  ": ",
                  fact.value
                ] }, `${fact.label}-${fact.value}`);
              }) })
            ] }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-7 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setOpenPhotos(true), className: "inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold shadow-glow", children: [
            /* @__PURE__ */ jsx(Camera, { className: "h-4 w-4" }),
            " View Investigation Photos"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: onBegin, className: "inline-flex items-center gap-2 rounded-full bg-gradient-warm px-6 py-3 text-sm font-semibold shadow-glow", children: [
            /* @__PURE__ */ jsx(ScanSearch, { className: "h-4 w-4" }),
            " Begin Investigation"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-7", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-center text-lg font-bold tracking-tight text-white", children: "Key People in the Bungalow" }),
          /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-5 gap-2 sm:gap-3", children: orderedPeople.map((person) => {
            const {
              displayName,
              title
            } = splitCharacterName(person.name);
            const roleLabel = title ?? roleDisplayName(person);
            const bottomLabel = secretOpened && person.is_you ? "(You)" : displayName;
            return /* @__PURE__ */ jsxs("div", { className: `overflow-hidden rounded-xl border shadow-sm transition-all ${secretOpened && person.is_you ? "ring-2 ring-fuchsia-500 border-fuchsia-500/80 bg-[#241334]" : "bg-[#1b1223] border-white/10"}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-[4/5] bg-black overflow-hidden", children: [
                /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(person.role_image) ?? mystery, alt: displayName, className: "w-full h-full object-cover object-top" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#1b1223] to-transparent" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "px-1 py-2 bg-[#2a1830] text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "truncate text-[10px] leading-tight text-white/80", title: roleLabel, children: roleLabel }),
                /* @__PURE__ */ jsx("div", { className: "mt-0.5 truncate text-[11px] font-semibold leading-tight text-pink-400", title: bottomLabel, children: bottomLabel })
              ] })
            ] }, person.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-white/5 bg-[#1c1132] p-8 text-center relative overflow-hidden flex flex-col justify-between items-center min-h-[360px]", children: [
            /* @__PURE__ */ jsx("style", { children: `
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
              ` }),
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-white px-4 leading-snug", children: [
              "Open the Secret Box to",
              /* @__PURE__ */ jsx("br", {}),
              "reveal your role."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `my-6 relative w-48 h-48 transition-transform ${secretOpened ? "opacity-50 grayscale pointer-events-none" : "hover:scale-105"}`, children: [
              !secretOpened && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" }),
              /* @__PURE__ */ jsx("button", { type: "button", disabled: secretOpened || boxOpening, onClick: revealSecretBox, className: "relative z-10 h-full w-full rounded-[28px] overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: secretBoxImg, alt: "Secret Box", className: `h-full w-full object-contain ${secretOpened ? "opacity-50" : boxOpening ? "animate-boxOpen" : "animate-float"}` }) })
            ] }),
            /* @__PURE__ */ jsx("button", { disabled: secretOpened || boxOpening, onClick: revealSecretBox, className: `w-full rounded-full py-3.5 text-[15px] font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all ${secretOpened ? "bg-white/5 text-white/40 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:opacity-90 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white"}`, children: secretOpened ? "Role Revealed" : "Open Secret Box" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center flex flex-col", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/80", children: [
              "You have ",
              caseMins,
              " minute",
              caseMins === 1 ? "" : "s",
              " to review this case summary (set in admin). Remember the details!"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 grid place-items-center", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-white/70", children: "Time Remaining for Case Summary" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 text-3xl font-black tabular-nums", children: fmt(secsCase) })
            ] }) })
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
    yourRole,
    isInvestigator,
    isCulprit,
    caseSummaryMins,
    maxQuestions,
    lieMaxQuestions,
    questionsLeft,
    invSecs,
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
    scoresBySessionId,
    lieTally
  } = props;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const shortBySessionId = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const p of players) map.set(p.session_id, p.is_you ? `${p.pseudonym} (You)` : p.pseudonym);
    return map;
  }, [players]);
  const initials = (pseudonym) => pseudonym.slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-[#1c1132] backdrop-blur px-6 py-5 flex items-center gap-4 flex-wrap pb-7", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-full bg-purple-500/20 grid place-items-center", children: lieMode ? /* @__PURE__ */ jsx(ScanSearch, { className: "h-5 w-5 text-purple-300" }) : /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-purple-300" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-wide", children: lieMode ? "Lie Detector Mode" : "Investigation" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-6 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => openModal("summary"), className: "inline-flex items-center gap-2 rounded-full bg-[#00B87C] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
            " Case Summary"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 text-[10px] text-[#00B87C] whitespace-nowrap", children: [
            "Available for ",
            caseSummaryMins,
            ":00 minutes only"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-0.5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50", children: "Investigation Time Left" }),
          /* @__PURE__ */ jsx("div", { className: "text-[#facc15] text-xl font-bold tabular-nums leading-none", children: fmt(invSecs) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-0.5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/50", children: "Questions Left" }),
          /* @__PURE__ */ jsxs("div", { className: "text-white text-xl font-bold leading-none", children: [
            questionsLeft,
            "/",
            lieMode ? lieMaxQuestions : maxQuestions
          ] })
        ] }),
        isInvestigator && /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: onToggleLieDetector, className: `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity ${lieMode ? "bg-[#7e57c2] text-white shadow-[0_0_15px_rgba(126,87,194,0.5)]" : "bg-[#7e57c2] text-white hover:opacity-90"}`, children: [
            /* @__PURE__ */ jsx(ScanSearch, { className: "h-4 w-4" }),
            " Lie Detector"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#00B87C] whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-[#00B87C]" }),
            lieMode ? "Active" : "Available"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => openModal("clue"), className: "inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity", children: [
            /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4" }),
            " Clue Room"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#facc15] whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-[#facc15]" }),
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
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold mb-4", children: "Players" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: players.map((p, i) => {
          const frozen = frozenSessionIds.has(p.session_id);
          return /* @__PURE__ */ jsxs("li", { className: `rounded-xl border p-2 flex items-center gap-2 ${frozen ? "border-white/5 bg-white/[0.02] opacity-50" : i === selectedAskee ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-white/5"}`, children: [
            /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-[10px] font-bold`, children: initials(p.pseudonym) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold", children: p.is_you ? `${p.pseudonym} (You)` : p.pseudonym }),
              frozen ? /* @__PURE__ */ jsx("div", { className: "text-[10px] text-rose-400", children: "● Left the game" }) : /* @__PURE__ */ jsx("div", { className: "text-[10px] text-emerald-400", children: "● Available" })
            ] })
          ] }, p.session_id);
        }) }),
        yourRole ? /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/70", children: "Your Role" }),
          /* @__PURE__ */ jsx("div", { className: "text-emerald-300 font-black tracking-widest uppercase", children: roleDisplayName(yourRole) }),
          yourRole.objective ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/70 mt-1", children: yourRole.objective }) : null
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: lieMode ? "Lie Detector Mode Activated" : isInvestigator ? "Ask a Question" : "Investigation In Progress" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/70 mt-1", children: lieMode ? `Investigator can ask maximum ${lieMaxQuestions} questions in Lie Detector mode. Other players will vote on the answers.` : isInvestigator ? "Select a player to ask a question" : "Answer honestly when questioned. Watch the activity feed for questions and answers." })
        ] }) }),
        isInvestigator ? /* @__PURE__ */ jsxs(Fragment, { children: [
          locked && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
            " Waiting for answer — input locked while the timer runs."
          ] }),
          /* @__PURE__ */ jsxs("fieldset", { disabled: locked, "aria-busy": locked, className: locked ? "opacity-60 pointer-events-none select-none" : "", children: [
            /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-5 gap-2", children: players.map((p, i) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelectedAskee(i), disabled: p.is_you || frozenSessionIds.has(p.session_id), className: `relative rounded-xl border p-2 text-center transition disabled:opacity-40 ${i === selectedAskee ? "border-purple-400 ring-2 ring-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: [
              /* @__PURE__ */ jsx("div", { className: `mx-auto h-14 w-14 rounded-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-sm font-bold`, children: initials(p.pseudonym) }),
              /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-[11px] font-semibold", children: p.is_you ? `${p.pseudonym} (You)` : p.pseudonym }),
              i === selectedAskee && /* @__PURE__ */ jsx("div", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-purple-500 ring-2 ring-purple-300" })
            ] }, p.session_id)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-white/70", children: "Type your question (max 120 characters)" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 relative", children: [
                /* @__PURE__ */ jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value.slice(0, 120)), placeholder: "Type your question here...", className: "w-full h-28 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400 disabled:cursor-not-allowed" }),
                /* @__PURE__ */ jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/50", children: [
                  question.length,
                  "/120"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: sendQuestion, disabled: !question.trim() || questionsLeft <= 0 || locked, className: "mt-5 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed", children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 inline mr-2" }),
              " Send Question"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 text-center", children: [
          /* @__PURE__ */ jsx(ScanSearch, { className: "h-8 w-8 mx-auto text-purple-300" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/80", children: "The Investigator is questioning suspects. If a question comes to you, an answer window will open automatically — you have limited time to respond." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "All answers are visible to everyone after the player submits." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold mb-3 text-pink-400", children: lieMode ? "Lie Detector Mode Q/A" : "Recent Activity" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 max-h-[400px] overflow-auto pr-1", children: [
            activity.length === 0 && /* @__PURE__ */ jsx("li", { className: "text-xs text-white/50 text-center py-6", children: "No questions asked yet." }),
            activity.map((a) => {
              const targetShort = shortBySessionId.get(a.toSessionId) ?? "Player";
              return /* @__PURE__ */ jsxs("li", { className: "rounded-xl bg-purple-500/10 border border-purple-400/20 p-4 relative", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-purple-500/40 grid place-items-center text-[11px] shrink-0", children: isInvestigator ? "YA" : "IN" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/70", children: [
                      isInvestigator ? "You asked" : "Investigator asked",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-pink-300 font-semibold", children: targetShort })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-medium mt-0.5", children: a.q })
                  ] })
                ] }),
                a.a && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-start gap-3 border-t border-white/10 pt-3 relative", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-rose-500/40 grid place-items-center text-[11px] shrink-0", children: targetShort.slice(0, 2) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 pr-24", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-pink-300", children: [
                      targetShort,
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "text-white/70", children: a.autoSkipped ? "did not answer" : "Answered" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: `text-sm mt-0.5 ${a.autoSkipped ? "text-white/50 italic" : ""}`, children: a.a })
                  ] }),
                  lieMode && lieTally && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-3 text-right space-y-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-emerald-400", children: [
                      "Believable (",
                      lieTally.believable,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-rose-400", children: [
                      "Suspicious (",
                      lieTally.suspicious,
                      ")"
                    ] })
                  ] })
                ] }),
                !a.a && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 border-t border-white/10 pt-3", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-amber-300" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-amber-300", children: "Waiting for answer..." })
                ] })
              ] }, a.questionId);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold mb-3", children: "Score Board" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2 text-center text-[11px]", children: players.map((p) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-white/70 truncate", children: p.is_you ? "You" : p.pseudonym }),
            /* @__PURE__ */ jsx("div", { className: "text-amber-300 font-bold", children: scoresBySessionId.get(p.session_id) ?? 0 })
          ] }, p.session_id)) })
        ] })
      ] })
    ] })
  ] });
}
function Step({
  time,
  text
}) {
  return /* @__PURE__ */ jsxs("li", { className: "relative flex gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-purple-400 ring-4 ring-purple-500/20" }),
    /* @__PURE__ */ jsx("span", { className: "text-purple-200 font-medium w-20 shrink-0", children: time }),
    /* @__PURE__ */ jsx("span", { className: "text-white/85", children: text })
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
  onSubmit
}) {
  const [secs, setSecs] = useState(answerSecs);
  const [ans, setAns] = useState("");
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1e3);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-lg rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-purple-700/40 grid place-items-center", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-purple-200" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "You have been asked a Question" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/65", children: "By the Investigator" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-purple-500/10 p-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/60", children: "Question" }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-base", children: question })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 text-center", children: [
      /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 mx-auto text-white/60" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-white/65 mt-1", children: "Time Left to answer" }),
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-amber-300 tabular-nums", children: fmt(secs) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-white/70", children: "Type your answer (max 120 characters)" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 relative", children: [
        /* @__PURE__ */ jsx("textarea", { value: ans, onChange: (e) => setAns(e.target.value.slice(0, 120)), placeholder: "Type your answer here...", className: "w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400" }),
        /* @__PURE__ */ jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/50", children: [
          ans.length,
          "/120"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: () => onSubmit(ans), disabled: !ans.trim(), className: "mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40", children: "Submit Answer" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "Your answer will be visible to all players." })
  ] }) }) });
}
function VoteModal({
  answererShort,
  answerText,
  question,
  onVote,
  onClose
}) {
  const [vote, setVote] = useState(null);
  return /* @__PURE__ */ jsx(ModalShell, { onClose, children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-purple-700/40 grid place-items-center", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-purple-200" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Vote on the Answer" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/65", children: "Lie Detector round" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-purple-500/10 p-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/60", children: "Question" }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-base", children: question })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-pink-300 mb-1", children: [
        answererShort,
        " Answer"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/10 bg-black/20 p-3 text-sm", children: answerText })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-pink-300 mb-2", children: "Select Votes" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setVote("believable"), className: `rounded-xl border py-3 text-sm font-semibold ${vote === "believable" ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"}`, children: [
          /* @__PURE__ */ jsx(ThumbsUp, { className: "h-4 w-4 inline mr-2" }),
          " Believable"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setVote("suspicious"), className: `rounded-xl border py-3 text-sm font-semibold ${vote === "suspicious" ? "border-rose-400 bg-rose-500/20 text-rose-300" : "border-rose-500/40 text-rose-300 hover:bg-rose-500/10"}`, children: [
          /* @__PURE__ */ jsx(ThumbsDown, { className: "h-4 w-4 inline mr-2" }),
          " Suspicious"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: () => vote && onVote(vote), disabled: !vote, className: "mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40", children: "Submit Vote" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "Your votes will be visible to all players." })
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
