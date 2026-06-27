import { supabase } from "@/integrations/supabase/client";

export type LeaderboardEntry = {
  id: string;
  display_name: string;
  total_steps: number;
  coins: number;
};

/**
 * Fetch top N leaderboard entries ordered by total steps.
 */
export async function fetchTopLeaderboard(limit: number = 5): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, total_steps, coins")
    .order("total_steps", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top leaderboard:", error);
    return [];
  }

  return (data as LeaderboardEntry[]) ?? [];
}

/**
 * Fetch full leaderboard entries (up to 50).
 */
export async function fetchFullLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  return fetchTopLeaderboard(limit);
}
