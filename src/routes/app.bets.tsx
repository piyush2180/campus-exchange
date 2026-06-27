import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Coins, TrendingUp, Target, Swords, Flame } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useBets } from "@/hooks/useBets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MarketBetsTab } from "@/features/bets/MarketBetsTab";
import { GoalBetsTab } from "@/features/bets/GoalBetsTab";
import { DuelBetsTab } from "@/features/bets/DuelBetsTab";
import { ActiveBetsList } from "@/features/bets/ActiveBetsList";

export const Route = createFileRoute("/app/bets")({
  head: () => ({
    meta: [
      { title: "Bets — Campus Exchange" },
      {
        name: "description",
        content: "Predict the market, challenge friends, and bet on your daily step goals.",
      },
    ],
  }),
  component: BetsPage,
});

function BetsPage() {
  const { state, adjustCoins } = useApp();
  const { bets, placeMarketBet, placeGoalBet, placeDuelBet, resolveBet, refresh } = useBets(
    state.user?.id ?? null,
  );
  const resolvingBetsRef = useRef<Set<string>>(new Set());

  // Auto-resolve pending bets when their resolve time has passed
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      for (const bet of bets) {
        if (bet.status !== "pending") continue;
        if (new Date(bet.resolves_at).getTime() > now) continue;
        if (resolvingBetsRef.current.has(bet.id)) continue;

        resolvingBetsRef.current.add(bet.id);

        if (bet.bet_type === "market" && bet.asset_id && bet.start_price != null) {
          const asset = state.assets.find((a) => a.id === bet.asset_id);
          if (!asset) continue;
          const moved =
            bet.direction === "up" ? asset.price > bet.start_price : asset.price < bet.start_price;
          if (moved) await adjustCoins(bet.stake * bet.payout_multiplier);
          await resolveBet(bet.id, moved, asset.price);
          toast[moved ? "success" : "error"](
            moved
              ? `Won ${(bet.stake * bet.payout_multiplier).toFixed(2)} coins on ${asset.ticker}`
              : `Lost ${bet.stake.toFixed(2)} coins on ${asset.ticker}`,
          );
        } else if (bet.bet_type === "goal" && bet.target_value != null && state.profile) {
          const reached = state.profile.steps_today >= bet.target_value;
          if (reached) await adjustCoins(bet.stake * bet.payout_multiplier);
          await resolveBet(bet.id, reached);
          toast[reached ? "success" : "error"](
            reached
              ? `Won ${(bet.stake * bet.payout_multiplier).toFixed(2)} coins on step goal!`
              : `Step goal missed. Lost ${bet.stake.toFixed(2)} coins.`,
          );
        } else if (bet.bet_type === "duel" && bet.opponent_id && state.profile) {
          const { data: oppProf } = await supabase
            .from("profiles")
            .select("total_steps")
            .eq("id", bet.opponent_id)
            .maybeSingle();
          const oppSteps = oppProf?.total_steps ?? 0;
          const userWon = state.profile.total_steps >= oppSteps;
          if (userWon) await adjustCoins(bet.stake * bet.payout_multiplier);
          await resolveBet(bet.id, userWon);
          toast[userWon ? "success" : "error"](
            userWon
              ? `Won ${(bet.stake * bet.payout_multiplier).toFixed(2)} coins on step duel!`
              : `Step duel lost. Lost ${bet.stake.toFixed(2)} coins.`,
          );
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [bets, state.assets, state.profile, adjustCoins, resolveBet]);

  if (!state.profile) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-[color:var(--brand)]" />
            Bets
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Make every step count
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Wager your coins on market moves, daily step goals, or head-to-head step duels.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <Coins className="h-4 w-4 text-[color:var(--brand)]" />
          <span className="font-semibold tabular-nums">{state.profile.coins.toFixed(2)}</span>
          <span className="text-muted-foreground">coins</span>
        </div>
      </header>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="market" className="gap-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Market
          </TabsTrigger>
          <TabsTrigger value="goal" className="gap-2">
            <Target className="h-3.5 w-3.5" />
            Step goal
          </TabsTrigger>
          <TabsTrigger value="duel" className="gap-2">
            <Swords className="h-3.5 w-3.5" />
            Duel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="mt-6">
          <MarketBetsTab
            coins={state.profile.coins}
            assets={state.assets}
            onPlace={async (asset, dir, stake) => {
              const ok = await adjustCoins(-stake);
              if (!ok) {
                toast.error("Not enough coins");
                return;
              }
              const res = await placeMarketBet(asset, dir, stake);
              if (res.ok) {
                toast.success(`Bet placed on ${asset.ticker} ${dir.toUpperCase()}`, {
                  description: `Resolves in 60s · 1.8x payout`,
                });
              }
            }}
          />
        </TabsContent>

        <TabsContent value="goal" className="mt-6">
          <GoalBetsTab
            coins={state.profile.coins}
            stepsToday={state.profile.steps_today}
            onPlace={async (goal, stake) => {
              const ok = await adjustCoins(-stake);
              if (!ok) {
                toast.error("Not enough coins");
                return;
              }
              const res = await placeGoalBet(goal, stake, state.profile!.steps_today);
              if (res.ok) {
                toast.success(
                  `Bet ${stake} coins on hitting ${goal.toLocaleString()} steps today`,
                  {
                    description: "Win 2x — resolves at midnight",
                  },
                );
              }
            }}
          />
        </TabsContent>

        <TabsContent value="duel" className="mt-6">
          <DuelBetsTab
            coins={state.profile.coins}
            currentUserId={state.user?.id ?? ""}
            currentSteps={state.profile.steps_today}
            onPlace={async (opponentId, stake) => {
              const ok = await adjustCoins(-stake);
              if (!ok) {
                toast.error("Not enough coins");
                return;
              }
              const res = await placeDuelBet(opponentId, stake, state.profile!.steps_today);
              if (res.ok) {
                toast.success("Duel created", {
                  description: "Whoever logs more steps in 24h wins the pot.",
                });
              }
            }}
          />
        </TabsContent>
      </Tabs>

      <ActiveBetsList bets={bets} assets={state.assets} onRefresh={refresh} />
    </div>
  );
}
