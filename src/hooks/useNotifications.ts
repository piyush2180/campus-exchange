import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppNotification } from "@/types";
import { fetchNotifications, markAllNotificationsRead } from "@/services/notifications.service";

const MAX_NOTIFICATIONS = 20;

/**
 * Dashboard notifications written by database triggers (trades, bet/duel status changes, check-ins)
 * and pushed live over Supabase Realtime.
 */
export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    fetchNotifications(userId, MAX_NOTIFICATIONS).then(setNotifications);

    const channel = supabase
      .channel(`notifications-${userId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) =>
          setNotifications((prev) =>
            [payload.new as AppNotification, ...prev].slice(0, MAX_NOTIFICATIONS),
          ),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await markAllNotificationsRead(userId);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return { notifications, unreadCount, markAllRead };
}
