import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organizerService } from "@/api/services/organizer.service";
import type { OrganizerNotificationItem } from "@/api/types/organizer";
import { getSocket } from "@/lib/socket";

const DOT_CLASS: Record<string, string> = {
  emerald: "bg-emerald-500",
  primary: "bg-primary",
  orange: "bg-orange-500",
};

export function notificationDotClass(dotColor: string): string {
  return DOT_CLASS[dotColor] ?? DOT_CLASS.emerald;
}

type LivePayload = {
  notification: OrganizerNotificationItem;
  unread_count: number;
};

export function useOrganizerNotifications(bookingId: number | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["organizerNotifications", bookingId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => organizerService.getNotifications(bookingId as number, { limit: 8 }),
    enabled: !!bookingId,
    staleTime: 1000 * 15,
  });

  const [liveItems, setLiveItems] = useState<OrganizerNotificationItem[]>([]);
  const [liveUnread, setLiveUnread] = useState<number | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const socket = getSocket();

    const onLive = (payload: LivePayload) => {
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

  useEffect(() => {
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

  const markAllRead = useCallback(async () => {
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
    refetch: query.refetch,
  };
}
