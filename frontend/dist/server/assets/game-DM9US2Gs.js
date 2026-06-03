import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { y as useNavigate, b as Route, L as Link } from "./router-DZhViOq_.js";
import { c as createLucideIcon, L as Logo } from "./Logo-COJrqD4D.js";
import { g as getParticipantSession, p as participantService } from "./participant-session-CU2R-89K.js";
import { r as resolveMediaUrl } from "./media-CzD2a1Kg.js";
import { t as toastError } from "./toast-s3ZTemWF.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { F as FileText } from "./file-text-DmEUAd4D.js";
import { G as Gamepad2 } from "./gamepad-2-BwR2ExTt.js";
import { C as Calendar } from "./calendar-DJ_Zwcf1.js";
import { C as Clock } from "./clock-L0m5LHMS.js";
import { S as ShieldCheck } from "./shield-check-B60WUByZ.js";
import { X } from "./x-BXjaTuKN.js";
import { C as CircleAlert } from "./circle-alert-y5oGeqUj.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./config-CafHMDrA.js";
const __iconNode$b = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$b);
const __iconNode$a = [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
];
const Cloud = createLucideIcon("cloud", __iconNode$a);
const __iconNode$9 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode$9);
const __iconNode$8 = [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      key: "1gvzjb"
    }
  ],
  ["path", { d: "M9 18h6", key: "x1upvd" }],
  ["path", { d: "M10 22h4", key: "ceow96" }]
];
const Lightbulb = createLucideIcon("lightbulb", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ["path", { d: "m16 16-1.9-1.9", key: "1dq9hf" }]
];
const ScanSearch = createLucideIcon("scan-search", __iconNode$6);
const __iconNode$5 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$5);
const __iconNode$4 = [
  [
    "path",
    {
      d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
      key: "m61m77"
    }
  ],
  ["path", { d: "M17 14V2", key: "8ymqnk" }]
];
const ThumbsDown = createLucideIcon("thumbs-down", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ],
  ["path", { d: "M7 10v12", key: "1qc93n" }]
];
const ThumbsUp = createLucideIcon("thumbs-up", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }],
  ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]
];
const UserX = createLucideIcon("user-x", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
];
const Video = createLucideIcon("video", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
];
const ZoomIn = createLucideIcon("zoom-in", __iconNode);
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
function GamePage() {
  const navigate = useNavigate();
  const {
    game: gameSlug
  } = Route.useSearch();
  const session = reactExports.useMemo(() => getParticipantSession(), []);
  const [loading, setLoading] = reactExports.useState(true);
  const [gameData, setGameData] = reactExports.useState(null);
  const [phase, setPhase] = reactExports.useState("summary");
  const [secsHdr, setSecsHdr] = reactExports.useState(0);
  const [secsCase, setSecsCase] = reactExports.useState(0);
  const [roleModalOpen, setRoleModalOpen] = reactExports.useState(false);
  const [secretOpened, setSecretOpened] = reactExports.useState(false);
  const [openPhotos, setOpenPhotos] = reactExports.useState(false);
  const [guideModal, setGuideModal] = reactExports.useState(null);
  const [guideSlide, setGuideSlide] = reactExports.useState(0);
  const people = reactExports.useMemo(() => (gameData?.roles ?? []).map(mapRoleToPerson), [gameData]);
  const yourPerson = reactExports.useMemo(() => people.find((p) => p.is_you) ?? null, [people]);
  const guideSlides = reactExports.useMemo(() => ({
    strategy: gameData?.strategy_slides ?? [],
    rules: gameData?.rules ?? []
  }), [gameData]);
  const photoUrls = reactExports.useMemo(() => (gameData?.photos ?? []).map((p) => resolveMediaUrl(p.image) ?? mystery), [gameData]);
  const [lieMode, setLieMode] = reactExports.useState(false);
  const [selectedAskee, setSelectedAskee] = reactExports.useState(0);
  const [question, setQuestion] = reactExports.useState("");
  const [modal, setModal] = reactExports.useState(null);
  const [questionsLeft, setQuestionsLeft] = reactExports.useState(5);
  const [activity, setActivity] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!session?.groupId) {
      setLoading(false);
      return;
    }
    participantService.getGameSummary(session.groupId, session.participantId).then((data) => {
      setGameData(data);
      setSecsHdr(data.settings.game_duration_secs);
      setSecsCase(data.settings.case_summary_view_secs);
      setQuestionsLeft(data.settings.max_questions);
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
  }, [session?.groupId, session?.participantId, navigate, gameSlug, session?.inviteUrl, session?.gameSlug]);
  reactExports.useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setSecsHdr((s) => Math.max(0, s - 1));
      if (phase === "summary") {
        setSecsCase((s) => Math.max(0, s - 1));
      }
    }, 1e3);
    return () => clearInterval(t);
  }, [loading, phase]);
  reactExports.useEffect(() => {
    if (phase === "summary" && secsCase === 0 && gameData) {
      setPhase("investigation");
    }
  }, [secsCase, phase, gameData]);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  if (!session?.groupId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[#0d0820] text-white grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "No active game session" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-block text-primary text-sm", children: "Go home" })
    ] }) });
  }
  if (loading || !gameData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[#0d0820] text-white grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 animate-pulse", children: "Loading case summary…" }) });
  }
  const sendQuestion = () => {
    if (!question.trim() || questionsLeft <= 0 || !people[selectedAskee]) return;
    setActivity((a) => [{
      to: people[selectedAskee].short,
      q: question.trim()
    }, ...a]);
    setQuestionsLeft((q) => q - 1);
    setModal("answer");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#0d0820] text-white p-4 md:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: gameData.activity.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm", children: [
          "Game Time Remaining ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 font-bold tabular-nums", children: fmt(secsHdr) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold", children: (gameData.participant.name[0] ?? "P").toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: gameData.participant.name })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4" }),
    phase === "summary" ? /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryView, { gameData, people, photoUrls, fmt, secsCase, secretOpened, onRevealRole: () => setRoleModalOpen(true), setSecretOpened, setOpenPhotos, onBegin: () => setPhase("investigation"), onOpenInfoModal: (type) => {
      setGuideModal(type);
      setGuideSlide(0);
    } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(InvestigationView, { people, yourRole: yourPerson, maxQuestions: gameData.settings.max_questions, lieMaxQuestions: gameData.settings.lie_detector_max_questions, questionResponseSecs: gameData.settings.question_response_secs, questionsLeft: lieMode ? Math.min(gameData.settings.lie_detector_max_questions, questionsLeft) : questionsLeft, selectedAskee, setSelectedAskee, question, setQuestion, sendQuestion, activity, openModal: setModal, locked: modal === "answer", lieMode, setLieMode }),
    roleModalOpen && yourPerson && /* @__PURE__ */ jsxRuntimeExports.jsx(YourRoleModal, { person: yourPerson, onClose: () => setRoleModalOpen(false) }),
    openPhotos && /* @__PURE__ */ jsxRuntimeExports.jsx(PhotosModal, { photos: photoUrls, onClose: () => setOpenPhotos(false) }),
    guideModal !== null && guideSlides[guideModal].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoSliderModal, { type: guideModal, slideIndex: guideSlide, slides: guideSlides[guideModal], onClose: () => setGuideModal(null), onPrev: () => setGuideSlide((i) => Math.max(0, i - 1)), onNext: () => setGuideSlide((i) => Math.min(guideSlides[guideModal].length - 1, i + 1)), onSelectSlide: (index) => setGuideSlide(index) }),
    modal === "answer" && people[selectedAskee] && /* @__PURE__ */ jsxRuntimeExports.jsx(AnswerModal, { target: people[selectedAskee], question, answerSecs: gameData.settings.question_response_secs, onClose: () => {
      setModal("vote");
    } }),
    modal === "vote" && people[selectedAskee] && /* @__PURE__ */ jsxRuntimeExports.jsx(VoteModal, { target: people[selectedAskee], question, onClose: () => {
      setQuestion("");
      setModal(null);
    } }),
    modal === "clue" && /* @__PURE__ */ jsxRuntimeExports.jsx(ClueRoomModal, { onClose: () => setModal(null) }),
    modal === "accuse" && /* @__PURE__ */ jsxRuntimeExports.jsx(AccuseModal, { people, onClose: () => setModal(null) }),
    modal === "summary" && /* @__PURE__ */ jsxRuntimeExports.jsx(CaseSummaryModal, { onClose: () => setModal(null) })
  ] });
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
    setOpenPhotos,
    onBegin,
    onOpenInfoModal
  } = props;
  const [boxOpening, setBoxOpening] = reactExports.useState(false);
  const caseMins = Math.round(gameData.settings.case_summary_view_secs / 60);
  const revealSecretBox = () => {
    if (secretOpened || boxOpening) return;
    setBoxOpening(true);
    setTimeout(() => {
      setBoxOpening(false);
      setSecretOpened(true);
      onRevealRole();
    }, 700);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-purple-200" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-wide", children: "CASE SUMMARY" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onOpenInfoModal("strategy"), className: "inline-flex items-center gap-2 rounded-full bg-gradient-blue px-5 py-2.5 text-sm font-semibold shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
          " Strategy Guide"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onOpenInfoModal("rules"), className: "inline-flex items-center gap-2 rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "h-4 w-4" }),
          " View Game Rules"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mt-5 grid gap-5 lg:grid-cols-[2fr_1.4fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-7 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-purple-200", children: gameData.game.title }),
        gameData.game.tagline ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70", children: gameData.game.tagline }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm leading-relaxed", children: [
            gameData.game.case_summary_html ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-invert prose-sm max-w-none [&_p]:mb-3", dangerouslySetInnerHTML: {
              __html: gameData.game.case_summary_html
            } }) : null,
            gameData.game.timeline.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold uppercase tracking-wider text-white/90", children: "On the night of the murder" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-3 border-l-2 border-purple-500/40 pl-4", children: gameData.game.timeline.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { time: step.time, text: step.event }, `${step.time}-${step.event}`)) })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block bg-amber-100/95 text-zinc-900 text-xs px-3 py-1.5 rounded-sm rotate-[-1deg]", children: [
              "Now, ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-700 font-bold", children: "everyone" }),
              " present in the house is a",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-700 font-bold", children: "suspect." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-[320px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-4 rotate-[-6deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photoUrls[0] ?? mystery, alt: "", className: "h-32 w-44 object-cover" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-12 right-2 rotate-[5deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photoUrls[1] ?? mystery, alt: "", className: "h-28 w-40 object-cover" }) }),
            gameData.game.quick_facts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-2 right-6 rotate-[-2deg] rounded-md bg-amber-100/95 text-zinc-900 p-4 shadow-elevated", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold tracking-wider", children: "QUICK FACTS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1 text-[12px]", children: gameData.game.quick_facts.map((fact) => {
                const Icon = FACT_ICONS[fact.icon] ?? MapPin;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 shrink-0" }),
                  fact.label,
                  ": ",
                  fact.value
                ] }, `${fact.label}-${fact.value}`);
              }) })
            ] }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenPhotos(true), className: "inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold shadow-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
            " View Investigation Photos"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBegin, className: "inline-flex items-center gap-2 rounded-full bg-gradient-warm px-6 py-3 text-sm font-semibold shadow-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanSearch, { className: "h-4 w-4" }),
            " Begin Investigation"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-center text-lg font-bold", children: "Key People in the Bungalow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-5 grid gap-2.5 ${people.length <= 5 ? "grid-cols-5" : "grid-cols-3 sm:grid-cols-5"}`, children: people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border p-2 text-center ${secretOpened && p.is_you ? "border-emerald-400/60 ring-2 ring-emerald-400/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `aspect-[3/4] rounded-xl bg-gradient-to-br ${p.grad} ring-1 ring-white/10 grid place-items-center overflow-hidden`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-7 w-7 text-white/70" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[11px] text-pink-400 leading-tight line-clamp-2", children: p.name })
          ] }, p.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[2rem] border border-white/5 bg-[#1c1132] p-8 text-center relative overflow-hidden flex flex-col justify-between items-center min-h-[360px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-medium text-white px-4 leading-snug", children: [
              "Open the Secret Box to",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "reveal your role."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `my-6 relative w-48 h-48 transition-transform ${secretOpened ? "opacity-50 grayscale pointer-events-none" : "hover:scale-105"}`, children: [
              !secretOpened && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: secretOpened || boxOpening, onClick: revealSecretBox, className: "relative z-10 h-full w-full rounded-[28px] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: secretBoxImg, alt: "Secret Box", className: `h-full w-full object-contain ${secretOpened ? "opacity-50" : boxOpening ? "animate-boxOpen" : "animate-float"}` }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: secretOpened || boxOpening, onClick: revealSecretBox, className: `w-full rounded-full py-3.5 text-[15px] font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all ${secretOpened ? "bg-white/5 text-white/40 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:opacity-90 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white"}`, children: secretOpened ? "Role Revealed" : "Open Secret Box" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/80", children: [
              "You have ",
              caseMins,
              " minute",
              caseMins === 1 ? "" : "s",
              " to review this case summary (set in admin). Remember the details!"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/70", children: "Time Remaining for Case Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-black tabular-nums", children: fmt(secsCase) })
            ] }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function InvestigationView(props) {
  const {
    people,
    yourRole,
    maxQuestions,
    lieMaxQuestions,
    questionsLeft,
    selectedAskee,
    setSelectedAskee,
    question,
    setQuestion,
    sendQuestion,
    activity,
    openModal,
    locked = false,
    lieMode,
    setLieMode
  } = props;
  const [invSecs, setInvSecs] = reactExports.useState(18 * 60 + 42);
  reactExports.useEffect(() => {
    const t = setInterval(() => setInvSecs((s) => Math.max(0, s - 1)), 1e3);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur p-4 flex items-center gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center", children: lieMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScanSearch, { className: "h-5 w-5 text-purple-200" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-purple-200" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold tracking-wide", children: lieMode ? "Lie Detector Mode" : "Investigation" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => openModal("summary"), className: "inline-flex items-center gap-2 rounded-full bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            " Case Summary"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-emerald-300 mt-1", children: "Available for 5:00 minutes only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/70", children: lieMode ? "Lie Detector Mode Time Left" : "Investigation Time Left" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-300 font-bold tabular-nums", children: fmt(invSecs) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/70", children: "Questions Left" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white text-lg font-bold", children: [
            questionsLeft,
            "/",
            lieMode ? lieMaxQuestions : maxQuestions
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLieMode(!lieMode), className: `inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${lieMode ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-glow" : "bg-gradient-blue text-white"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanSearch, { className: "h-4 w-4" }),
            " Lie Detector"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-emerald-300 mt-1", children: [
            "● ",
            lieMode ? "Active" : "Available"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => openModal("clue"), className: "inline-flex items-center gap-2 rounded-full bg-gradient-warm px-4 py-2 text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
            " Clue Room"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-amber-300 mt-1", children: "● New Clue" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => openModal("accuse"), className: "inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "h-4 w-4" }),
          " Final Accusation"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-[260px_1fr_320px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-4", children: "Players" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: people.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `rounded-xl border p-2 flex items-center gap-2 ${i === selectedAskee ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-white/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-full bg-gradient-to-br ${p.grad} grid place-items-center text-[10px] font-bold`, children: p.short.slice(0, 2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: p.short }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-emerald-400", children: "● Available" })
          ] }),
          i === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-300 tabular-nums", children: "01:15" })
        ] }, p.id)) }),
        yourRole ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/70", children: "Your Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-emerald-300 font-black tracking-widest uppercase", children: roleDisplayName(yourRole) }),
          yourRole.objective ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/70 mt-1", children: yourRole.objective }) : null
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: lieMode ? "Lie Detector Mode Activated" : "Ask a Question" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/70 mt-1", children: lieMode ? "Investigator can ask maximum 3 questions to any player in Lie Detector mode. Other players will vote on the answers." : "Select a player to ask a question" })
          ] }),
          lieMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-white/80", children: [
            Math.max(1, 4 - questionsLeft),
            "/3 Question"
          ] })
        ] }),
        locked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          " Waiting for answer — input locked while the timer runs."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { disabled: locked, "aria-busy": locked, className: locked ? "opacity-60 pointer-events-none select-none" : "", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-5 gap-2", children: people.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedAskee(i), className: `relative rounded-xl border p-2 text-center transition ${i === selectedAskee ? "border-purple-400 ring-2 ring-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto h-14 w-14 rounded-full bg-gradient-to-br ${p.grad} grid place-items-center`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5 text-white/80" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[11px] font-semibold", children: p.short }),
            i === selectedAskee && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-purple-500 ring-2 ring-purple-300" })
          ] }, p.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-white/70", children: "Type your question (max 120 characters)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value.slice(0, 120)), placeholder: "Type your question here...", className: "w-full h-28 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400 disabled:cursor-not-allowed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/50", children: [
                question.length,
                "/120"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: sendQuestion, disabled: !question.trim() || questionsLeft <= 0 || locked, className: "mt-5 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 inline mr-2" }),
            " Send Question"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "All answers are visible to everyone after the player submits." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-3 text-pink-400", children: lieMode ? "Lie Detector Mode Q/A" : "Recent Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3 max-h-[400px] overflow-auto pr-1", children: activity.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-xl bg-purple-500/10 border border-purple-400/20 p-4 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-purple-500/40 grid place-items-center text-[11px] shrink-0", children: "YA" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-white/70", children: [
                  "You asked ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-pink-300 font-semibold", children: a.to })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mt-0.5", children: a.q }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/40 mt-1", children: "02:35" })
              ] })
            ] }),
            a.a && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start gap-3 border-t border-white/10 pt-3 relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-rose-500/40 grid place-items-center text-[11px] shrink-0", children: a.to.slice(0, 2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pr-24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-pink-300", children: [
                  a.to,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: "Answered" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-0.5", children: a.a }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/40 mt-1", children: "03:37" })
              ] }),
              a.b !== void 0 && a.s !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-3 text-right space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-emerald-400", children: [
                  "Believable (",
                  a.b,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-rose-400", children: [
                  "Suspicious (",
                  a.s,
                  ")"
                ] })
              ] })
            ] }),
            !a.a && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 border-t border-white/10 pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-amber-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-300", children: "Waiting for answer..." })
            ] })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-3", children: "Score Board" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2 text-center text-[11px]", children: [["You", 120], ["Oni86", 50], ["John32", 100], ["James45", 80], ["Fred36", 60]].map(([n, p]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/70", children: n }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-300 font-bold", children: p })
          ] }, n)) })
        ] })
      ] })
    ] })
  ] });
}
function Step({
  time,
  text
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative flex gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-purple-400 ring-4 ring-purple-500/20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-200 font-medium w-20 shrink-0", children: time }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/85", children: text })
  ] });
}
function ModalShell({
  children,
  onClose,
  max = "max-w-lg"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), className: `relative w-full ${max} rounded-3xl border border-white/15 bg-purple-950/95 shadow-elevated`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "absolute top-4 right-4 z-10 h-9 w-9 grid place-items-center rounded-xl bg-purple-700/40 hover:bg-purple-600/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, max: "max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-7", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-emerald-300", children: type === "strategy" ? "Strategy Guide" : "Game Rules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-3xl font-black text-white", children: slide.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-white/70", children: slide.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: slideIndex + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: slides.length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: slide.details.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/80", children: item })
    ] }, index)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2", children: slides.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onSelectSlide(index), className: `h-2.5 w-10 rounded-full ${index === slideIndex ? "bg-emerald-300" : "bg-white/20 hover:bg-white/30"}` }, index)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onPrev, className: "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50", disabled: slideIndex === 0, children: "Previous" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onNext, className: "inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold shadow-glow", disabled: slideIndex === slides.length - 1, children: "Next" })
      ] })
    ] })
  ] }) });
}
function roleDisplayName(person) {
  const label = person.role_label || person.role;
  const match = label.match(/you are (?:the )?(.+)/i);
  return match ? match[1].trim() : label;
}
function YourRoleModal({
  person,
  onClose
}) {
  const roleName = roleDisplayName(person);
  const roleTagline = person.role_subtitle || person.role_label || person.role;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, max: "max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[minmax(200px,240px)_1fr] overflow-hidden rounded-3xl bg-[#1a0f2e]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative bg-gradient-to-br ${person.grad} min-h-[280px] md:min-h-[360px]`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3 z-10 h-9 w-9 rounded-full border border-purple-400/40 bg-black/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-purple-300" }) }),
      person.role_image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: resolveMediaUrl(person.role_image) ?? "", alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-16 w-16 text-white/80" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-7 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-purple-300/90", children: "Your Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-3xl md:text-4xl font-black tracking-wide text-purple-200 uppercase", children: roleName }),
      roleTagline ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/75 leading-relaxed", children: roleTagline }) : null,
      person.objective ? /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "OBJECTIVE", items: [person.objective], icon: "🎯" }) : null,
      person.youKnow.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "WHAT YOU KNOW", items: person.youKnow, icon: "💡" }) : null,
      person.keep.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "KEEP IN MIND", items: person.keep, icon: "📌" }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3 flex items-center gap-2 text-sm text-white/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-white/70 shrink-0" }),
        " Keep your role secret"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Okay, Continue" })
    ] })
  ] }) });
}
function Section({
  title,
  items,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-bold tracking-widest text-purple-300 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: icon }),
      " ",
      title
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1.5 space-y-1 text-xs text-white/85 list-disc pl-5", children: items.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: t }, i)) })
  ] });
}
function PhotosModal({
  photos,
  onClose
}) {
  const [zoomedImage, setZoomedImage] = reactExports.useState(null);
  if (zoomedImage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur p-4", onClick: () => setZoomedImage(null), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute top-6 right-6 h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: zoomedImage, alt: "Zoomed Evidence", className: "max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl", onClick: (e) => e.stopPropagation() })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, max: "max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-7", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full border border-purple-400/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-5 w-5 text-purple-300" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Investigation Photos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/65", children: "You can submit your accusation now." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-3 gap-3", children: (photos.length > 0 ? photos : [mystery]).map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setZoomedImage(src), className: "relative group aspect-square overflow-hidden rounded-xl ring-1 ring-white/10 cursor-zoom-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: `Evidence ${i + 1}`, className: "h-full w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 text-zinc-800 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "h-3.5 w-3.5" }) })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-center text-xs text-white/70", children: "Check the image carefully, you might get clues." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Okay Continue" })
  ] }) });
}
function AnswerModal({
  target,
  question,
  answerSecs,
  onClose
}) {
  const [secs, setSecs] = reactExports.useState(answerSecs);
  const [ans, setAns] = reactExports.useState("");
  reactExports.useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1e3);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-purple-700/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-purple-200" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "You have been asked a Question" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/65", children: "By SC (Investigator) in Lie Detector Mode" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-purple-500/10 p-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/60", children: "Question" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-base", children: question || "Where were you between 10 PM - 11 PM" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 mx-auto text-white/60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/65 mt-1", children: "Time Left to answer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-amber-300 tabular-nums", children: fmt(secs) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-white/70", children: "Type your answer (max 120 characters)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: ans, onChange: (e) => setAns(e.target.value.slice(0, 120)), placeholder: "Type your answer here...", className: "w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/50", children: [
          ans.length,
          "/120"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "mt-4 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Submit Answer To Start Voting" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "Your answer will be visible to all players." })
  ] }) });
}
function VoteModal({
  target,
  question,
  onClose
}) {
  const [vote, setVote] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-purple-700/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-purple-200" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Vote on the Answer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/65", children: "By SC (Investigator)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-white/10 bg-purple-500/10 p-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-white/60", children: "Question" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-base", children: question || "Where were you between 10 PM - 11 PM" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-pink-300 mb-1", children: [
        target.short,
        " Answer"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-white/10 bg-black/20 p-3 text-sm", children: "I was in the library reading a book." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-pink-300 mb-2", children: "Select Votes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVote("believable"), className: `rounded-xl border py-3 text-sm font-semibold ${vote === "believable" ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-4 w-4 inline mr-2" }),
          " Believable"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVote("suspicious"), className: `rounded-xl border py-3 text-sm font-semibold ${vote === "suspicious" ? "border-rose-400 bg-rose-500/20 text-rose-300" : "border-rose-500/40 text-rose-300 hover:bg-rose-500/10"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-4 w-4 inline mr-2" }),
          " Suspicious"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, disabled: !vote, className: "mt-6 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow disabled:opacity-40", children: "Submit Vote" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "Your votes will be visible to all players." })
  ] }) });
}
function ClueRoomModal({
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, max: "max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full border border-amber-400/50 bg-amber-500/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-5 w-5 text-amber-300" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black tracking-widest", children: "CLUE ROOM" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-400", children: "Unlocked at 10:00" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 grid place-items-center text-amber-200 font-black tracking-widest", children: "TOP SECRET" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-amber-300 text-sm font-bold", children: "Clue #1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/80 mt-1", children: "A torn page was found near the window outside the study room." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-300 text-sm font-bold", children: "Clue Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/80 mt-1", children: "A piece of torn paper was discovered outside the study window." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/80 mt-2", children: "There are some written numbers on it. Could be important." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl bg-zinc-900 p-4 text-center font-mono text-amber-100", children: [
          "12 - 7 - 4 - 11",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "9 - 3"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-center text-xs text-white/70", children: "This clue is visible to all players. Use it wisely." })
  ] }) });
}
function AccuseModal({
  people,
  onClose
}) {
  const [pick, setPick] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, max: "max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full border border-rose-400/50 bg-rose-500/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "h-5 w-5 text-rose-300" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Make Your Final Accusation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/65", children: "You can submit your accusation now." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-5 gap-2", children: people.filter((p) => !p.is_you).map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setPick(i), className: `relative rounded-xl border p-2 text-center ${pick === i ? "border-purple-400 ring-2 ring-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto h-14 w-14 rounded-full bg-gradient-to-br ${p.grad} grid place-items-center`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5 text-white/80" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[11px] font-semibold", children: p.short }),
      pick === i && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-purple-500 ring-2 ring-purple-300" })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs text-white/80", children: [
        "Why do you think this player is the culprit? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "(Optional)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value.slice(0, 120)), placeholder: "Type your reason here...", className: "w-full h-24 rounded-xl bg-black/30 border border-white/10 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-2 right-3 text-[10px] text-white/50", children: [
          reason.length,
          "/120"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/results", onClick: onClose, className: "mt-5 block text-center w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Submit Answer" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-[11px] text-white/60", children: "Once submitted, you cannot change your answer." })
  ] }) });
}
function CaseSummaryModal({
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { onClose, max: "max-w-4xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-7 overflow-y-auto max-h-[80vh]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full border border-purple-400/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-purple-300" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold", children: "Case Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/65", children: "Review the details of the case." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "An old wealthy businessman, Raghav Malhotra, is ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-400 font-semibold", children: "found dead" }),
          " in his luxury bungalow."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'He was recently in a legal dispute with local farmers, accused of illegally taking their land for a "Dream City Project".' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold uppercase tracking-wider text-white/90", children: "On the night of the murder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "space-y-3 border-l-2 border-purple-500/40 pl-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { time: "10:00 PM", text: "A farmer leader visited him at 10:00 PM to finalize a compensation deal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { time: "10:30 PM", text: "He left the house." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { time: "12:00 AM", text: "A loud scream was heard by the daughter-in-law" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "After that, the businessman was ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-400 font-semibold", children: "found dead" }),
          " in his room."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block bg-amber-100/95 text-zinc-900 text-xs px-3 py-1.5 rounded-sm", children: [
          "Now, ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-700 font-bold", children: "everyone" }),
          " present in the house is a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-700 font-bold", children: "suspect." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-[320px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-4 rotate-[-6deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: mystery, alt: "", className: "h-32 w-44 object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-12 right-2 rotate-[5deg] rounded-md bg-white p-2 shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 w-40 bg-gradient-to-br from-zinc-700 to-zinc-900 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-10 w-10 text-amber-300/70" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-2 right-6 rotate-[-2deg] rounded-md bg-amber-100/95 text-zinc-900 p-4 shadow-elevated", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold tracking-wider", children: "QUICK FACTS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 space-y-1 text-[12px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
              " Location: Malhotra Bungalow"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
              " 28th April, 11:00 PM - 12:30 AM"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { className: "h-3.5 w-3.5" }),
              " Weather: Rainy Night"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-3.5 w-3.5" }),
              " CCTV: Not working due to storm"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "mt-8 w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Close Summary" })
  ] }) });
}
export {
  GamePage as component
};
