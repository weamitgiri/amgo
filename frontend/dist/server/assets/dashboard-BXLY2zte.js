import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { y as useNavigate, k as isOrganizerAuthenticated, e as apiClient } from "./router-DZhViOq_.js";
import { u as useOrganizerEventLive, D as DashboardShell, L as Layers, f as formatJoinedAt } from "./DashboardShell-C_BG6hYI.js";
import { o as organizerService } from "./organizer.service-C7lkqR-i.js";
import { b as toastSuccess, t as toastError } from "./toast-s3ZTemWF.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { r as resolveMediaUrl } from "./media-CzD2a1Kg.js";
import { L as Link2 } from "./link-2-BZgOq3sB.js";
import { C as Calendar } from "./calendar-DJ_Zwcf1.js";
import { C as Clock } from "./clock-L0m5LHMS.js";
import { S as ShieldCheck } from "./shield-check-B60WUByZ.js";
import { D as Download } from "./download-B3xPG40w.js";
import { C as CircleCheck } from "./circle-check-91pRJwXy.js";
import { U as Users } from "./users-DLcloTUO.js";
import { c as createLucideIcon } from "./Logo-COJrqD4D.js";
import { I as Info } from "./info-CIqRatZf.js";
import { X } from "./x-BXjaTuKN.js";
import { C as CircleAlert } from "./circle-alert-y5oGeqUj.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useQuery-CFSAAbqg.js";
import "./socket-BGH0xJ8N.js";
import "fs";
import "url";
import "./worker-entry-DAWxcb8x.js";
import "node:events";
import "http";
import "https";
import "./trophy-CKK5oUV7.js";
import "./chevron-right-B_AJoG7h.js";
import "./user-C3Lc9pkP.js";
import "./config-CafHMDrA.js";
const __iconNode$3 = [
  [
    "path",
    {
      d: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",
      key: "lc1i9w"
    }
  ],
  ["path", { d: "m7 16.5-4.74-2.85", key: "1o9zyk" }],
  ["path", { d: "m7 16.5 5-3", key: "va8pkn" }],
  ["path", { d: "M7 16.5v5.17", key: "jnp8gn" }],
  [
    "path",
    {
      d: "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",
      key: "8zsnat"
    }
  ],
  ["path", { d: "m17 16.5-5-3", key: "8arw3v" }],
  ["path", { d: "m17 16.5 4.74-2.85", key: "8rfmw" }],
  ["path", { d: "M17 16.5v5.17", key: "k6z78m" }],
  [
    "path",
    {
      d: "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",
      key: "1xygjf"
    }
  ],
  ["path", { d: "M12 8 7.26 5.15", key: "1vbdud" }],
  ["path", { d: "m12 8 4.74-2.85", key: "3rx089" }],
  ["path", { d: "M12 13.5V8", key: "1io7kd" }]
];
const Boxes = createLucideIcon("boxes", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
  ["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
  ["path", { d: "m6 12-1.9 2", key: "mnht97" }],
  ["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
  [
    "path",
    {
      d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
      key: "s0h3yz"
    }
  ]
];
const MousePointerClick = createLucideIcon("mouse-pointer-click", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserMinus = createLucideIcon("user-minus", __iconNode);
function DashboardPage() {
  const [rescheduleOpen, setRescheduleOpen] = reactExports.useState(false);
  const [newDate, setNewDate] = reactExports.useState("");
  const [newTime, setNewTime] = reactExports.useState("");
  const [rescheduled, setRescheduled] = reactExports.useState(false);
  const [copyStatus, setCopyStatus] = reactExports.useState("");
  const navigate = useNavigate();
  reactExports.useEffect(() => {
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
  const activityName = booking?.activity_name ?? "Mystery Quest";
  const packageName = booking?.package_name ?? "Standard Pack";
  const maxUsers = eventStats?.event_progress?.max_participants ?? booking?.max_users ?? 50;
  const maxGroups = eventStats?.event_progress?.max_groups ?? Math.ceil(maxUsers / 5);
  const participantsJoined = eventStats?.event_progress?.participants_joined ?? booking?.registered_participants ?? 0;
  const groupsFormed = eventStats?.event_progress?.groups_formed ?? 0;
  const remainingToFormGroup = eventStats?.event_progress?.remaining_to_form_group ?? 0;
  const linkClicks = eventStats?.event_progress?.access_link_clicks ?? null;
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
  const currentScheduleDate = scheduledDateTime ? scheduledDateTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : "—";
  const currentScheduleTime = scheduledDateTime ? scheduledDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
  const [now, setNow] = reactExports.useState(/* @__PURE__ */ new Date());
  reactExports.useEffect(() => {
    const timer = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(timer);
  }, []);
  const eventStartsMs = scheduledDateTime ? scheduledDateTime.getTime() - now.getTime() : null;
  const eventStartsMin = eventStartsMs !== null ? Math.ceil(eventStartsMs / 6e4) : 0;
  const eventStatusLabel = eventStartsMs === null ? "Schedule unavailable" : eventStartsMs <= 0 ? Math.abs(eventStartsMs) <= 6e4 ? "Starting now" : `Started ${Math.abs(eventStartsMin)} min ago` : eventStartsMs < 36e5 ? (() => {
    const minutes = Math.floor(eventStartsMs / 6e4);
    const seconds = Math.floor(eventStartsMs % 6e4 / 1e3);
    return `Starting in ${minutes}m ${seconds}s`;
  })() : eventStartsMs < 864e5 ? `Starting in ${Math.ceil(eventStartsMs / 36e5)} hr` : `Starting in ${Math.ceil(eventStartsMs / 864e5)} days`;
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
  const eventStatusText = scheduledDateTime ? `Your event is scheduled to begin at ${currentScheduleTime}, ${scheduledDayLabel}.` : "Schedule information is unavailable.";
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, { crumb: "Organizer Dashboard", userName: organizerName, userEmail: organizerEmail, onLogout: () => {
      apiClient.setToken(null);
      navigate({
        to: "/login",
        search: {
          redirect: "/dashboard"
        }
      });
    }, children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white p-8 shadow-card text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "Loading dashboard..." }) }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-8 shadow-card text-center text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "Unable to load dashboard data." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please login again or contact support." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Event Overview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage your event, track participation, and prepare for the scheduled start." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PillIcon, { icon: Link2, label: "Copy Link", onClick: async () => {
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
            } }),
            copyStatus && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-600", children: copyStatus })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-5 lg:grid-cols-[260px_1fr_260px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[180px] w-full overflow-hidden rounded-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: bookingImage, alt: activityName, className: "h-full w-full object-cover" }),
            bookingIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-4 rounded-3xl border border-white/80 bg-white/90 p-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: bookingIcon, alt: `${activityName} icon`, className: "h-10 w-10 rounded-xl object-cover" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: activityName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking?.booking_status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted/30 text-foreground/70"}`, children: booking?.booking_status ? booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1) : "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Booking ID: ",
                booking?.booking_id ?? "—"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-md", children: "A story-driven team challenge where employees collaborate, question, and compete to solve the case." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-3 gap-4 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Package", value: packageName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Team Size", value: `Up to ${maxUsers} Participants` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Groups", value: `${maxGroups} Groups` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-4 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Package Price", value: booking?.package_price ? `₹ ${booking.package_price}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Registered", value: `${eventStats?.event_progress.participants_joined ?? participantsJoined}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Access Link", value: booking?.invitation_link ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "text-primary", href: `${window.location.origin}/join/${booking.invitation_link}`, children: "open" }) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-4 gap-4 border-t border-border/60 pt-4 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconField, { icon: Calendar, label: "Date", value: currentScheduleDate, extra: "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconField, { icon: Clock, label: "Start Time", value: currentScheduleTime, extra: "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconField, { icon: ShieldCheck, label: "Access Validity", value: "5 Days", extra: "from activation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconField, { icon: Download, label: "GST Invoice", value: booking?.booking_id ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
                to: `/payments`,
                search: {
                  booking: String(booking.booking_id)
                }
              }), className: "text-primary", children: "download" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted", children: "—" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-purple-50/60 border border-purple-100 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Reschedule" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "• 1 time allowed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "You can reschedule your event once before starting the game." }),
            booking?.is_rescheduled || rescheduled ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 shrink-0" }),
              " Rescheduled successfully"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRescheduleOpen(true), className: "mt-3 w-full rounded-full bg-gradient-primary text-white text-sm font-semibold py-2.5 shadow-glow hover:opacity-90 transition-opacity", children: "Reschedule Event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-xs text-muted-foreground", children: "Current Schedule" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-3 text-sm font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 text-primary" }),
                " ",
                currentScheduleDate
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 text-primary" }),
                " ",
                currentScheduleTime
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-xs text-muted-foreground", children: "Reschedule until" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: rescheduleUntilLabel })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { icon: Layers, color: "text-primary", bg: "bg-primary/10", children: "Event Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6 mt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Participants Joined", value: `${participantsJoined}`, total: `${maxUsers}`, pct: Math.min(100, Math.round(participantsJoined / maxUsers * 100)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Boxes, label: "Groups Formed", value: `${groupsFormed}`, total: `${maxGroups}`, pct: maxGroups > 0 ? Math.min(100, Math.round(groupsFormed / maxGroups * 100)) : 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6 mt-6 border-t border-border/60 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat2, { icon: UserMinus, label: "Remaining to form group", value: `${remainingToFormGroup}`, sub: remainingToFormGroup === 1 ? "1 more participant needed" : `${remainingToFormGroup} more participants needed` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat2, { icon: MousePointerClick, label: "Access Link Clicks", value: linkClicks !== null ? String(linkClicks) : "0", sub: "Updates live when invite link is opened" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Event Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Ensure all the participants have joined and groups are complete." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "mt-4 w-full rounded-full bg-gradient-primary text-white py-3 font-semibold inline-flex items-center justify-center gap-2 shadow-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
            " ",
            eventStatusLabel
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start gap-2 rounded-xl bg-purple-50 px-4 py-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-primary mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: eventStatusText })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
              "Minimum 5 players per group required."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
              "Join within 15 minutes of the start time."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
              "Teams form automatically, late joiners may miss participation."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { icon: Layers, color: "text-primary", bg: "bg-primary/10", children: "Recent Groups" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "text-sm text-primary font-medium", children: "View All Groups" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-3 gap-3", children: eventStats?.recent_groups && eventStats.recent_groups.length > 0 ? eventStats.recent_groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCard, { num: g.id, count: g.fill_status, status: g.is_complete ? "Complete" : "In Progress", tone: g.is_complete ? "success" : "warning" }, g.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 text-sm text-muted-foreground", children: "No recent groups to show." }) }),
          maxGroups > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-4", children: [
            groupsFormed,
            " of ",
            maxGroups,
            " groups complete.",
            remainingToFormGroup > 0 ? ` ${remainingToFormGroup} more participant${remainingToFormGroup === 1 ? "" : "s"} needed for the current group.` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { icon: Users, color: "text-primary", bg: "bg-primary/10", children: "Recent Participants" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "text-sm text-primary font-medium", children: "View All" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Ensure all the participants have joined and groups are complete" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 max-h-[280px] overflow-y-auto pr-1 space-y-3 scrollbar-thin", children: eventStats?.recent_participants && eventStats.recent_participants.length > 0 ? eventStats.recent_participants.map((p) => {
            const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold bg-muted/30", children: initials }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0 font-medium truncate", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground whitespace-nowrap", children: formatJoinedAt(p.joined_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-purple-100 text-primary text-xs px-2.5 py-0.5 font-medium whitespace-nowrap", children: p.group_name ?? "—" })
            ] }, p.email);
          }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No recent participants." }) })
        ] })
      ] })
    ] }) }),
    rescheduleOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(RescheduleModal, { todayStr, newDate, setNewDate, newTime, setNewTime, currentScheduleDate, currentScheduleTime, onClose: () => {
      setRescheduleOpen(false);
      setNewDate("");
      setNewTime("");
    }, onConfirm: handleReschedule })
  ] });
}
function PillIcon({
  icon: Icon,
  label,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
    " ",
    label
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mt-0.5", children: value })
  ] });
}
function IconField({
  icon: Icon,
  label,
  value,
  extra
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 place-items-center rounded-md bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }) }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mt-1", children: [
      value,
      " ",
      extra && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: extra })
    ] })
  ] });
}
function Card({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl bg-white p-6 shadow-card", children });
}
function CardTitle({
  icon: Icon,
  color,
  bg,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "inline-flex items-center gap-2 text-lg font-bold", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-7 w-7 place-items-center rounded-lg ${bg} ${color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-2xl font-bold", children: [
      value,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base text-muted-foreground font-medium", children: [
        "/ ",
        total
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-emerald-500", style: {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-bold", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: sub })
  ] });
}
function GroupCard({
  num,
  count,
  status,
  tone
}) {
  const toneCls = tone === "success" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
      "Group ",
      num
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: count }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex -space-x-1.5", children: ["bg-amber-200", "bg-purple-200", "bg-pink-200", "bg-orange-200", "bg-emerald-200"].map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-6 w-6 rounded-full border-2 border-white ${c}` }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${toneCls}`, children: status })
  ] });
}
function RescheduleModal({
  todayStr,
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground", children: "Reschedule Event" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Select a new date and time for your event" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-full hover:bg-muted transition-colors text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-amber-500 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "1 reschedule allowed." }),
          " This action cannot be undone. Make sure the new date and time are correct before confirming."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 border border-border/40 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-2", children: "Current Schedule" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm font-semibold text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-primary" }),
            " ",
            currentScheduleDate
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
            " ",
            currentScheduleTime
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "reschedule-date", className: "text-sm font-semibold text-foreground", children: "New Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Past dates are disabled and cannot be selected." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "reschedule-date", type: "date", min: todayStr, value: newDate, onChange: (e) => setNewDate(e.target.value), className: "w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "reschedule-time", className: "text-sm font-semibold text-foreground", children: "New Start Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "reschedule-time", type: "time", value: newTime, onChange: (e) => setNewTime(e.target.value), className: "w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors" }) })
      ] }),
      isValid && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/5 border border-primary/20 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary mb-1.5", children: "New Schedule Preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm font-semibold text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-primary" }),
            new Date(newDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
            (() => {
              const [h, m] = newTime.split(":");
              const hour = parseInt(h);
              return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
            })()
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onConfirm, disabled: !isValid, className: `rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-200 ${isValid ? "bg-gradient-primary text-white shadow-glow hover:opacity-90 cursor-pointer" : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"}`, children: "Confirm Reschedule" })
    ] })
  ] }) });
}
export {
  DashboardPage as component
};
