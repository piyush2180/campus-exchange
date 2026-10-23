import { supabase } from "@/integrations/supabase/client";
import type { Bet } from "@/types";

export async function fetchUserBets(userId: string): Promise<Bet[]> {
  const { data } = await supabase
    .from("bets")
    .select("*")
    .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data as Bet[]) ?? [];
}

// place_bet() checks the balance, fixes the odds and start values, and debits the stake server-side
export async function placeBet(bet: {
  p_bet_type: "market" | "goal" | "duel";
  p_stake: number;
  p_asset_id?: string;
  p_direction?: "up" | "down";
  p_target_steps?: number;
  p_opponent_id?: string;
  p_resolves_at?: string;
}) {
  return await supabase.rpc("place_bet", bet);
}

// Settles every due bet the signed-in user is part of and pays winners; returns the settled bets
export async function resolveDueBets() {
  const { data, error } = await supabase.rpc("resolve_due_bets");
  return { data: (data as Bet[] | null) ?? [], error };
}
