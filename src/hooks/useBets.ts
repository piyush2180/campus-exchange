import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Asset } from "@/lib/store";

export type Bet = {
  id: string;
  user_id: string;
  bet_type: "market" | "duel" | "goal";
  asset_id: string | null;
  direction: "up" | "down" | null;
  stake: number;
  payout_multiplier: number;
  status: "pending" | "won" | "lost" | "cancelled";
  target_value: number | null;
  start_price: number | null;
  end_price: number | null;
  start_steps: number | null;
  opponent_id: string | null;
  resolves_at: string;
  resolved_at: string | null;
  created_at: string;
};

export function useBets(userId: string | null) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("bets")
      .select("*")
      .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setBets(data as Bet[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const placeMarketBet = useCallback(
    async (asset: Asset, direction: "up" | "down", stake: number) => {
      if (!userId) return { ok: false as const };
      const resolvesAt = new Date(Date.now() + 60_000).toISOString();
      const { data, error } = await supabase
        .from("bets")
        .insert({
          user_id: userId,
          bet_type: "market",
          asset_id: asset.id,
          direction,
          stake,
          payout_multiplier: 1.8,
          start_price: asset.price,
          resolves_at: resolvesAt,
        })
        .select()
        .single();
      if (error || !data) return { ok: false as const };
      await refresh();
      return { ok: true as const, bet: data as Bet };
    },
    [userId, refresh],
  );

  const placeGoalBet = useCallback(
    async (stepGoal: number, stake: number, currentSteps: number) => {
      if (!userId) return { ok: false as const };
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const { error } = await supabase.from("bets").insert({
        user_id: userId,
        bet_type: "goal",
        stake,
        payout_multiplier: 2.0,
        target_value: stepGoal,
        start_steps: currentSteps,
        resolves_at: endOfDay.toISOString(),
      });
      if (error) return { ok: false as const };
      await refresh();
      return { ok: true as const };
    },
    [userId, refresh],
  );

  const placeDuelBet = useCallback(
    async (opponentId: string, stake: number, currentSteps: number) => {
      if (!userId) return { ok: false as const };
      const resolvesAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("bets").insert({
        user_id: userId,
        bet_type: "duel",
        stake,
        payout_multiplier: 2.0,
        opponent_id: opponentId,
        start_steps: currentSteps,
        resolves_at: resolvesAt,
      });
      if (error) return { ok: false as const };
      await refresh();
      return { ok: true as const };
    },
    [userId, refresh],
  );

  const resolveBet = useCallback(
    async (betId: string, won: boolean, endPrice?: number) => {
      const { error } = await supabase
        .from("bets")
        .update({
          status: won ? "won" : "lost",
          resolved_at: new Date().toISOString(),
          end_price: endPrice ?? null,
        })
        .eq("id", betId);
      if (!error) await refresh();
    },
    [refresh],
  );

  return { bets, loading, refresh, placeMarketBet, placeGoalBet, placeDuelBet, resolveBet };
}
