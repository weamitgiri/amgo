import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Link2, CheckCircle2, Calendar, Clock, ShieldCheck, Download, Layers, Users, Boxes, UserMinus, MousePointerClick, Play, Info, X, AlertCircle } from "lucide-react";
import { u as useOrganizerEventLive, D as DashboardShell, f as formatJoinedAt } from "./DashboardShell-DnxArFqU.js";
import { i as isOrganizerAuthenticated, a as apiClient } from "./router-qdPwl0jo.js";
import { o as organizerService } from "./organizer.service-D9SFzC32.js";
import { a as toastSuccess, t as toastError } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { r as resolveMediaUrl } from "./media-BmyD47-a.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "sonner";
import "./config-qISbZfHI.js";
function DashboardPage() {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduled, setRescheduled] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/dashboard"
        }
      });
    }
  }, [navigate]);
  const {
    booking,
    organizer,
    eventStats,
    isLoading,
    isError
  } = useOrganizerEventLive();
  const organizerName = organizer?.name ?? "Organizer";
  const organizerEmail = organizer?.email ?? "";
  const bookingImage = resolveMediaUrl(booking?.cover_image) ?? mystery;
  const bookingIcon = booking?.activity_icon ? resolveMediaUrl(booking.activity_icon) : null;
  booking?.booking_id;
  const eventProgress = eventStats?.event_progress ?? {
    participants_joined: 0,
    max_participants: 0,
    groups_formed: 0,
    max_groups: 0,
    remaining_to_form_group: 0,
    access_link_clicks: 0
  };
  const recentGroups = Array.isArray(eventStats?.recent_groups) ? eventStats.recent_groups : [];
  const recentParticipants = Array.isArray(eventStats?.recent_participants) ? eventStats.recent_participants : [];
  eventStats?.event_status ?? null;
  booking?.booking_status?.toLowerCase() ?? "active";
  const toNumber = (value, fallback = 0) => {
    const n = typeof value === "string" ? Number(value) : value;
    return typeof n === "number" && Number.isFinite(n) ? n : fallback;
  };
  const activityName = booking?.activity_name ?? "Mystery Quest";
  const packageName = booking?.package_name ?? "Standard Pack";
  const maxUsers = toNumber(eventProgress.max_participants, booking?.max_users ?? 50);
  const maxGroups = toNumber(eventProgress.max_groups, Math.ceil(maxUsers / 5));
  const participantsJoined = toNumber(eventProgress.participants_joined, booking?.registered_participants ?? 0);
  const groupsFormed = toNumber(eventProgress.groups_formed, 0);
  const remainingToFormGroup = toNumber(eventProgress.remaining_to_form_group, 0);
  const linkClicks = toNumber(eventProgress.access_link_clicks, 0);
  const hasLiveStats = Boolean(eventStats && eventProgress);
  const parseDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;
    let year = null;
    let month = null;
    let day = null;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (dateValue instanceof Date) {
      year = dateValue.getFullYear();
      month = dateValue.getMonth() + 1;
      day = dateValue.getDate();
    } else if (typeof dateValue === "string") {
      const normalized = dateValue.trim();
      const dateParts = normalized.split(/[-\/]/).map((s) => parseInt(s, 10));
      if (dateParts.length === 3) {
        [year, month, day] = dateParts;
      }
    }
    if (timeValue instanceof Date) {
      hours = timeValue.getHours();
      minutes = timeValue.getMinutes();
      seconds = timeValue.getSeconds();
    } else if (typeof timeValue === "string") {
      const timeParts = timeValue.trim().split(":").map((s) => parseInt(s, 10));
      if (timeParts.length >= 2) {
        [hours, minutes, seconds] = [timeParts[0] ?? 0, timeParts[1] ?? 0, timeParts[2] ?? 0];
      }
    }
    if (year === null || month === null || day === null) return null;
    const result = new Date(year, month - 1, day, hours, minutes, seconds);
    return Number.isNaN(result.getTime()) ? null : result;
  };
  const scheduledDateTime = parseDateTime(booking?.scheduled_date, booking?.scheduled_time);
  const gameDurationSecs = toNumber(booking?.game_duration_secs, 25 * 60);
  const eventEndTime = scheduledDateTime && gameDurationSecs > 0 ? new Date(scheduledDateTime.getTime() + gameDurationSecs * 1e3) : null;
  const currentScheduleDate = scheduledDateTime ? scheduledDateTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : "—";
  const currentScheduleTime = scheduledDateTime ? scheduledDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
  const [now, setNow] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(timer);
  }, []);
  const eventStartsMs = scheduledDateTime ? scheduledDateTime.getTime() - now.getTime() : null;
  const eventStartsMin = eventStartsMs !== null ? Math.ceil(eventStartsMs / 6e4) : 0;
  const isEventStarted = eventStartsMs !== null && eventStartsMs <= 0;
  const eventEndedMs = eventEndTime ? eventEndTime.getTime() - now.getTime() : null;
  const isEventCompleted = eventEndedMs !== null && eventEndedMs <= 0;
  const eventStatusLabel = eventStartsMs === null ? "Schedule unavailable" : isEventStarted ? Math.abs(eventStartsMs) <= 6e4 ? "Starting now" : `Started ${Math.abs(eventStartsMin)} min ago` : eventStartsMs < 36e5 ? (() => {
    const minutes = Math.floor(eventStartsMs / 6e4);
    const seconds = Math.floor(eventStartsMs % 6e4 / 1e3);
    return `Starting in ${minutes}m ${seconds}s`;
  })() : eventStartsMs < 864e5 ? `Starting in ${Math.ceil(eventStartsMs / 36e5)} hr` : `Starting in ${Math.ceil(eventStartsMs / 864e5)} days`;
  const eventStatusButtonLabel = scheduledDateTime ? isEventStarted ? "Event Started" : eventStatusLabel : "Schedule unavailable";
  const eventOverviewBadgeLabel = isEventCompleted ? "Event Completed" : booking?.booking_status ? booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1) : "Active";
  const rescheduleCutoff = scheduledDateTime ? new Date(scheduledDateTime.getTime() - 60 * 60 * 1e3) : null;
  const rescheduleUntilLabel = rescheduleCutoff ? `${rescheduleCutoff.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })}, ${rescheduleCutoff.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  })}` : "—";
  const scheduledDayLabel = scheduledDateTime && scheduledDateTime.toDateString() === now.toDateString() ? "Today" : currentScheduleDate;
  const eventStatusText = scheduledDateTime ? isEventCompleted ? `Your event ended at ${eventEndTime?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }) ?? "—"}.` : `Your event is scheduled to begin at ${currentScheduleTime}, ${scheduledDayLabel}.` : "Schedule information is unavailable.";
  const accessValidityLabel = isEventCompleted ? "Expired" : "5 Days";
  const accessValidityClass = isEventCompleted ? "text-red-500" : "text-foreground";
  const accessValiditySubLabel = isEventCompleted ? "event completed" : "from activation";
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const rescheduleMaxStr = (() => {
    if (!booking?.payment_date) return void 0;
    const paid = new Date(booking.payment_date);
    if (Number.isNaN(paid.getTime())) return void 0;
    paid.setDate(paid.getDate() + 5);
    return paid.toISOString().split("T")[0];
  })();
  const handleReschedule = () => {
    if (!newDate || !newTime || !booking) return;
    const scheduled_date = newDate;
    const scheduled_time = `${newTime}:00`;
    organizerService.updateSession({
      booking_id: booking.booking_id,
      scheduled_date,
      scheduled_time
    }).then(() => {
      toastSuccess("Session rescheduled successfully.");
      setRescheduled(true);
      setRescheduleOpen(false);
      setNewDate("");
      setNewTime("");
      window.location.reload();
    }).catch((err) => {
      toastError(err?.message || "Failed to reschedule. Please try again.");
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(DashboardShell, { crumb: "Organizer Dashboard", userName: organizerName, userEmail: organizerEmail, onLogout: () => {
      apiClient.setToken(null);
      navigate({
        to: "/login",
        search: {
          redirect: "/dashboard"
        }
      });
    }, children: isLoading ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-white p-8 shadow-card text-center", children: /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Loading dashboard..." }) }) : isError ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-white p-8 shadow-card text-center text-destructive", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Unable to load dashboard data." }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please login again or contact support." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Session Overview" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage your session, track participation, and prepare for the scheduled start." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-foreground", children: "Share Access Link" }),
          /* @__PURE__ */ jsxs("button", { onClick: async () => {
            const link = booking?.invitation_link ? `${window.location.origin}/join/${booking.invitation_link}` : "";
            if (!link) return;
            try {
              await navigator.clipboard.writeText(link);
              toastSuccess("Invitation link copied to clipboard");
              setCopyStatus("Copied!");
              setTimeout(() => setCopyStatus(""), 1800);
            } catch (e) {
              toastError("Unable to copy link");
            }
          }, className: "inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-sm", children: [
            /* @__PURE__ */ jsx(Link2, { className: "h-4 w-4 text-primary" }),
            copyStatus || "Copy Link"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white shadow-card overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-[220px_1fr_260px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-[220px] w-full mt-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 overflow-hidden rounded-2xl", children: [
              /* @__PURE__ */ jsx("img", { src: bookingImage, alt: activityName, className: "h-full w-full object-cover" }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" })
            ] }),
            bookingIcon && /* @__PURE__ */ jsx("img", { src: bookingIcon, alt: `${activityName} icon`, className: "absolute -top-6 left-1/2 -translate-x-1/2 w-[80%] max-w-[180px] object-contain drop-shadow-xl z-10" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
              /* @__PURE__ */ jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z" }) }) }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: activityName }),
              /* @__PURE__ */ jsx("span", { className: `rounded-full px-2.5 py-0.5 text-xs font-semibold ${isEventCompleted ? "bg-rose-100 text-rose-700" : booking?.booking_status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted/30 text-foreground/70"}`, children: eventOverviewBadgeLabel }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Package ID: ",
                booking?.booking_id ?? "—"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-md", children: "A story-driven team challenge where employees collaborate, question, and compete to solve the case." }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-3 gap-4 text-sm", children: [
              /* @__PURE__ */ jsx(Field, { label: "Package", value: packageName }),
              /* @__PURE__ */ jsx(Field, { label: "Team Size", value: `Up to ${maxUsers} Participants` }),
              /* @__PURE__ */ jsx(Field, { label: "Groups", value: /* @__PURE__ */ jsxs(Fragment, { children: [
                maxGroups,
                " Groups ",
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
                  "(",
                  Math.min(5, maxUsers),
                  " per group)"
                ] })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-purple-50/60 border border-purple-100 p-5 flex flex-col", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
              /* @__PURE__ */ jsx("span", { children: "Reschedule" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "• 1 time allowed" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1.5 leading-relaxed", children: "You can reschedule your event once before starting the game." }),
            booking?.is_rescheduled || rescheduled ? /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 shrink-0" }),
              " Rescheduled successfully"
            ] }) : /* @__PURE__ */ jsx("button", { onClick: () => setRescheduleOpen(true), className: "mt-3 w-full rounded-full border-2 border-primary text-primary bg-white text-sm font-semibold py-2 hover:bg-primary/5 transition-colors", children: "Reschedule Event" }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-xs text-muted-foreground font-medium", children: "Current Schedule" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-3 text-sm font-medium", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-primary" }),
                " ",
                currentScheduleDate
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-primary" }),
                " ",
                currentScheduleTime
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-muted-foreground font-medium", children: "Reschedule untill" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: rescheduleUntilLabel })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-border/60 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-0 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 pr-4", children: [
            /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Date" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold mt-0.5", children: currentScheduleDate })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 border-l border-border/60 pl-4 pr-4", children: [
            /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Start Time" }),
              /* @__PURE__ */ jsxs("div", { className: "font-semibold mt-0.5", children: [
                currentScheduleTime,
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(IST)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 border-l border-border/60 pl-4 pr-4", children: [
            /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Access Validity" }),
              /* @__PURE__ */ jsxs("div", { className: `font-semibold mt-0.5 ${accessValidityClass}`, children: [
                accessValidityLabel,
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-normal", children: accessValiditySubLabel })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 border-l border-border/60 pl-4", children: [
            /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "GST Invoice" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold mt-0.5", children: booking?.booking_id ? /* @__PURE__ */ jsx("button", { onClick: () => navigate({
                to: `/payments`,
                search: {
                  booking: String(booking.booking_id)
                }
              }), className: "text-primary hover:underline", children: "download" }) : /* @__PURE__ */ jsx("span", { className: "text-muted", children: "—" }) })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardTitle, { icon: Layers, color: "text-primary", bg: "bg-primary/10", children: "Event Progress" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 mt-5", children: [
            /* @__PURE__ */ jsx(Stat, { icon: Users, label: "Participants Joined", value: `${participantsJoined}`, total: `${maxUsers}`, pct: maxUsers > 0 ? Math.min(100, Math.round(participantsJoined / maxUsers * 100)) : 0 }),
            /* @__PURE__ */ jsx(Stat, { icon: Boxes, label: "Groups Formed", value: `${groupsFormed}`, total: `${maxGroups}`, pct: maxGroups > 0 ? Math.min(100, Math.round(groupsFormed / maxGroups * 100)) : 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 mt-6 border-t border-border/60 pt-5", children: [
            /* @__PURE__ */ jsx(Stat2, { icon: UserMinus, label: "Remaining to form group", value: `${remainingToFormGroup}`, sub: remainingToFormGroup === 1 ? "1 more participant needed" : `${remainingToFormGroup} more participants needed` }),
            /* @__PURE__ */ jsx(Stat2, { icon: MousePointerClick, label: "Access Link Clicks", value: `${linkClicks}`, sub: "Updates live when invite link is opened" })
          ] }),
          !hasLiveStats && /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Live dashboard stats are still loading." })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: isEventCompleted ? "Event Completed" : "Event Status" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: isEventCompleted ? "The session has ended. Review participation, export records, and download the GST invoice." : "Ensure all the participants have joined and groups are complete." }),
          /* @__PURE__ */ jsxs("button", { className: `mt-4 w-full rounded-full text-white py-3 font-semibold inline-flex items-center justify-center gap-2 shadow-glow ${isEventCompleted ? "bg-gradient-to-r from-rose-500 to-red-500" : "bg-gradient-primary"}`, disabled: isEventCompleted, children: [
            /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
            " ",
            isEventCompleted ? "Event Completed" : eventStatusButtonLabel
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${isEventCompleted ? "bg-rose-50 text-rose-700" : "bg-purple-50"}`, children: [
            /* @__PURE__ */ jsx(Info, { className: `h-4 w-4 mt-0.5 ${isEventCompleted ? "text-rose-500" : "text-primary"}` }),
            /* @__PURE__ */ jsx("span", { children: isEventCompleted ? "Your event has ended and access is now closed." : eventStatusText })
          ] }),
          !isEventCompleted && /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500" }),
              "Minimum 5 players per group required."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500" }),
              "Join within 15 minutes of the start time."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500" }),
              "Teams form automatically, late joiners may miss participation."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(CardTitle, { icon: Layers, color: "text-primary", bg: "bg-primary/10", children: "Recent Groups" }),
            /* @__PURE__ */ jsx("a", { className: "text-sm text-primary font-medium", children: "View All Groups" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-3 gap-4", children: recentGroups.length > 0 ? recentGroups.map((g) => {
            const groupMembers = recentParticipants.filter((p) => p.group_id === g.id || p.group_name === g.name);
            return /* @__PURE__ */ jsx(GroupCard, { num: g.id, count: g.fill_status, status: g.is_complete ? "Complete" : "In Progress", tone: g.is_complete ? "success" : "warning", members: groupMembers }, g.id);
          }) : /* @__PURE__ */ jsx("div", { className: "col-span-3 text-sm text-muted-foreground", children: "No recent groups to show." }) }),
          maxGroups > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-4", children: [
            groupsFormed,
            " of ",
            maxGroups,
            " groups complete.",
            remainingToFormGroup > 0 ? ` ${remainingToFormGroup} more participant${remainingToFormGroup === 1 ? "" : "s"} needed for the current group.` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(CardTitle, { icon: Users, color: "text-primary", bg: "bg-primary/10", children: "Recent Participants" }),
            /* @__PURE__ */ jsx("a", { className: "text-sm text-primary font-medium", children: "View All" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Ensure all the participants have joined and groups are complete" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 max-h-[280px] overflow-y-auto pr-2 divide-y divide-border/60 scrollbar-thin", children: recentParticipants.length > 0 ? recentParticipants.map((p) => {
            const safeName = p.name || "?";
            const initials = safeName.split(" ").map((s) => s[0] || "").slice(0, 2).join("").toUpperCase();
            const gradients = ["from-emerald-300 to-emerald-400", "from-rose-300 to-rose-400", "from-cyan-300 to-cyan-400", "from-indigo-300 to-indigo-400", "from-amber-300 to-amber-400", "from-slate-400 to-slate-500"];
            const bgGrad = gradients[safeName.length % 6];
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 py-3.5 text-sm shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: `grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white bg-gradient-to-br ${bgGrad} shadow-sm`, children: initials }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0 font-medium truncate", children: p.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground whitespace-nowrap", children: formatJoinedAt(p.joined_at) }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full bg-purple-50 border border-purple-100 text-primary text-xs px-3 py-1 font-semibold whitespace-nowrap shadow-sm", children: p.group_name ?? "—" })
            ] }, `${p.email}-${p.joined_at}`);
          }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "No recent participants." }) })
        ] })
      ] })
    ] }) }),
    rescheduleOpen && /* @__PURE__ */ jsx(RescheduleModal, { todayStr, maxDateStr: rescheduleMaxStr, newDate, setNewDate, newTime, setNewTime, currentScheduleDate, currentScheduleTime, onClose: () => {
      setRescheduleOpen(false);
      setNewDate("");
      setNewTime("");
    }, onConfirm: handleReschedule })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "font-semibold mt-0.5", children: value })
  ] });
}
function Card({
  children
}) {
  return /* @__PURE__ */ jsx("section", { className: "rounded-2xl bg-white p-6 shadow-card", children });
}
function CardTitle({
  icon: Icon,
  color,
  bg,
  children
}) {
  return /* @__PURE__ */ jsxs("h3", { className: "inline-flex items-center gap-2 text-lg font-bold", children: [
    /* @__PURE__ */ jsx("span", { className: `grid h-7 w-7 place-items-center rounded-lg ${bg} ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
    children
  ] });
}
function Stat({
  icon: Icon,
  label,
  value,
  total,
  pct
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 text-2xl font-bold", children: [
      value,
      " ",
      /* @__PURE__ */ jsxs("span", { className: "text-base text-muted-foreground font-medium", children: [
        "/ ",
        total
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-emerald-500", style: {
      width: `${pct}%`
    } }) })
  ] });
}
function Stat2({
  icon: Icon,
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 text-2xl font-bold", children: value }),
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: sub })
  ] });
}
function GroupCard({
  num,
  count,
  status,
  tone,
  members = []
}) {
  const gradients = ["from-emerald-300 to-emerald-400", "from-rose-300 to-rose-400", "from-cyan-300 to-cyan-400", "from-indigo-300 to-indigo-400", "from-amber-300 to-amber-400", "from-slate-400 to-slate-500"];
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/80 p-4 flex flex-col justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "font-bold text-foreground text-[15px]", children: [
        "Group ",
        num
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-0.5", children: count })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex -space-x-1.5", children: [
      members.slice(0, 5).map((m, i) => {
        const safeName = m.name || "?";
        const initials = safeName.split(" ").map((s) => s[0] || "").slice(0, 2).join("").toUpperCase();
        const bgGrad = gradients[safeName.length % 6];
        return /* @__PURE__ */ jsx("div", { style: {
          zIndex: 5 - i
        }, className: `relative h-7 w-7 rounded-full border-[1.5px] border-white bg-gradient-to-br ${bgGrad} grid place-items-center text-[9px] font-bold text-white shrink-0 shadow-sm`, children: initials }, i);
      }),
      members.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Waiting for participants..." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-5", children: tone === "success" ? /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full px-3 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-500 border border-emerald-200/60 shadow-sm", children: "Complete" }) : /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full px-3 py-1 text-[11px] font-bold bg-orange-50 text-orange-500 border border-orange-200/60 shadow-sm", children: "In Progress" }) })
  ] });
}
function RescheduleModal({
  todayStr,
  maxDateStr,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  currentScheduleDate,
  currentScheduleTime,
  onClose,
  onConfirm
}) {
  const isValid = newDate && newTime;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-border/60", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground", children: "Reschedule Event" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Select a new date and time for your event" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-full hover:bg-muted transition-colors text-muted-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-amber-500 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700 leading-relaxed", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "1 reschedule allowed." }),
          " This action cannot be undone. Make sure the new date and time are correct before confirming."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted/50 border border-border/40 px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-medium mb-2", children: "Current Schedule" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm font-semibold text-foreground", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-primary" }),
            " ",
            currentScheduleDate
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary" }),
            " ",
            currentScheduleTime
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "reschedule-date", className: "text-sm font-semibold text-foreground", children: "New Date" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Past dates are disabled. Rescheduling is only allowed within 5 days of your payment date." }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 relative", children: /* @__PURE__ */ jsx("input", { id: "reschedule-date", type: "date", min: todayStr, max: maxDateStr, value: newDate, onChange: (e) => setNewDate(e.target.value), className: "w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "reschedule-time", className: "text-sm font-semibold text-foreground", children: "New Start Time" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 relative", children: /* @__PURE__ */ jsx("input", { id: "reschedule-time", type: "time", value: newTime, onChange: (e) => setNewTime(e.target.value), className: "w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors" }) })
      ] }),
      isValid && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-primary/5 border border-primary/20 px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-primary mb-1.5", children: "New Schedule Preview" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm font-semibold text-foreground", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-primary" }),
            new Date(newDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary" }),
            (() => {
              const [h, m] = newTime.split(":");
              const hour = parseInt(h);
              return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
            })()
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/30", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors", children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { onClick: onConfirm, disabled: !isValid, className: `rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-200 ${isValid ? "bg-gradient-primary text-white shadow-glow hover:opacity-90 cursor-pointer" : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"}`, children: "Confirm Reschedule" })
    ] })
  ] }) });
}
export {
  DashboardPage as component
};
