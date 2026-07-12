import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { u as useOrganizerEventLive, a as useOrganizerNotifications, D as DashboardShell, n as notificationDotClass, b as formatRelativeTime } from "./DashboardShell-DnxArFqU.js";
import { i as isOrganizerAuthenticated, a as apiClient } from "./router-qdPwl0jo.js";
import { o as organizerService } from "./organizer.service-D9SFzC32.js";
import { g as getSocket } from "./socket-Bwou9MYK.js";
import "./Flogo-BFeWNg6Z.js";
import "sonner";
import "./config-qISbZfHI.js";
import "socket.io-client";
function NotificationsPage() {
  const navigate = useNavigate();
  const {
    bookingId,
    organizer
  } = useOrganizerEventLive();
  const {
    markAllRead
  } = useOrganizerNotifications(bookingId);
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/notifications"
        }
      });
    }
  }, [navigate]);
  const query = useQuery({
    queryKey: ["organizerNotificationsAll", bookingId],
    queryFn: () => organizerService.getNotifications(bookingId, {
      limit: 100,
      offset: 0
    }),
    enabled: !!bookingId
  });
  const [liveExtras, setLiveExtras] = useState([]);
  useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    const onLive = (payload) => {
      setLiveExtras((prev) => {
        if (prev.some((n) => n.id === payload.notification.id)) return prev;
        if (query.data?.notifications.some((n) => n.id === payload.notification.id)) return prev;
        return [payload.notification, ...prev];
      });
    };
    socket.on("organizer_notification", onLive);
    return () => socket.off("organizer_notification", onLive);
  }, [bookingId, query.data?.notifications]);
  const items = [...liveExtras.filter((n) => !query.data?.notifications.some((existing) => existing.id === n.id)), ...query.data?.notifications ?? []];
  const total = query.data?.total ?? items.length;
  const handleLogout = () => {
    apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsx(DashboardShell, { crumb: "Dashboard / Notifications", userName: organizer?.name ?? "Organizer", userEmail: organizer?.email ?? "", onLogout: handleLogout, children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-white shadow-card border border-border/60 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border/60", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold", children: "All Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Live updates when participants join groups" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => markAllRead(), className: "text-sm text-primary font-medium hover:underline", children: "Mark all read" })
    ] }),
    query.isLoading ? /* @__PURE__ */ jsx("p", { className: "px-6 py-12 text-center text-sm text-muted-foreground", children: "Loading notifications…" }) : items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "px-6 py-12 text-center text-sm text-muted-foreground", children: "No notifications yet. When someone joins a group, you will see it here." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border/60", children: items.map((n) => /* @__PURE__ */ jsxs("li", { className: `flex items-start gap-4 px-6 py-4 ${!n.is_read ? "bg-primary/[0.03]" : ""}`, children: [
      /* @__PURE__ */ jsx("span", { className: `mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${notificationDotClass(n.dot_color)}` }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: n.message }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatRelativeTime(n.created_at) })
      ] })
    ] }, n.id)) }),
    total > 0 && /* @__PURE__ */ jsxs("p", { className: "px-6 py-3 text-center text-xs text-muted-foreground border-t border-border/60", children: [
      total,
      " notification",
      total === 1 ? "" : "s",
      " total"
    ] })
  ] }) });
}
export {
  NotificationsPage as component
};
