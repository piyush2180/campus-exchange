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

export async function createMarketBet(bet: {
  user_id: string;
  bet_type: "market";
  asset_id: string;
  direction: "up" | "down";
  stake: number;
  payout_multiplier: number;
  start_price: number;
  resolves_at: string;
}) {
  return await supabase.from("bets").insert(bet).select().single();
}

export async function createGoalBet(bet: {
  user_id: string;
  bet_type: "goal";
  stake: number;
  payout_multiplier: number;
  target_value: number;
  start_steps: number;
  resolves_at: string;
}) {
  return await supabase.from("bets").insert(bet);
}

export async function createDuelBet(bet: {
  user_id: string;
  bet_type: "duel";
  stake: number;
  payout_multiplier: number;
  opponent_id: string;
  start_steps: number;
  resolves_at: string;
}) {
  return await supabase.from("bets").insert(bet);
}

export async function updateBetStatus(betId: string, status: "won" | "lost", endPrice?: number) {
  return await supabase
    .from("bets")
    .update({
      status,
      resolved_at: new Date().toISOString(),
      end_price: endPrice ?? null,
    })
    .eq("id", betId);
}
