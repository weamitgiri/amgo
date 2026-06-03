import { a6 as useRouter, U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { z as useQueryClient, L as Link } from "./router-DZhViOq_.js";
import { c as createLucideIcon, L as Logo } from "./Logo-COJrqD4D.js";
import { u as useQuery } from "./useQuery-CFSAAbqg.js";
import { o as organizerService } from "./organizer.service-C7lkqR-i.js";
import { g as getSocket } from "./socket-BGH0xJ8N.js";
import { U as Users } from "./users-DLcloTUO.js";
import { T as Trophy } from "./trophy-CKK5oUV7.js";
import { C as ChevronRight } from "./chevron-right-B_AJoG7h.js";
import { U as User } from "./user-C3Lc9pkP.js";
function useRouterState(opts) {
  const contextRouter = useRouter({ warn: opts?.router === void 0 });
  const router = opts?.router || contextRouter;
  {
    const state = router.stores.__store.get();
    return opts?.select ? opts.select(state) : state;
  }
}
const __iconNode$6 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$6);
const __iconNode$5 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$5);
const __iconNode$4 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
const LayoutGrid = createLucideIcon("layout-grid", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode);
function useOrganizerEventLive() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["organizerDashboard"],
    queryFn: () => organizerService.getDashboard(),
    staleTime: 1e3 * 60 * 5,
    retry: false
  });
  const bookingId = dashboardQuery.data?.bookings?.[0]?.booking_id;
  const statsQuery = useQuery({
    queryKey: ["organizerEventStats", bookingId],
    queryFn: () => organizerService.getEventStats(bookingId),
    enabled: !!bookingId,
    staleTime: 1e3 * 10,
    retry: false
  });
  reactExports.useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    socket.emit("join_organizer_dashboard", { bookingId });
    const onStatsUpdated = (stats) => {
      queryClient.setQueryData(["organizerEventStats", bookingId], stats);
    };
    socket.on("event_stats_updated", onStatsUpdated);
    return () => {
      socket.off("event_stats_updated", onStatsUpdated);
    };
  }, [bookingId, queryClient]);
  return {
    bookingId,
    booking: dashboardQuery.data?.bookings?.[0],
    organizer: dashboardQuery.data?.organizer,
    eventStats: statsQuery.data,
    isLoading: dashboardQuery.isLoading || statsQuery.isLoading,
    isError: dashboardQuery.isError || statsQuery.isError
  };
}
const DOT_CLASS = {
  emerald: "bg-emerald-500",
  primary: "bg-primary",
  orange: "bg-orange-500"
};
function notificationDotClass(dotColor) {
  return DOT_CLASS[dotColor] ?? DOT_CLASS.emerald;
}
function useOrganizerNotifications(bookingId) {
  const queryClient = useQueryClient();
  const queryKey = ["organizerNotifications", bookingId];
  const query = useQuery({
    queryKey,
    queryFn: () => organizerService.getNotifications(bookingId, { limit: 8 }),
    enabled: !!bookingId,
    staleTime: 1e3 * 15
  });
  const [liveItems, setLiveItems] = reactExports.useState([]);
  const [liveUnread, setLiveUnread] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    const onLive = (payload) => {
      setLiveItems((prev) => {
        const exists = prev.some((n) => n.id === payload.notification.id);
        if (exists) return prev;
        return [payload.notification, ...prev].slice(0, 8);
      });
      setLiveUnread(payload.unread_count);
      queryClient.invalidateQueries({ queryKey });
    };
    socket.on("organizer_notification", onLive);
    return () => {
      socket.off("organizer_notification", onLive);
    };
  }, [bookingId, queryClient, queryKey]);
  reactExports.useEffect(() => {
    if (query.data?.notifications) {
      setLiveItems([]);
      setLiveUnread(null);
    }
  }, [query.data?.notifications]);
  const apiItems = query.data?.notifications ?? [];
  const mergedIds = new Set(apiItems.map((n) => n.id));
  const extraLive = liveItems.filter((n) => !mergedIds.has(n.id));
  const preview = [...extraLive, ...apiItems].slice(0, 8);
  const unreadCount = liveUnread ?? query.data?.unread_count ?? 0;
  const markAllRead = reactExports.useCallback(async () => {
    if (!bookingId) return;
    await organizerService.markNotificationsRead(bookingId);
    setLiveUnread(0);
    await queryClient.invalidateQueries({ queryKey });
  }, [bookingId, queryClient, queryKey]);
  return {
    preview,
    unreadCount,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    markAllRead,
    refetch: query.refetch
  };
}
function formatJoinedAt(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const now = /* @__PURE__ */ new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (isToday) return `Joined ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Joined yesterday ${time}`;
  }
  return `Joined ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} ${time}`;
}
function formatRelativeTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.floor((Date.now() - d.getTime()) / 1e3);
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return formatTimeShort(value);
}
function formatTimeShort(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const now = /* @__PURE__ */ new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (isToday) return time;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${time}`;
  }
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
function OrganizerNotificationBell() {
  const { bookingId } = useOrganizerEventLive();
  const { preview, unreadCount, markAllRead, isLoading } = useOrganizerNotifications(bookingId);
  const [open, setOpen] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const handleMarkAllRead = async () => {
    await markAllRead();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        className: "grid h-9 w-9 place-items-center rounded-full hover:bg-muted relative transition-colors",
        "aria-label": "Notifications",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-12 z-40 w-80 rounded-2xl bg-white shadow-card border border-border overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarkAllRead,
            disabled: unreadCount === 0,
            className: "text-xs text-primary font-medium disabled:opacity-40",
            children: "Mark all read"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "max-h-80 overflow-y-auto", children: isLoading && preview.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-4 py-6 text-center text-sm text-muted-foreground", children: "Loading…" }) : preview.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-4 py-6 text-center text-sm text-muted-foreground", children: "No notifications yet. Join activity will appear here live." }) : preview.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: `flex items-start gap-3 px-4 py-3 hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-1.5 h-2 w-2 rounded-full shrink-0 ${notificationDotClass(n.dot_color)}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: n.message }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: formatRelativeTime(n.created_at) })
            ] })
          ]
        },
        n.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/notifications",
          onClick: () => setOpen(false),
          className: "block text-center text-xs text-primary font-medium py-2.5 border-t border-border/60 hover:bg-muted/30",
          children: "View all"
        }
      )
    ] })
  ] });
}
const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  { label: "Participants", to: "/participants", icon: Users },
  { label: "Groups", to: "/groups", icon: Layers },
  { label: "Results", to: "#", icon: Trophy }
];
function DashboardShell({ crumb, children, userName, userEmail, onLogout }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = reactExports.useState(false);
  const [userMenuOpen, setUserMenuOpen] = reactExports.useState(false);
  const userRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("zv:collapsed") : null;
    if (saved === "1") setCollapsed(true);
  }, []);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("zv:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  reactExports.useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const sideW = collapsed ? "w-[72px]" : "w-[220px]";
  const NavItem = ({ n, active }) => {
    const cls = `flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2" : "px-3"} py-2.5 text-sm font-medium transition-colors ${active ? "bg-gradient-primary text-white shadow-glow" : "text-foreground/70 hover:bg-muted"}`;
    const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "h-4 w-4 shrink-0" }),
      !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: n.label })
    ] });
    return n.to === "#" ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", title: collapsed ? n.label : void 0, className: cls, children: inner }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: n.to, title: collapsed ? n.label : void 0, className: cls, children: inner });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[oklch(0.965_0.012_290)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-10 pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1280px] gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        className: `${sideW} shrink-0 rounded-2xl bg-white shadow-card flex flex-col transition-[width] duration-200 overflow-hidden`,
        style: { minHeight: "calc(100vh - 60px)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${collapsed ? "px-3 py-5 flex justify-center" : "px-5 py-5"} border-b border-border/60`, children: collapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", className: "h-5 w-5 text-white", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 6h12L7 18h12", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1", children: NAV.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { n, active: path === n.to }, n.label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-border/60 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/profile",
                title: collapsed ? "Settings" : void 0,
                className: `flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-xl py-2.5 text-sm font-medium transition-colors ${path === "/profile" ? "bg-accent text-accent-foreground" : "text-foreground/70 hover:bg-muted"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 shrink-0" }),
                  !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Settings" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                id: "sidebar-collapse-btn",
                onClick: () => setCollapsed((c) => !c),
                title: collapsed ? "Expand sidebar" : "Collapse sidebar",
                className: `w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-xl py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted transition-colors`,
                children: collapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Collapse" })
                ] })
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 min-w-0 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: crumb.split("/").pop()?.trim() || "Dashboard" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizerNotificationBell, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: userRef, className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                id: "user-menu-btn",
                onClick: () => setUserMenuOpen((v) => !v),
                className: "flex items-center gap-2 rounded-2xl bg-muted/50 hover:bg-muted px-3 py-2 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight text-left hidden sm:block", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-foreground", children: userName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: userEmail })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}` })
                ]
              }
            ),
            userMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-14 z-40 w-52 rounded-2xl bg-white shadow-card border border-border overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: userName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: userEmail })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "p-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/dashboard",
                    onClick: () => setUserMenuOpen(false),
                    className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4 text-primary" }),
                      "Dashboard"
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/profile",
                    onClick: () => setUserMenuOpen(false),
                    className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-primary" }),
                      "Settings"
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 border-t border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setUserMenuOpen(false);
                    onLogout();
                  },
                  className: "w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 17 21 12 16 7" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" })
                    ] }),
                    "Logout"
                  ]
                }
              ) })
            ] })
          ] })
        ] })
      ] }),
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LockIcon, {}),
        " Secure. Reliable. Real-time ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/70", children: "Your event is safe with us." })
      ] })
    ] })
  ] }) }) });
}
function LockIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "11", width: "16", height: "10", rx: "2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 11V7a4 4 0 018 0v4" })
  ] });
}
export {
  Bell as B,
  DashboardShell as D,
  Layers as L,
  formatRelativeTime as a,
  formatTimeShort as b,
  useOrganizerNotifications as c,
  formatJoinedAt as f,
  notificationDotClass as n,
  useOrganizerEventLive as u
};
