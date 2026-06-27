import { supabase } from "@/integrations/supabase/client";
import type { WellnessLog } from "@/types";

export async function fetchWellnessLogs(userId: string): Promise<WellnessLog[]> {
  const { data, error } = await supabase
    .from("wellness_logs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return (data as WellnessLog[]).map((l) => ({
    ...l,
    date: l.date.split("T")[0],
  }));
}

export async function insertWellnessLog(log: {
  user_id: string;
  date: string;
  steps: number;
  sleep: number;
  water: number;
  workout: boolean;
  mood: number;
  journal: string | null;
  activity_score: number;
  coins_earned: number;
}) {
  return await supabase.from("wellness_logs").insert(log);
}

export async function updateWellnessLog(
  logId: string,
  updates: {
    steps: number;
    sleep: number;
    water: number;
    workout: boolean;
    mood: number;
    journal: string | null;
    activity_score: number;
    coins_earned: number;
    updated_at: string;
  },
) {
  return await supabase.from("wellness_logs").update(updates).eq("id", logId);
}
