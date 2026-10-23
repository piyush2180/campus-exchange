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

export type CheckInResult = {
  activity_score: number;
  streak: number;
  base_coins: number;
  streak_bonus: number;
  milestone_bonus: number;
  total_coins: number;
  coin_delta: number;
};

// submit_wellness_check_in() scores the day, works out the streak and credits coins server-side
export async function submitWellnessCheckIn(entry: {
  date: string;
  steps: number;
  sleep: number;
  water: number;
  workout: boolean;
  mood: number;
  journal: string | null;
}) {
  const { data, error } = await supabase.rpc("submit_wellness_check_in", {
    p_date: entry.date,
    p_steps: entry.steps,
    p_sleep: entry.sleep,
    p_water: entry.water,
    p_workout: entry.workout,
    p_mood: entry.mood,
    p_journal: entry.journal,
  });
  if (error) throw error;
  const r = data as Record<string, number>;
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Number(v)])) as CheckInResult;
}
