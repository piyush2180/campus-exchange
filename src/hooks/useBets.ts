import { useCallback, useEffect, useState } from "react";
import type { Asset, Bet } from "@/types";
import {
  fetchUserBets,
  createMarketBet,
  createGoalBet,
  createDuelBet,
  updateBetStatus,
} from "@/services/bets.service";

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

  const placeMarketBet = useCallback(
    async (asset: Asset, direction: "up" | "down", stake: number) => {
      if (!userId) return { ok: false as const };
      const resolvesAt = new Date(Date.now() + 60_000).toISOString();
      const { data, error } = await createMarketBet({
        user_id: userId,
        bet_type: "market",
        asset_id: asset.id,
        direction,
        stake,
        payout_multiplier: 1.8,
        start_price: asset.price,
        resolves_at: resolvesAt,
      });
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
      const { error } = await createGoalBet({
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
      const { error } = await createDuelBet({
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
      const { error } = await updateBetStatus(betId, won ? "won" : "lost", endPrice);
      if (!error) await refresh();
    },
    [refresh],
  );

  return { bets, loading, refresh, placeMarketBet, placeGoalBet, placeDuelBet, resolveBet };
}
