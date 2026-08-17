import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { User, Calendar, Clock, Lock, ArrowRight, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { p as participantService } from "./participant.service-CRAKZY7j.js";
import { s as saveParticipantSession } from "./participant-session-CZEpXMRe.js";
import { a as toastSuccess, c as toastInfo, t as toastError } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { l as lobbyLogo } from "./Cook  and Create Logo-D7X4g-oO.js";
import { h as heroBg } from "./hero-bg-home-LTKDrSLZ.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { a as isCookAndCreateSlug, b as resolveLobbyRoute } from "./common-CBq9_QVG.js";
import { e as Route } from "./router-BvkvNwFV.js";
import "./config-OQZNPa_v.js";
import "sonner";
import "clsx";
import "@tanstack/react-query";
const cook = "/assets/game-2-lobby-bg-expanded-BMbtmkQt.jpg";
const mqlogo = "/assets/mqlogo-Dc1kEo4c.png";
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
  setters.setActivityDescription(data.activity_description || "");
  setters.setActivityIcon(data.activity_icon || null);
  setters.setActivityCover(data.activity_cover_image || null);
  setters.setOrganizerName(data.organizer_name || "");
  setters.setOrganizerCompany(data.organizer_company || "");
  setters.setActivitySlug(data.activity_slug || "");
  setters.setScheduleStart(Number.isNaN(start.getTime()) ? null : start);
  setters.setRegistrationOpensAt(formatScheduleLabel(data.schedule_start));
  setters.setScheduledDate(Number.isNaN(start.getTime()) ? String(data.scheduled_date) : start.toLocaleDateString(void 0, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }));
  setters.setScheduledDateDay(Number.isNaN(start.getTime()) ? "" : `(${start.toLocaleDateString(void 0, {
    weekday: "long"
  })})`);
  setters.setScheduledTime(Number.isNaN(start.getTime()) ? String(data.scheduled_time) : start.toLocaleTimeString(void 0, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }));
  setters.setScheduledTimezone(Number.isNaN(start.getTime()) ? "" : `(${start.toLocaleTimeString(void 0, {
    timeZoneName: "short"
  }).split(" ").pop()})`);
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
  const [step, setStep] = useState("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [bookingId, setBookingId] = useState(null);
  const [activityTitle, setActivityTitle] = useState("Mystery Quest");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityIcon, setActivityIcon] = useState(null);
  const [activityCover, setActivityCover] = useState(null);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerCompany, setOrganizerCompany] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledDateDay, setScheduledDateDay] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledTimezone, setScheduledTimezone] = useState("");
  const [registrationOpensAt, setRegistrationOpensAt] = useState("");
  const [activitySlug, setActivitySlug] = useState("");
  const [scheduleStart, setScheduleStart] = useState(null);
  const [linkError, setLinkError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joinedInfo, setJoinedInfo] = useState(null);
  const joinLinkSetters = {
    setBookingId,
    setActivityTitle,
    setActivityDescription,
    setActivityIcon,
    setActivityCover,
    setOrganizerName,
    setOrganizerCompany,
    setActivitySlug,
    setScheduledDate,
    setScheduledDateDay,
    setScheduledTime,
    setScheduledTimezone,
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
  useEffect(() => {
    if (!linkToken) {
      setLinkError("Invitation link is missing or invalid.");
      setStep("invalid");
      return;
    }
    loadJoinLink(linkToken);
  }, [linkToken]);
  useEffect(() => {
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
  name.trim().length > 0 && email.includes("@") && disclaimerAccepted;
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
      const lobby = resolveLobbyRoute(slug);
      setTimeout(() => navigate({
        to: lobby.to,
        search: {
          ...lobby.search,
          invite_url: linkToken
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen text-white relative overflow-hidden bg-[#0a0715]", children: [
    /* @__PURE__ */ jsx("img", { src: heroBg, alt: "", className: "absolute h-full w-full" }),
    /* @__PURE__ */ jsx("div", { className: "absolute bg-gradient-to-br from-[#0a0715]/90 via-[#0a0715]/70 to-[#0a0715]/90" }),
    /* @__PURE__ */ jsx("header", { className: "relative px-6 py-5 max-w-7xl mx-auto flex items-center justify-between" }),
    /* @__PURE__ */ jsxs("main", { className: "relative px-4 pb-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1240px] grid gap-8 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-elevated flex flex-col min-h-[640px]", children: [
          /* @__PURE__ */ jsx("img", { src: activityCover ? resolveMediaUrl(activityCover) ?? void 0 : isCookAndCreateSlug(activitySlug) ? cook : mystery, alt: activityTitle, className: "absolute  h-full w-full" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bg-gradient-to-r from-[#0a0715] via-[#0a0715]/70 to-transparent" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/30" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col h-full p-8 md:p-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6 md:gap-8 items-start", children: [
              /* @__PURE__ */ jsx("img", { src: activityIcon ? resolveMediaUrl(activityIcon) ?? void 0 : isCookAndCreateSlug(activitySlug) ? lobbyLogo : mqlogo, alt: "Logo", className: "w-40 md:w-48 object-contain drop-shadow-2xl" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 pt-2", children: [
                /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold leading-tight drop-shadow-md", children: isCookAndCreateSlug(activitySlug) ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Ready to cook up",
                  /* @__PURE__ */ jsx("br", {}),
                  "some chaos?"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Are you ready to",
                  /* @__PURE__ */ jsx("br", {}),
                  "solve the mystery?"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4 text-[13.5px] text-white/90 leading-relaxed max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-2 [&_li]:marker:text-white/40", children: activityDescription ? /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: {
                  __html: activityDescription
                } }) : isCookAndCreateSlug(activitySlug) ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("p", { children: "Work together to cook up the best dish — while one hidden impostor secretly tries to sabotage it." }),
                  /* @__PURE__ */ jsxs("ul", { className: "pl-4 list-disc marker:text-white/40 space-y-2", children: [
                    /* @__PURE__ */ jsx("li", { children: "Vote on ingredients, submit cooking steps, and vote out the impostor" }),
                    /* @__PURE__ */ jsx("li", { children: "Every action is anonymous — watch for suspicious patterns" }),
                    /* @__PURE__ */ jsx("li", { children: "Time-bound rounds to keep the energy up" }),
                    /* @__PURE__ */ jsx("li", { children: "Built for creativity and quick team thinking" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { children: "A fast, funny team-building challenge that rewards collaboration and sharp observation." })
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("p", { children: "A story-driven team challenge where employees collaborate, question, and compete to solve the case." }),
                  /* @__PURE__ */ jsxs("ul", { className: "pl-4 list-disc marker:text-white/40 space-y-2", children: [
                    /* @__PURE__ */ jsx("li", { children: "Role-based gameplay (Investigator, Culprit, Witness, and more)" }),
                    /* @__PURE__ */ jsx("li", { children: "Real-time questioning and deduction" }),
                    /* @__PURE__ */ jsx("li", { children: "Time-bound challenges to maintain urgency" }),
                    /* @__PURE__ */ jsx("li", { children: "Built for communication and strategic thinking" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { children: "Builds stronger communication, sharper thinking, and real team collaboration in a high-energy environment." })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-auto pt-10", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 rounded-[24px] bg-white text-foreground p-5 shadow-2xl", children: [
              /* @__PURE__ */ jsx("div", { className: "px-3", children: /* @__PURE__ */ jsx(Meta, { icon: User, label: "Organizer", v1: organizerName || "—", v2: organizerCompany || "" }) }),
              /* @__PURE__ */ jsx("div", { className: "px-5 border-l border-black/10", children: /* @__PURE__ */ jsx(Meta, { icon: Calendar, label: "Date", v1: scheduledDate || "TBA", v2: scheduledDateDay }) }),
              /* @__PURE__ */ jsx("div", { className: "px-5 border-l border-black/10", children: /* @__PURE__ */ jsx(Meta, { icon: Clock, label: "Start Time", v1: scheduledTime || "TBA", v2: scheduledTimezone }) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-elevated min-h-[560px] flex flex-col", children: [
          step === "loading" && /* @__PURE__ */ jsx(LoadingStep, {}),
          step === "invalid" && /* @__PURE__ */ jsx(ActivityNotFoundStep, { message: linkError }),
          step === "pending" && /* @__PURE__ */ jsx(PendingStep, { activityTitle, activityDescription, scheduledDate, scheduledDateDay, scheduledTime, scheduledTimezone, registrationOpensAt, isRefreshing, onRefresh: handleRefreshStatus }),
          step === "form" && /* @__PURE__ */ jsx(FormStep, { name, setName, email, setEmail, disclaimerAccepted, setDisclaimerAccepted, onNext: handleSendOtp, canProceed: name.trim().length > 0 && email.includes("@"), isSubmitting, activityTitle, activityDescription, activitySlug }),
          step === "otp" && /* @__PURE__ */ jsx(OtpStep, { email, values: otpValues, onUpdate: updateOtpValue, onBack: () => setStep("form"), onVerify: handleVerifyOtp, onResend: handleSendOtp, isSubmitting }),
          step === "done" && /* @__PURE__ */ jsx(DoneStep, { name: joinedInfo?.name ?? name, linkToken, activitySlug }),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-6 flex items-center gap-2 text-[11px] text-white/55", children: [
            /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }),
            "Secure. Your details are protected & will be deleted after the event."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-10 text-center text-xs text-white/55", children: [
        "Powered by ",
        /* @__PURE__ */ jsx("span", { className: "text-white", children: "Zoventro" }),
        " · © 2026 zoventro.com All Rights Reserved"
      ] })
    ] })
  ] });
}
function LoadingStep() {
  return /* @__PURE__ */ jsx("div", { className: "flex-1 grid place-items-center text-center", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-16 w-16 grid place-items-center rounded-full bg-white/10 animate-pulse", children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-8 w-8 text-white/70" }) }),
    /* @__PURE__ */ jsx("h2", { className: "mt-5 text-2xl font-bold", children: "Validating your invitation..." }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/70 max-w-sm mx-auto", children: "Checking the invite link. If the link is valid, you can enter your details and join the game." })
  ] }) });
}
function ActivityNotFoundStep({
  message
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex-1 grid place-items-center text-center", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-16 w-16 grid place-items-center rounded-full bg-red-500/20", children: /* @__PURE__ */ jsx(Lock, { className: "h-8 w-8 text-red-400" }) }),
    /* @__PURE__ */ jsx("h2", { className: "mt-5 text-2xl font-bold", children: "Activity not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/70 max-w-sm mx-auto", children: message || "This activity could not be found. Please check your join link or contact the organizer." }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white hover:bg-white/10", children: "Back to Home" })
  ] }) });
}
function PendingStep({
  activityTitle,
  activityDescription,
  scheduledDate,
  scheduledDateDay,
  scheduledTime,
  scheduledTimezone,
  registrationOpensAt,
  isRefreshing,
  onRefresh
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "text-[15px] text-white/90 mb-1", children: "You're invited to" }),
    /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold md:text-[40px] tracking-tight", children: activityTitle }),
    activityDescription ? /* @__PURE__ */ jsx("div", { className: "mt-3 text-[14px] text-white/80 leading-relaxed max-w-none line-clamp-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:marker:text-white/40", dangerouslySetInnerHTML: {
      __html: activityDescription
    } }) : null,
    /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-3xl bg-white/10 p-6 text-left text-white/85", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-white", children: "Event Schedule" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Meta, { icon: Calendar, label: "Date", v1: scheduledDate || "TBA", v2: scheduledDateDay }),
        /* @__PURE__ */ jsx(Meta, { icon: Clock, label: "Start Time", v1: scheduledTime || "TBA", v2: scheduledTimezone })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/80", children: "The game is not scheduled today. Please join at the right date and time. Please contact the organiser." })
    ] }),
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: onRefresh, disabled: isRefreshing, className: `mt-8 self-start inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition ${isRefreshing ? "bg-white/5 cursor-wait opacity-70" : "bg-white/10 hover:bg-white/15"}`, children: [
      isRefreshing ? "Checking…" : "Refresh Status",
      /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsx(ArrowRight, { className: `h-4 w-4 ${isRefreshing ? "animate-pulse" : ""}` }) })
    ] })
  ] });
}
function FormStep({
  name,
  setName,
  email,
  setEmail,
  disclaimerAccepted,
  setDisclaimerAccepted,
  onNext,
  canProceed,
  isSubmitting,
  activityTitle,
  activityDescription,
  activitySlug
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "text-[15px] text-white/90 mb-1", children: "You're invited to" }),
    /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold md:text-[40px] tracking-tight", children: activityTitle }),
    activityDescription ? /* @__PURE__ */ jsx("div", { className: "mt-3 text-[14px] text-white/80 leading-relaxed max-w-none line-clamp-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:marker:text-white/40", dangerouslySetInnerHTML: {
      __html: activityDescription
    } }) : /* @__PURE__ */ jsx("p", { className: "mt-3 text-[14px] text-white/80 leading-relaxed", children: isCookAndCreateSlug(activitySlug) ? "Work together to cook up the best dish while spotting the hidden impostor in your kitchen." : "A story-driven team challenge where employees collaborate, question, and compete to solve the case." }),
    /* @__PURE__ */ jsx("h3", { className: "mt-8 text-[22px] font-bold", children: "Join the Game" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-[14px] text-white/80", children: "Enter your details to join the event and get assigned to your group." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-5", children: [
      /* @__PURE__ */ jsx(Field, { icon: User, label: "Full Name", placeholder: "Enter your full name", value: name, onChange: setName }),
      /* @__PURE__ */ jsx(Field, { icon: Mail, label: "Work Email", hint: "An OTP will be sent to this email for verification", placeholder: "Enter your work email", value: email, onChange: setEmail, type: "email" })
    ] }),
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: onNext, disabled: !canProceed || isSubmitting, className: `mt-8 self-start inline-flex items-center justify-between gap-4 rounded-full pl-6 pr-1.5 py-1.5 text-[15px] font-medium shadow-md transition-all border-0 ${canProceed && !isSubmitting ? "bg-gradient-blue text-white hover:opacity-90" : "bg-white/10 text-white/40 cursor-not-allowed"}`, children: [
      isSubmitting ? "Sending…" : "Send Verification Code",
      /* @__PURE__ */ jsx("span", { className: `grid h-9 w-9 place-items-center rounded-full transition-colors ${canProceed && !isSubmitting ? "bg-white text-[#8B5CF6]" : "bg-white/10 text-white/40"}`, children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4", strokeWidth: 2.5 }) })
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
  const refs = useRef([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  const filled = values.every(Boolean);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "self-start inline-flex items-center gap-3 text-[14px] text-white/90 hover:text-white transition-colors", children: [
      /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-full bg-white text-[#3B82F6]", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4", strokeWidth: 2.5 }) }),
      "Go Back"
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mt-8 text-3xl font-bold md:text-[40px] tracking-tight", children: "Verify Your Email" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-[14px] text-white/80", children: "Enter the OTP sent to your email to continue." }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-[14px] text-white/90", children: [
      "We have sent a 6 digit code to your email ",
      email || "you@company.com"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-5 flex gap-3", children: values.map((value, index) => /* @__PURE__ */ jsx("input", { ref: (el) => {
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
    }, type: "text", inputMode: "numeric", maxLength: 1, className: `h-[56px] w-[56px] rounded-[14px] border pl-1 pr-1 text-center text-[22px] font-bold text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary ${value ? "bg-[#3B82F6]/20 border-[#3B82F6]/40" : "bg-transparent border-white/20"}` }, index)) }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-[14px] text-white/80", children: [
      "Didn't receive code?",
      " ",
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onResend, disabled: isSubmitting, className: "text-[#F43F5E] hover:text-[#E11D48] transition-colors disabled:opacity-50", children: "Resend" })
    ] }),
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: onVerify, disabled: !filled || isSubmitting, className: `mt-8 self-start inline-flex items-center justify-between gap-4 rounded-full pl-6 pr-1.5 py-1.5 text-[15px] font-medium shadow-md transition-all border-0 ${filled && !isSubmitting ? "bg-gradient-blue text-white hover:opacity-90" : "bg-white/10 text-white/40 cursor-not-allowed"}`, children: [
      isSubmitting ? "Verifying…" : "Verify & Proceed",
      /* @__PURE__ */ jsx("span", { className: `grid h-9 w-9 place-items-center rounded-full transition-colors ${filled && !isSubmitting ? "bg-white text-[#8B5CF6]" : "bg-white/10 text-white/40"}`, children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4", strokeWidth: 2.5 }) })
    ] })
  ] });
}
function DoneStep({
  name,
  linkToken,
  activitySlug
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex-1 grid place-items-center text-center", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-16 w-16 grid place-items-center rounded-full bg-gradient-primary shadow-glow", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-8 w-8 text-white" }) }),
    /* @__PURE__ */ jsxs("h2", { className: "mt-5 text-2xl font-bold", children: [
      "Welcome",
      name ? `, ${name.split(" ")[0]}` : "",
      "!"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/70 max-w-xs mx-auto", children: "You're verified and assigned to your group. Sit tight — the mystery begins shortly." }),
    /* @__PURE__ */ jsxs(Link, { to: "/lobby", search: {
      invite_url: linkToken,
      game: activitySlug || "detective-mystery"
    }, className: "mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow", children: [
      "Enter Lobby",
      /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }) })
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
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[15px] font-bold text-white", children: label }),
    hint && /* @__PURE__ */ jsx("span", { className: "block text-[11px] text-white/60 mt-0.5", children: hint }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 relative", children: [
      /* @__PURE__ */ jsx("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, className: "w-full rounded-xl bg-transparent border border-white/30 pl-4 pr-11 py-3.5 text-[15px] text-white placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" }),
      /* @__PURE__ */ jsx(Icon, { className: "absolute right-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/70", strokeWidth: 2 })
    ] })
  ] });
}
function Meta({
  icon: Icon,
  label,
  v1,
  v2
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-[18px] w-[18px] text-[#8B5CF6]", strokeWidth: 2 }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-[14px] font-bold text-black", children: v1 }),
    /* @__PURE__ */ jsx("div", { className: "text-[12px] text-muted-foreground mt-0.5", children: v2 })
  ] });
}
export {
  JoinPage as component
};
