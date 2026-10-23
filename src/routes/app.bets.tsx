import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Coins, TrendingUp, Target, Swords, Flame } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useBets } from "@/hooks/useBets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MarketBetsTab } from "@/features/bets/MarketBetsTab";
import { GoalBetsTab } from "@/features/bets/GoalBetsTab";
import { DuelBetsTab } from "@/features/bets/DuelBetsTab";
import { ActiveBetsList } from "@/features/bets/ActiveBetsList";
import { PageAISummarizer } from "@/features/copilot/PageAISummarizer";

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
  const { state } = useApp();
  const userId = state.user?.id ?? null;
  const { bets, placeMarketBet, placeGoalBet, placeDuelBet, resolveDue, refresh } = useBets(userId);
  const resolvingRef = useRef(false);

  // When a pending bet is due, ask the server to settle it; payouts happen in resolve_due_bets()
  useEffect(() => {
    const interval = setInterval(async () => {
      if (resolvingRef.current) return;
      const now = Date.now();
      if (!bets.some((b) => b.status === "pending" && new Date(b.resolves_at).getTime() <= now))
        return;
      resolvingRef.current = true;
      try {
        for (const bet of await resolveDue()) {
          if (bet.user_id !== userId) continue;
          const won = bet.status === "won";
          const payout = (bet.stake * bet.payout_multiplier).toFixed(2);
          const ticker = state.assets.find((a) => a.id === bet.asset_id)?.ticker ?? "";
          const label =
            bet.bet_type === "market"
              ? ticker
              : bet.bet_type === "goal"
                ? "step goal"
                : "step duel";
          toast[won ? "success" : "error"](
            won
              ? `Won ${payout} coins on ${label}!`
              : `Lost ${bet.stake.toFixed(2)} coins on ${label}.`,
          );
        }
      } finally {
        resolvingRef.current = false;
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [bets, state.assets, userId, resolveDue]);

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
        <PageAISummarizer pageName="Bets" routePath="/app/bets" />
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
              const res = await placeMarketBet(asset, dir, stake);
              if (!res.ok) toast.error(res.reason);
              else {
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
              const res = await placeGoalBet(goal, stake);
              if (!res.ok) toast.error(res.reason);
              else {
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
              const res = await placeDuelBet(opponentId, stake);
              if (!res.ok) toast.error(res.reason);
              else {
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
