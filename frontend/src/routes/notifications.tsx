import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react"; // useState for liveExtras
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { organizerService } from "@/api/services/organizer.service";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";
import {
  notificationDotClass,
  useOrganizerNotifications,
} from "@/hooks/useOrganizerNotifications";
import { formatRelativeTime } from "@/lib/format-datetime";
import { getSocket } from "@/lib/socket";
import type { OrganizerNotificationItem } from "@/api/types/organizer";

export const Route = createFileRoute("/notifications")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Notifications — Zoventro" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const { bookingId, organizer } = useOrganizerEventLive();
  const { markAllRead } = useOrganizerNotifications(bookingId);

  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/notifications" } });
    }
  }, [navigate]);

  const query = useQuery({
    queryKey: ["organizerNotificationsAll", bookingId],
    queryFn: () =>
      organizerService.getNotifications(bookingId as number, { limit: 100, offset: 0 }),
    enabled: !!bookingId,
  });

  const [liveExtras, setLiveExtras] = useState<OrganizerNotificationItem[]>([]);

  useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    const onLive = (payload: { notification: OrganizerNotificationItem }) => {
      setLiveExtras((prev) => {
        if (prev.some((n) => n.id === payload.notification.id)) return prev;
        if (query.data?.notifications.some((n) => n.id === payload.notification.id)) return prev;
        return [payload.notification, ...prev];
      });
    };
    socket.on("organizer_notification", onLive);
    return () => socket.off("organizer_notification", onLive);
  }, [bookingId, query.data?.notifications]);

  const items = [
    ...liveExtras.filter(
      (n) => !query.data?.notifications.some((existing) => existing.id === n.id)
    ),
    ...(query.data?.notifications ?? []),
  ];

  const total = query.data?.total ?? items.length;

  const handleLogout = () => {
    apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
    navigate({ to: "/login" });
  };

  return (
    <DashboardShell
      crumb="Dashboard / Notifications"
      userName={organizer?.name ?? "Organizer"}
      userEmail={organizer?.email ?? ""}
      onLogout={handleLogout}
    >
      <div className="rounded-2xl bg-white shadow-card border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">All Notifications</h1>
              <p className="text-xs text-muted-foreground">
                Live updates when participants join groups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => markAllRead()}
            className="text-sm text-primary font-medium hover:underline"
          >
            Mark all read
          </button>
        </div>

        {query.isLoading ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">Loading notifications…</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No notifications yet. When someone joins a group, you will see it here.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 px-6 py-4 ${!n.is_read ? "bg-primary/[0.03]" : ""}`}
              >
                <span className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${notificationDotClass(n.dot_color)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(n.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {total > 0 && (
          <p className="px-6 py-3 text-center text-xs text-muted-foreground border-t border-border/60">
            {total} notification{total === 1 ? "" : "s"} total
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
