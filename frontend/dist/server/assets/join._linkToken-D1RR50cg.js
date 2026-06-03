import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { y as useNavigate, d as Route, L as Link } from "./router-DZhViOq_.js";
import { c as createLucideIcon, L as Logo } from "./Logo-COJrqD4D.js";
import { C as Crumbs } from "./Crumbs-knMBxWJ5.js";
import { p as participantService, s as saveParticipantSession } from "./participant-session-CU2R-89K.js";
import { b as toastSuccess, a as toastInfo, t as toastError } from "./toast-s3ZTemWF.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { U as User } from "./user-C3Lc9pkP.js";
import { C as Calendar } from "./calendar-DJ_Zwcf1.js";
import { C as Clock } from "./clock-L0m5LHMS.js";
import { L as Lock } from "./lock-BendAHMV.js";
import { A as ArrowRight } from "./arrow-right-h3or2hTG.js";
import { M as Mail } from "./mail-zUxH5Ck_.js";
import { S as ShieldCheck } from "./shield-check-B60WUByZ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./chevron-right-B_AJoG7h.js";
import "./config-CafHMDrA.js";
const __iconNode = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode);
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function formatScheduleLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(void 0, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
function applyJoinLinkData(data, setters) {
  const start = new Date(data.schedule_start);
  setters.setBookingId(Number(data.booking_id));
  setters.setActivityTitle(data.activity_title || "Activity");
  setters.setActivityDescription(data.activity_description ? stripHtml(String(data.activity_description)) : "");
  setters.setOrganizerName(data.organizer_name || "");
  setters.setOrganizerCompany(data.organizer_company || "");
  setters.setActivitySlug(data.activity_slug || "");
  setters.setScheduleStart(Number.isNaN(start.getTime()) ? null : start);
  setters.setRegistrationOpensAt(formatScheduleLabel(data.schedule_start));
  setters.setScheduledDate(Number.isNaN(start.getTime()) ? String(data.scheduled_date) : start.toLocaleDateString(void 0, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }));
  setters.setScheduledTime(Number.isNaN(start.getTime()) ? String(data.scheduled_time) : start.toLocaleTimeString(void 0, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }));
  const nextStep = resolveJoinStep(data);
  setters.setStep(nextStep);
  return nextStep;
}
function resolveJoinStep(data) {
  if (data.is_join) return "form";
  if (data.is_pending) {
    const start = new Date(data.schedule_start);
    if (!Number.isNaN(start.getTime()) && Date.now() >= start.getTime()) {
      return "form";
    }
    return "pending";
  }
  return "pending";
}
function JoinPage() {
  const navigate = useNavigate();
  const {
    linkToken
  } = Route.useParams();
  const [step, setStep] = reactExports.useState("loading");
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [otpValues, setOtpValues] = reactExports.useState(["", "", "", "", "", ""]);
  const [bookingId, setBookingId] = reactExports.useState(null);
  const [activityTitle, setActivityTitle] = reactExports.useState("Mystery Quest");
  const [activityDescription, setActivityDescription] = reactExports.useState("");
  const [organizerName, setOrganizerName] = reactExports.useState("");
  const [organizerCompany, setOrganizerCompany] = reactExports.useState("");
  const [scheduledDate, setScheduledDate] = reactExports.useState("");
  const [scheduledTime, setScheduledTime] = reactExports.useState("");
  const [registrationOpensAt, setRegistrationOpensAt] = reactExports.useState("");
  const [activitySlug, setActivitySlug] = reactExports.useState("");
  const [scheduleStart, setScheduleStart] = reactExports.useState(null);
  const [linkError, setLinkError] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const [joinedInfo, setJoinedInfo] = reactExports.useState(null);
  const joinLinkSetters = {
    setBookingId,
    setActivityTitle,
    setActivityDescription,
    setOrganizerName,
    setOrganizerCompany,
    setActivitySlug,
    setScheduledDate,
    setScheduledTime,
    setScheduleStart,
    setRegistrationOpensAt,
    setStep
  };
  const loadJoinLink = (token, silent = false) => {
    if (!silent) setStep("loading");
    return participantService.getJoinLink(token).then((data) => applyJoinLinkData(data, joinLinkSetters)).catch((error) => {
      const status = error?.status;
      if (status === 404) {
        setLinkError("We could not find an activity for this join link. Please check the link or contact the organizer.");
      } else {
        const message = error instanceof Error ? error.message : "Invitation link has expired or is invalid.";
        setLinkError(message);
      }
      setStep("invalid");
      return null;
    });
  };
  const handleRefreshStatus = async () => {
    if (!linkToken || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await participantService.getJoinLink(linkToken);
      const nextStep = applyJoinLinkData(data, joinLinkSetters);
      if (nextStep === "form") {
        toastSuccess("Registration is now open. You can join below.");
      } else {
        toastInfo(`Still waiting. Registration opens at ${formatScheduleLabel(data.schedule_start)}.`);
      }
    } catch (error) {
      const status = error?.status;
      if (status === 404) {
        setLinkError("We could not find an activity for this join link. Please check the link or contact the organizer.");
      } else {
        const message = error instanceof Error ? error.message : "Unable to refresh status. Please try again.";
        toastError(message);
        setLinkError(message);
      }
      setStep("invalid");
    } finally {
      setIsRefreshing(false);
    }
  };
  reactExports.useEffect(() => {
    if (!linkToken) {
      setLinkError("Invitation link is missing or invalid.");
      setStep("invalid");
      return;
    }
    loadJoinLink(linkToken);
  }, [linkToken]);
  reactExports.useEffect(() => {
    if (step !== "pending" || !linkToken) return;
    const interval = setInterval(() => {
      participantService.getJoinLink(linkToken).then((data) => {
        const nextStep = applyJoinLinkData(data, joinLinkSetters);
        if (nextStep === "form") {
          toastSuccess("Registration is now open. You can join below.");
        }
      }).catch(() => {
      });
    }, 3e4);
    return () => clearInterval(interval);
  }, [step, linkToken]);
  const canSendOtp = name.trim().length > 0 && email.includes("@");
  const otpCode = otpValues.join("");
  const handleSendOtp = () => {
    if (!bookingId) {
      toastError("Session is not ready. Please refresh the page and try again.");
      return;
    }
    if (!name.trim()) {
      toastError("Name is required.");
      return;
    }
    if (!email.includes("@")) {
      toastError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    participantService.join({
      booking_id: bookingId,
      name: name.trim(),
      email: email.trim()
    }).then((data) => {
      toastSuccess("Verification code sent to your email.");
      setStep("otp");
    }).catch((error) => {
      toastError(error?.message || "Unable to send verification code.");
    }).finally(() => setIsSubmitting(false));
  };
  const handleVerifyOtp = () => {
    if (!bookingId) return;
    if (otpCode.length !== 6) {
      toastError("Please enter the 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    participantService.verifyOtp({
      booking_id: bookingId,
      email: email.trim(),
      otp: otpCode
    }).then(async (response) => {
      setJoinedInfo({
        group_id: response.group_id,
        group_name: response.group_name,
        name: response.name
      });
      const slug = activitySlug || "detective-mystery";
      saveParticipantSession({
        groupId: response.group_id,
        participantId: response.participant_id,
        name: response.name,
        joinToken: response.join_token,
        inviteUrl: linkToken,
        gameSlug: slug
      });
      setStep("done");
      toastSuccess("Verified successfully. Entering the lobby...");
      setTimeout(() => navigate({
        to: "/lobby",
        search: {
          invite_url: linkToken,
          game: slug
        }
      }), 1200);
    }).catch((error) => {
      toastError(error?.message || "OTP verification failed.");
    }).finally(() => setIsSubmitting(false));
  };
  const updateOtpValue = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-hero text-white relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-purple-500/30 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative px-6 py-5 max-w-7xl mx-auto flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Crumbs, { tone: "dark", items: [{
        label: "Home",
        to: "/"
      }, {
        label: "Join Activity"
      }, {
        label: step === "loading" ? "Validating Link" : step === "invalid" ? "Activity Not Found" : step === "form" ? "Details" : step === "otp" ? "Verify OTP" : "Verified"
      }] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative px-4 pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl grid gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-elevated", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: mystery, alt: "Mystery Quest", className: "w-full h-56 object-cover rounded-2xl ring-1 ring-white/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-3xl font-bold leading-tight", children: activityTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-white/70", children: activityDescription || "A story-driven team challenge where employees collaborate, question, and compete to solve the case." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-5 space-y-2 text-sm text-white/85", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Role-based gameplay (Investigator, Culprit, Witness, and more)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Real-time questioning and deduction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Time-bound challenges to maintain urgency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Built for communication and strategic thinking" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-sm text-white/70", children: "Builds stronger communication, sharper thinking, and real team collaboration in a high-energy environment." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-white/95 text-foreground p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: User, label: "Organizer", v1: organizerName || "—", v2: organizerCompany || "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: Calendar, label: "Date", v1: scheduledDate || "TBA", v2: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: Clock, label: "Start Time", v1: scheduledTime || "TBA", v2: "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-elevated min-h-[560px] flex flex-col", children: [
          step === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingStep, {}),
          step === "invalid" && /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityNotFoundStep, { message: linkError }),
          step === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(PendingStep, { activityTitle, activityDescription, scheduledDate, scheduledTime, registrationOpensAt, isRefreshing, onRefresh: handleRefreshStatus }),
          step === "form" && /* @__PURE__ */ jsxRuntimeExports.jsx(FormStep, { name, setName, email, setEmail, onNext: handleSendOtp, canProceed: canSendOtp, isSubmitting, activityTitle }),
          step === "otp" && /* @__PURE__ */ jsxRuntimeExports.jsx(OtpStep, { email, values: otpValues, onUpdate: updateOtpValue, onBack: () => setStep("form"), onVerify: handleVerifyOtp, onResend: handleSendOtp, isSubmitting }),
          step === "done" && /* @__PURE__ */ jsxRuntimeExports.jsx(DoneStep, { name: joinedInfo?.name ?? name, linkToken, activitySlug }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto pt-6 flex items-center gap-2 text-[11px] text-white/55", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }),
            "Secure. Your details are protected & will be deleted after the event."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-10 text-center text-xs text-white/55", children: [
        "Powered by ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "Zoventro" }),
        " · © 2026 zoventro.com All Rights Reserved"
      ] })
    ] })
  ] });
}
function LoadingStep() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 grid place-items-center text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-16 w-16 grid place-items-center rounded-full bg-white/10 animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-8 w-8 text-white/70" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-2xl font-bold", children: "Validating your invitation..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-white/70 max-w-sm mx-auto", children: "Checking the invite link. If the link is valid, you can enter your details and join the game." })
  ] }) });
}
function ActivityNotFoundStep({
  message
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 grid place-items-center text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-16 w-16 grid place-items-center rounded-full bg-red-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-8 w-8 text-red-400" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-2xl font-bold", children: "Activity not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-white/70 max-w-sm mx-auto", children: message || "This activity could not be found. Please check your join link or contact the organizer." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white hover:bg-white/10", children: "Back to Home" })
  ] }) });
}
function PendingStep({
  activityTitle,
  activityDescription,
  scheduledDate,
  scheduledTime,
  registrationOpensAt,
  isRefreshing,
  onRefresh
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-white/60", children: "You're invited to" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-3xl font-bold", children: activityTitle }),
    activityDescription ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70", children: activityDescription }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-3xl bg-white/10 p-6 text-left text-white/85", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-white", children: "Event Schedule" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: Calendar, label: "Date", v1: scheduledDate || "TBA", v2: "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: Clock, label: "Start Time", v1: scheduledTime || "TBA", v2: "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/80", children: [
        "This activity has not started yet. Registration will open at",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: registrationOpensAt }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onRefresh, disabled: isRefreshing, className: `mt-8 self-start inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition ${isRefreshing ? "bg-white/5 cursor-wait opacity-70" : "bg-white/10 hover:bg-white/15"}`, children: [
      isRefreshing ? "Checking…" : "Refresh Status",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: `h-4 w-4 ${isRefreshing ? "animate-pulse" : ""}` }) })
    ] })
  ] });
}
function FormStep({
  name,
  setName,
  email,
  setEmail,
  onNext,
  canProceed,
  isSubmitting,
  activityTitle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-white/60", children: "You're invited to" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-3xl font-bold", children: activityTitle }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70", children: "A story-driven team challenge where employees collaborate, question, and compete to solve the case." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-7 text-lg font-bold", children: "Join the Game" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60", children: "Enter your details to join the event and receive your verification code." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: User, label: "Full Name", placeholder: "Enter your full name", value: name, onChange: setName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Mail, label: "Email Address", hint: "An OTP will be sent to this email for verification", placeholder: "Enter your email address", value: email, onChange: setEmail, type: "email" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onNext, disabled: !canProceed || isSubmitting, className: `mt-6 self-start inline-flex items-center gap-2 rounded-full pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow transition ${canProceed && !isSubmitting ? "bg-gradient-primary text-white hover:opacity-90" : "bg-white/15 text-white/60 cursor-not-allowed"}`, children: [
      isSubmitting ? "Sending…" : "Send Verification Code",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
    ] })
  ] });
}
function OtpStep({
  email,
  values,
  onUpdate,
  onBack,
  onVerify,
  onResend,
  isSubmitting
}) {
  const refs = reactExports.useRef([]);
  reactExports.useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  const filled = values.every(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "self-start inline-flex items-center gap-2 text-xs text-white/80 bg-white/10 rounded-full px-3 py-1.5 hover:bg-white/15", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
      " Go Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-6 text-3xl font-bold", children: "Verify Your Email" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70", children: "Enter the OTP sent to your email to continue." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-xs text-white/65", children: [
      "We have sent a 6-digit code to your email",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium", children: email || "you@company.com" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-2.5", children: values.map((value, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: (el) => {
      refs.current[index] = el;
    }, value, onChange: (e) => {
      const nextValue = e.target.value.replace(/\D/g, "").slice(-1);
      onUpdate(index, nextValue);
      if (nextValue && index < values.length - 1) {
        refs.current[index + 1]?.focus();
      }
      if (!nextValue && index > 0) {
        refs.current[index - 1]?.focus();
      }
    }, type: "text", inputMode: "numeric", maxLength: 1, className: "h-14 w-14 rounded-3xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white outline-none transition focus:border-primary focus:bg-white/10" }, index)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs text-white/55", children: [
      "Didn't receive the code?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onResend, disabled: isSubmitting, className: "text-primary font-medium disabled:opacity-50", children: "Resend" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onVerify, disabled: !filled || isSubmitting, className: `mt-6 self-start inline-flex items-center gap-2 rounded-full pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow transition ${filled && !isSubmitting ? "bg-gradient-primary text-white hover:opacity-90" : "bg-white/15 text-white/60 cursor-not-allowed"}`, children: [
      isSubmitting ? "Verifying…" : "Verify & Proceed",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
    ] })
  ] });
}
function DoneStep({
  name,
  linkToken,
  activitySlug
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 grid place-items-center text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-16 w-16 grid place-items-center rounded-full bg-gradient-primary shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8 text-white" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-5 text-2xl font-bold", children: [
      "Welcome",
      name ? `, ${name.split(" ")[0]}` : "",
      "!"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/70 max-w-xs mx-auto", children: "You're verified and assigned to your group. Sit tight — the mystery begins shortly." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/lobby", search: {
      invite_url: linkToken,
      game: activitySlug || "detective-mystery"
    }, className: "mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow", children: [
      "Enter Lobby",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
    ] })
  ] }) });
}
function Field({
  icon: Icon,
  label,
  hint,
  placeholder,
  value,
  onChange,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: label }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-white/55 mt-0.5", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, className: "w-full rounded-xl bg-white/5 border border-white/15 pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" })
    ] })
  ] });
}
function Meta({
  icon: Icon,
  label,
  v1,
  v2
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-primary" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-semibold", children: v1 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: v2 })
  ] });
}
export {
  JoinPage as component
};
