import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Asset, Bet } from "@/types";
import { fetchUserBets, placeBet, resolveDueBets } from "@/services/bets.service";

export type { Bet };

export function useBets(userId: string | null) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await fetchUserBets(userId);
    setBets(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: bets you placed or duels you were challenged to update live (e.g. settled in another tab)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`bets-${userId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets", filter: `user_id=eq.${userId}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets", filter: `opponent_id=eq.${userId}` },
        refresh,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const place = useCallback(
    async (bet: Parameters<typeof placeBet>[0]) => {
      if (!userId) return { ok: false as const, reason: "Not signed in" };
      const { data, error } = await placeBet(bet);
      if (error || !data) return { ok: false as const, reason: error?.message ?? "Bet failed" };
      await refresh();
      return { ok: true as const, bet: data as Bet };
    },
    [userId, refresh],
  );

  const placeMarketBet = useCallback(
    (asset: Asset, direction: "up" | "down", stake: number) =>
      place({ p_bet_type: "market", p_stake: stake, p_asset_id: asset.id, p_direction: direction }),
    [place],
  );

  const placeGoalBet = useCallback(
    (stepGoal: number, stake: number) => {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      return place({
        p_bet_type: "goal",
        p_stake: stake,
        p_target_steps: stepGoal,
        p_resolves_at: endOfDay.toISOString(),
      });
    },
    [place],
  );

  const placeDuelBet = useCallback(
    (opponentId: string, stake: number) =>
      place({ p_bet_type: "duel", p_stake: stake, p_opponent_id: opponentId }),
    [place],
  );

  const resolveDue = useCallback(async () => {
    const { data } = await resolveDueBets();
    if (data.length) await refresh();
    return data;
  }, [refresh]);

  return { bets, loading, refresh, placeMarketBet, placeGoalBet, placeDuelBet, resolveDue };
}
