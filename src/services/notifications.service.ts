import { supabase } from "@/integrations/supabase/client";
import type { AppNotification } from "@/types";

export async function fetchNotifications(userId: string, limit = 20): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AppNotification[]) ?? [];
}

export async function markAllNotificationsRead(userId: string) {
  return await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}
