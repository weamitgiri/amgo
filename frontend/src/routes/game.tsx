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

  // Investigator sees the timed suspect-profile cards; every other role sees
  // their own role-specific strategy cards (per FSD: "Except Investigator, all
  // other roles can see the strategy guide").
  const guideSlides = useMemo(
    () => ({
      strategy: isInvestigator ? gameData?.strategy_slides ?? [] : gameData?.role_strategy_slides ?? [],
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
  const [questionsLeft, setQuestionsLeft] = useState(5);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pendingAnswerForMe, setPendingAnswerForMe] = useState<ActivityItem | null>(null);
  const [answerTimeoutPenalty, setAnswerTimeoutPenalty] = useState(0);
  const [voteContext, setVoteContext] = useState<{ questionId: number; answerText: string; answererSessionId: number } | null>(null);
  const [lieTally, setLieTally] = useState<LieDetectorTally | null>(null);
  const [invElapsed, setInvElapsed] = useState(0);
  const autoCardRef = useRef<number | null>(null);

  const applyGameState = useCallback((state: GameStateResponse) => {
    setGameState(state);
    setMyAccusationSubmitted(Boolean(state.group.my_accusation_submitted));

    const online = new Set<number>();
    const frozen = new Set<number>();
    const scores = new Map<number, number>();
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

    setActivity(
      state.group.questions.map((q) => {
        const ans = q.answers?.[0];
        return {
          questionId: q.id,
          toSessionId: q.asked_to,
          q: q.question_text,
          a: ans?.answer_text,
          autoSkipped: ans?.auto_skipped,
          tally: activeRound?.tally,
        };
      })
    );
  }, []);

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
        setQuestionsLeft(Math.max(0, data.settings.max_questions - state.group.questions.length));

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

    const onNewQuestion = (q: { id: number; asked_to: number; question_text: string; asked_by?: number }) => {
      const item: ActivityItem = { questionId: q.id, toSessionId: q.asked_to, q: q.question_text, fromSessionId: q.asked_by };
      setActivity((prev) => [item, ...prev]);
      setQuestionsLeft((n) => Math.max(0, n - 1));
      if (myPlayer?.session_id === q.asked_to) {
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
    const onLieDetectorStarted = (round: { id: number }) => setLieDetectorRoundId(round.id);
    const onLieDetectorEnded = () => setLieDetectorRoundId(null);
    const onPhaseChanged = (payload: { new_phase: string }) => {
      if (payload.new_phase === "questioning") {
        setLieDetectorRoundId(null);
      }
    };
    const onCluesUnlocked = () => setCluesUnlocked(true);
    const onAccusationSubmitted = (payload: { participant_session_id: number }) => {
      if (myPlayer?.session_id === payload.participant_session_id) setMyAccusationSubmitted(true);
    };
    const onParticipantLeft = (payload: { participant_session_id: number }) => {
      setFrozenSessionIds((prev) => new Set(prev).add(payload.participant_session_id));
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

  // Non-investigator roles get their strategy guide force-opened once after the
  // configured delay (FSD: "after 2 minutes passed, forcefully open the modal").
  useEffect(() => {
    if (loading || !gameData || isInvestigator) return;
    const delayMs = (gameData.settings.strategy_guide_delay_secs || 120) * 1000;
    const timer = window.setTimeout(() => {
      setGuideModal("strategy");
      setGuideSlide(0);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [loading, gameData, isInvestigator]);

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

  const sendQuestion = async () => {
    const target = players[selectedAskee];
    if (!question.trim() || questionsLeft <= 0 || !target || target.is_you || !session?.participantId) return;
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
          yourRole={yourPerson}
          isInvestigator={isInvestigator}
          isCulprit={isCulprit}
          caseSummaryMins={Math.round(gameData.settings.case_summary_view_secs / 60)}
          maxQuestions={gameData.settings.max_questions}
          lieMaxQuestions={gameData.settings.lie_detector_max_questions}
          questionsLeft={questionsLeft}
          invSecs={secsHdr}
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
          question={pendingAnswerForMe.q}
          answerSecs={gameData.settings.question_response_secs}
          onSubmit={submitAnswer}
          investigatorRole={isInvestigator ? "Investigator" : "Investigator"}
          onTimeout={() => {
            setPendingAnswerForMe(null);
            setAnswerTimeoutPenalty(-10);
          }}
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
    secretOpened,
    onRevealRole,
    setSecretOpened,
    setRoleViewed,
    setOpenPhotos,
    onBegin,
    onOpenInfoModal,
  } = props;
  const [boxOpening, setBoxOpening] = useState(false);
  const caseMins = Math.round(gameData.settings.case_summary_view_secs / 60);
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
          <button onClick={() => onOpenInfoModal("strategy")} className="inline-flex items-center gap-2 rounded-full bg-gradient-blue px-5 py-2.5 text-sm font-semibold shadow-glow">
            <Lightbulb className="h-4 w-4" /> Strategy Guide
          </button>
          <button onClick={() => onOpenInfoModal("rules")} className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold shadow-glow">
            <Gamepad2 className="h-4 w-4" /> View Game Rules
          </button>
        </div>
      </div>

      <main className="mt-5 grid gap-5 lg:grid-cols-[2fr_1.4fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-7 relative overflow-hidden">
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
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-7">
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
                        className="w-full h-full object-cover object-top"
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
            <div className="rounded-[2rem] border border-white/5 bg-[#1c1132] p-8 text-center relative overflow-hidden flex flex-col justify-between items-center min-h-[360px]">
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
              <h3 className="text-lg font-medium text-white px-4 leading-snug">
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
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center flex flex-col">
              <p className="text-xs text-white/80">
                You have {caseMins} minute{caseMins === 1 ? "" : "s"} to review this case summary (set in admin). Remember the details!
              </p>
              <div className="mt-4 flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 grid place-items-center">
                <div>
                  <div className="text-xs text-white/70">Time Remaining for Case Summary</div>
                  <div className="mt-2 text-3xl font-black tabular-nums">{fmt(secsCase)}</div>
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
  yourRole: GamePerson | null;
  isInvestigator: boolean;
  isCulprit: boolean;
  caseSummaryMins: number;
  maxQuestions: number;
  lieMaxQuestions: number;
  questionsLeft: number;
  invSecs: number;
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
    lieTally,
  } = props;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const shortBySessionId = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of players) map.set(p.session_id, p.is_you ? `${p.pseudonym} (You)` : p.pseudonym);
    return map;
  }, [players]);
  const initials = (pseudonym: string) => pseudonym.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Investigation toolbar */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-[#1c1132] backdrop-blur px-6 py-5 flex items-center gap-4 flex-wrap pb-7">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-purple-500/20 grid place-items-center">
            {lieMode ? <ScanSearch className="h-5 w-5 text-purple-300" /> : <FileText className="h-5 w-5 text-purple-300" />}
          </div>
          <h1 className="text-xl font-bold tracking-wide">{lieMode ? "Lie Detector Mode" : "Investigation"}</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-6 flex-wrap">
          <div className="relative flex flex-col items-center justify-center">
            <button onClick={() => openModal("summary")} className="inline-flex items-center gap-2 rounded-full bg-[#00B87C] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity">
              <FileText className="h-4 w-4" /> Case Summary
            </button>
            <div className="absolute -bottom-5 text-[10px] text-[#00B87C] whitespace-nowrap">Available for {caseSummaryMins}:00 minutes only</div>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="text-[10px] text-white/50">Investigation Time Left</div>
            <div className="text-[#facc15] text-xl font-bold tabular-nums leading-none">{fmt(invSecs)}</div>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="text-[10px] text-white/50">Questions Left</div>
            <div className="text-white text-xl font-bold leading-none">{questionsLeft}/{lieMode ? lieMaxQuestions : maxQuestions}</div>
          </div>

          {isInvestigator && (
            <div className="relative flex flex-col items-center justify-center">
              <button onClick={onToggleLieDetector} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity ${lieMode ? "bg-[#7e57c2] text-white shadow-[0_0_15px_rgba(126,87,194,0.5)]" : "bg-[#7e57c2] text-white hover:opacity-90"}`}>
                <ScanSearch className="h-4 w-4" /> Lie Detector
              </button>
              <div className="absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#00B87C] whitespace-nowrap">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00B87C]" />
                {lieMode ? "Active" : "Available"}
              </div>
            </div>
          )}

          <div className="relative flex flex-col items-center justify-center">
            <button onClick={() => openModal("clue")} className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity">
              <Lightbulb className="h-4 w-4" /> Clue Room
            </button>
            <div className="absolute -bottom-5 flex items-center gap-1.5 text-[10px] text-[#facc15] whitespace-nowrap">
              <div className="h-1.5 w-1.5 rounded-full bg-[#facc15]" />
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
        {/* Players */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-bold mb-4">Players</h3>
          <div className="grid grid-cols-3 gap-2">
            {players.map((p, i) => {
              const frozen = frozenSessionIds.has(p.session_id);
              const roleImage = p.is_you && yourRole?.role_image ? resolveMediaUrl(yourRole.role_image) : null;
              return (
                <div key={p.session_id} className={`flex flex-col items-center opacity-transition ${frozen ? "opacity-40" : ""}`}>
                  <div className="h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/20 mb-2">
                    {roleImage ? (
                      <img src={roleImage} alt="role" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-sm font-bold text-white`}>
                        {initials(p.pseudonym)}
                      </div>
                    )}
                  </div>
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-[10px] font-semibold truncate max-w-full">{p.pseudonym}</div>
                    {p.is_you && <div className="text-[8px] text-purple-300 font-bold">You</div>}
                    {frozen ? (
                      <div className="text-[8px] text-rose-400">Left</div>
                    ) : (
                      <div className="text-[8px] text-emerald-400">●</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {yourRole ? (
            <div className="mt-5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3">
              <div className="text-[10px] text-white/70">Your Role</div>
              <div className="text-emerald-300 font-black tracking-widest uppercase">{roleDisplayName(yourRole)}</div>
              {yourRole.objective ? (
                <p className="text-[10px] text-white/70 mt-1">{yourRole.objective}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Ask question (Investigator) / observer panel (everyone else) */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{lieMode ? "Lie Detector Mode Activated" : isInvestigator ? "Ask a Question" : "Investigation In Progress"}</h3>
              <p className="text-xs text-white/70 mt-1">
                {lieMode
                  ? `Investigator can ask maximum ${lieMaxQuestions} questions in Lie Detector mode. Other players will vote on the answers.`
                  : isInvestigator
                    ? "Select a player to ask a question"
                    : "Answer honestly when questioned. Watch the activity feed for questions and answers."}
              </p>
            </div>
          </div>
          {isInvestigator ? (
            <>
              {locked && (
                <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Waiting for answer — input locked while the timer runs.
                </div>
              )}
              <fieldset disabled={locked} aria-busy={locked} className={locked ? "opacity-60 pointer-events-none select-none" : ""}>
                <div className="mt-4">
                  <label className="text-xs text-white/70 block mb-3">🎯 {lieMode ? "Select Suspect for Interrogation" : "Select a Player"}</label>
                  <div className="grid grid-cols-5 gap-3">
                    {players.map((p, i) => {
                      const roleImage = p.is_you && yourRole?.role_image ? resolveMediaUrl(yourRole.role_image) : null;
                      return (
                        <button type="button" key={p.session_id} onClick={() => setSelectedAskee(i)} disabled={p.is_you || frozenSessionIds.has(p.session_id)} className={`relative rounded-2xl border-2 overflow-hidden p-0 text-center transition group disabled:opacity-40 disabled:cursor-not-allowed ${i === selectedAskee ? "border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "border-white/10 hover:border-purple-300/30"}`}>
                          <div className="relative">
                            {roleImage ? (
                              <img src={roleImage} alt="role" className="h-24 w-24 mx-auto object-cover" />
                            ) : (
                              <div className={`h-24 w-24 bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-base font-bold text-white`}>
                                {initials(p.pseudonym)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          </div>
                          <div className="px-2 py-2.5 text-[10px] font-semibold relative z-10 bg-black/50 text-center border-t border-white/10">{p.pseudonym}</div>
                          {i === selectedAskee && <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-purple-500 ring-3 ring-purple-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
                <div className="mt-6">
                  <label className="text-xs text-white/70">💬 {lieMode ? "Interrogation Question" : "Your Question"} (max 120 characters)</label>
                  <div className="mt-1 relative">
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 120))}
                      placeholder="🎤 Type your interrogation question here..."
                      className="w-full h-28 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400 disabled:cursor-not-allowed" />
                    <span className="absolute bottom-2 right-3 text-[10px] text-white/50">{question.length}/120</span>
                  </div>
                </div>
                <button type="button" onClick={sendQuestion} disabled={!question.trim() || questionsLeft <= 0 || locked}
                  className="mt-5 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed">
                  Send Interrogation
                </button>
              </fieldset>
            </>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 text-center mb-6">
                <ScanSearch className="h-8 w-8 mx-auto text-purple-300" />
                <p className="mt-3 text-sm text-white/80">
                  The Investigator is questioning suspects. If a question comes to you, an answer window
                  will open automatically — you have limited time to respond.
                </p>
              </div>
              <div>
                <label className="text-xs text-white/70 block mb-3">All Players</label>
                <div className="grid grid-cols-5 gap-3">
                  {players.map((p, i) => {
                    const frozen = frozenSessionIds.has(p.session_id);
                    const roleImage = p.is_you && yourRole?.role_image ? resolveMediaUrl(yourRole.role_image) : null;
                    return (
                      <div key={p.session_id} className={`relative rounded-2xl border-2 border-white/10 overflow-hidden ${frozen ? "opacity-40" : ""}`}>
                        <div className="relative">
                          {roleImage ? (
                            <img src={roleImage} alt="role" className="h-24 w-24 mx-auto object-cover" />
                          ) : (
                            <div className={`h-24 w-24 bg-gradient-to-br ${PLAYER_GRADS[i % PLAYER_GRADS.length]} grid place-items-center text-base font-bold text-white`}>
                              {initials(p.pseudonym)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        </div>
                        <div className="px-2 py-2.5 text-[10px] font-semibold relative z-10 bg-black/50 text-center border-t border-white/10">
                          <div>{p.pseudonym}</div>
                          {p.is_you && <div className="text-[8px] text-purple-300">(You)</div>}
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

        {/* Activity + Score */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-bold mb-3 text-pink-400">{lieMode ? "Lie Detector Mode Q/A" : "Recent Activity"}</h3>
            <ul className="space-y-3 max-h-[400px] overflow-auto pr-1">
              {activity.length === 0 && (
                <li className="text-xs text-white/50 text-center py-6">No questions asked yet.</li>
              )}
              {activity.map((a) => {
                const targetShort = shortBySessionId.get(a.toSessionId) ?? "Player";
                return (
                  <li key={a.questionId} className="rounded-xl bg-purple-500/10 border border-purple-400/20 p-4 relative">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-500/40 grid place-items-center text-[11px] shrink-0">
                        {isInvestigator ? "YA" : "IN"}
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-white/70">
                          {isInvestigator ? "You asked" : "Investigator asked"}{" "}
                          <span className="text-pink-300 font-semibold">{targetShort}</span>
                        </div>
                        <div className="text-sm font-medium mt-0.5">{a.q}</div>
                      </div>
                    </div>
                    {a.a && (
                      <div className="mt-3 flex items-start gap-3 border-t border-white/10 pt-3 relative">
                        <div className="h-8 w-8 rounded-full bg-rose-500/40 grid place-items-center text-[11px] shrink-0">{targetShort.slice(0, 2)}</div>
                        <div className="flex-1 pr-24">
                          <div className="text-[11px] text-pink-300">
                            {targetShort}{" "}
                            <span className="text-white/70">{a.autoSkipped ? "did not answer" : "Answered"}</span>
                          </div>
                          <div className={`text-sm mt-0.5 ${a.autoSkipped ? "text-white/50 italic" : ""}`}>{a.a}</div>
                        </div>
                        {lieMode && lieTally && (
                          <div className="absolute right-0 top-3 text-right space-y-2">
                            <div className="text-sm text-emerald-400">Believable ({lieTally.believable})</div>
                            <div className="text-sm text-rose-400">Suspicious ({lieTally.suspicious})</div>
                          </div>
                        )}
                      </div>
                    )}
                    {!a.a && (
                      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                        <Clock className="h-4 w-4 text-amber-300" />
                        <span className="text-xs text-amber-300">Waiting for answer...</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-bold mb-3">Score Board</h3>
            <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
              {players.map((p) => (
                <div key={p.session_id}>
                  <div className="text-white/70 truncate">{p.is_you ? "You" : p.pseudonym}</div>
                  <div className="text-amber-300 font-bold">{scoresBySessionId.get(p.session_id) ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
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
}: {
  question: string;
  answerSecs: number;
  onSubmit: (text: string) => void;
  investigatorRole?: string;
  onTimeout?: () => void;
}) {
  const [secs, setSecs] = useState(answerSecs);
  const [ans, setAns] = useState("");
  const isTimeUp = secs === 0;

  useEffect(() => {
    const t = setInterval(() => {
      setSecs((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0 && s > 0 && onTimeout) {
          onTimeout();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onTimeout]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const canClose = false; // Modal cannot be closed during countdown

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated">
        {/* Close button disabled during countdown */}
        {false && (
          <button className="absolute top-4 right-4 z-10 h-9 w-9 grid place-items-center rounded-xl bg-purple-700/40 opacity-20 cursor-not-allowed">
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-700/40 grid place-items-center"><ShieldCheck className="h-5 w-5 text-purple-200" /></div>
            <div>
              <h3 className="text-lg font-bold">You have been asked a Question</h3>
              <p className="text-xs text-white/65">By SC ({investigatorRole}) in Lie Detector Mode</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-purple-500/10 p-4 text-center">
            <div className="text-[11px] text-white/60">Question</div>
            <div className="mt-1 text-base">{question}</div>
          </div>
          <div className={`mt-5 text-center ${
            isTimeUp ? "rounded-2xl bg-rose-500/20 border border-rose-400/40 p-4" : ""
          }`}>
            <Clock className={`h-5 w-5 mx-auto ${
              isTimeUp ? "text-rose-400" : "text-white/60"
            }`} />
            <div className={`text-xs mt-1 ${
              isTimeUp ? "text-rose-300 font-bold" : "text-white/65"
            }`}>Time Left to answer</div>
            <div className={`text-2xl font-black tabular-nums ${
              isTimeUp ? "text-rose-400" : "text-amber-300"
            }`}>{fmt(secs)}</div>
            {isTimeUp && (
              <p className="text-xs text-rose-300 font-semibold mt-2">⚠️ Time's up! -10 points penalty applied.</p>
            )}
          </div>
          <div className="mt-5">
            <label className="text-xs text-white/70">Type your answer (max 120 characters)</label>
            <div className="mt-1 relative">
              <textarea
                value={ans}
                onChange={(e) => setAns(e.target.value.slice(0, 120))}
                placeholder="Type your answer here..."
                disabled={isTimeUp}
                className={`w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400 ${
                  isTimeUp ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-white/50">{ans.length}/120</span>
            </div>
          </div>
          <button
            onClick={() => onSubmit(ans)}
            disabled={!ans.trim() || isTimeUp}
            className={`mt-4 w-full rounded-full py-3 text-sm font-semibold shadow-glow ${
              isTimeUp
                ? "bg-white/5 text-white/40 cursor-not-allowed"
                : "bg-gradient-primary disabled:opacity-40"
            }`}
          >
            {isTimeUp ? "Time Expired" : "Submit Answer To Start Voting"}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/60">Your answer will be visible to all players.</p>
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
          <div className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider">📊 Cast Your Vote</div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setVote("believable")}
              className={`relative rounded-2xl border-2 py-5 px-4 text-center font-semibold transition-all transform ${
                vote === "believable"
                  ? "border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-105"
                  : "border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/15"
              }`}
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm font-bold">Believable</div>
            </button>
            <button
              onClick={() => setVote("suspicious")}
              className={`relative rounded-2xl border-2 py-5 px-4 text-center font-semibold transition-all transform ${
                vote === "suspicious"
                  ? "border-rose-400 bg-rose-500/25 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105"
                  : "border-rose-500/40 text-rose-300 hover:border-rose-400 hover:bg-rose-500/15"
              }`}
            >
              <div className="text-3xl mb-2">❌</div>
              <div className="text-sm font-bold">Suspicious</div>
            </button>
          </div>
        </div>

        <button
          onClick={() => vote && onVote(vote)}
          disabled={!vote}
          className="mt-8 w-full rounded-full bg-gradient-primary py-4 text-base font-bold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg"
        >
          Submit Vote
        </button>
        <p className="mt-3 text-center text-xs text-white/50">Your vote will be visible to all players after submission.</p>
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
