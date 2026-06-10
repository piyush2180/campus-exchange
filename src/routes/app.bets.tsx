import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Target,
  Swords,
  Flame,
  Loader2,
  Trophy,
  Clock,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useBets, type Bet } from "@/hooks/useBets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/bets")({
  head: () => ({
    meta: [
      { title: "Bets — Campus Exchange" },
      { name: "description", content: "Predict the market, challenge friends, and bet on your daily step goals." },
    ],
  }),
  component: BetsPage,
});

function BetsPage() {
  const { state, adjustCoins } = useApp();
  const { bets, placeMarketBet, placeGoalBet, placeDuelBet, resolveBet, refresh } =
    useBets(state.user?.id ?? null);

  // Auto-resolve pending bets when their resolve time has passed
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      for (const bet of bets) {
        if (bet.status !== "pending") continue;
        if (new Date(bet.resolves_at).getTime() > now) continue;

        if (bet.bet_type === "market" && bet.asset_id && bet.start_price != null) {
          const asset = state.assets.find((a) => a.id === bet.asset_id);
          if (!asset) continue;
          const moved =
            bet.direction === "up"
              ? asset.price > bet.start_price
              : asset.price < bet.start_price;
          if (moved) await adjustCoins(bet.stake * bet.payout_multiplier);
          await resolveBet(bet.id, moved, asset.price);
          toast[moved ? "success" : "error"](
            moved
              ? `Won ${(bet.stake * bet.payout_multiplier).toFixed(2)} coins on ${asset.ticker}`
              : `Lost ${bet.stake.toFixed(2)} coins on ${asset.ticker}`,
          );
        } else if (
          bet.bet_type === "goal" &&
          bet.target_value != null &&
          bet.start_steps != null &&
          state.profile
        ) {
          const reached =
            state.profile.steps_today - bet.start_steps >= bet.target_value;
          if (reached) await adjustCoins(bet.stake * bet.payout_multiplier);
          await resolveBet(bet.id, reached);
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
          <MarketBets
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
          <GoalBets
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
                toast.success(`Bet ${stake} coins on hitting ${goal.toLocaleString()} steps today`, {
                  description: "Win 2x — resolves at midnight",
                });
              }
            }}
          />
        </TabsContent>

        <TabsContent value="duel" className="mt-6">
          <DuelBets
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

      <ActiveBets bets={bets} assets={state.assets} onRefresh={refresh} />
    </div>
  );
}

function MarketBets({
  coins,
  assets,
  onPlace,
}: {
  coins: number;
  assets: ReturnType<typeof useApp>["state"]["assets"];
  onPlace: (
    asset: ReturnType<typeof useApp>["state"]["assets"][number],
    dir: "up" | "down",
    stake: number,
  ) => void;
}) {
  const [stake, setStake] = useState("5");
  const stakeNum = Math.max(1, Number(stake) || 0);

  return (
    <div className="space-y-4">
      <div className="surface-card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Resolves in 60 seconds · 1.8× payout
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="stake" className="text-xs text-muted-foreground">
            Stake
          </Label>
          <Input
            id="stake"
            type="number"
            min={1}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-24 text-right tabular-nums"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((a) => (
          <div key={a.id} className="surface-card group flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-glow)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                  {a.ticker.slice(0, 3)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.ticker}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">{a.price.toFixed(2)}</p>
                <p
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    a.change >= 0 ? "text-[color:var(--success)]" : "text-destructive",
                  )}
                >
                  {a.change >= 0 ? "+" : ""}
                  {a.change.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-[color:var(--success)]/30 text-[color:var(--success)] hover:bg-[color:var(--success)]/10 hover:text-[color:var(--success)]"
                disabled={coins < stakeNum}
                onClick={() => onPlace(a, "up", stakeNum)}
              >
                <TrendingUp className="h-4 w-4" />
                UP
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={coins < stakeNum}
                onClick={() => onPlace(a, "down", stakeNum)}
              >
                <TrendingDown className="h-4 w-4" />
                DOWN
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalBets({
  coins,
  stepsToday,
  onPlace,
}: {
  coins: number;
  stepsToday: number;
  onPlace: (goal: number, stake: number) => void;
}) {
  const [goal, setGoal] = useState("10000");
  const [stake, setStake] = useState("10");
  const goalNum = Math.max(1000, Number(goal) || 0);
  const stakeNum = Math.max(1, Number(stake) || 0);
  const progress = Math.min(100, (stepsToday / goalNum) * 100);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="surface-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Target className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          Set today's goal
        </div>
        <h3 className="mt-2 text-2xl font-semibold">Bet on yourself</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Hit your step goal before midnight to double your stake.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal">Step goal</Label>
            <Input
              id="goal"
              type="number"
              min={1000}
              step={500}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-stake">Stake (coins)</Label>
            <Input
              id="goal-stake"
              type="number"
              min={1}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </div>

          <div className="rounded-xl bg-muted/60 p-4">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">Progress today</span>
              <span className="font-medium tabular-nums">
                {stepsToday.toLocaleString()} / {goalNum.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-[color:var(--brand)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={coins < stakeNum}
            onClick={() => onPlace(goalNum, stakeNum)}
          >
            Bet {stakeNum} coins · win {(stakeNum * 2).toFixed(0)}
          </Button>
        </div>
      </div>

      <div className="surface-card overflow-hidden p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          How it works
        </div>
        <h3 className="mt-2 text-2xl font-semibold">Daily commitment</h3>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-[color:var(--accent-foreground)]">
              1
            </span>
            Pick a step goal you can realistically hit today.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-[color:var(--accent-foreground)]">
              2
            </span>
            Stake coins. They're locked until midnight.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-[color:var(--accent-foreground)]">
              3
            </span>
            Hit the goal → 2× payout. Miss → forfeit your stake.
          </li>
        </ul>
      </div>
    </div>
  );
}

function DuelBets({
  coins,
  currentUserId,
  currentSteps,
  onPlace,
}: {
  coins: number;
  currentUserId: string;
  currentSteps: number;
  onPlace: (opponentId: string, stake: number) => void;
}) {
  const [opponents, setOpponents] = useState<{ id: string; display_name: string; total_steps: number }[]>([]);
  const [stake, setStake] = useState("20");
  const stakeNum = Math.max(1, Number(stake) || 0);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,display_name,total_steps")
      .neq("id", currentUserId)
      .order("total_steps", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setOpponents(data);
      });
  }, [currentUserId, currentSteps]);

  return (
    <div className="space-y-4">
      <div className="surface-card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Swords className="h-3.5 w-3.5" />
          24-hour step duel · 2× payout to the winner
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="duel-stake" className="text-xs text-muted-foreground">
            Stake
          </Label>
          <Input
            id="duel-stake"
            type="number"
            min={1}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-24 text-right tabular-nums"
          />
        </div>
      </div>

      {opponents.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
          <Swords className="h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No other players yet — invite a friend to challenge.
          </p>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <ul className="divide-y divide-border">
            {opponents.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.display_name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {p.total_steps.toLocaleString()} total steps
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={coins < stakeNum}
                  onClick={() => onPlace(p.id, stakeNum)}
                >
                  <Swords className="h-3.5 w-3.5" />
                  Challenge
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ActiveBets({
  bets,
  assets,
  onRefresh,
}: {
  bets: Bet[];
  assets: ReturnType<typeof useApp>["state"]["assets"];
  onRefresh: () => void;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const pending = useMemo(() => bets.filter((b) => b.status === "pending"), [bets]);
  const settled = useMemo(() => bets.filter((b) => b.status !== "pending").slice(0, 10), [bets]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Active bets</h2>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <Loader2 className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
        {pending.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No active bets — place one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {pending.map((b) => (
              <BetRow key={b.id} bet={b} assets={assets} />
            ))}
          </ul>
        )}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Recent results</h2>
        </div>
        {settled.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            History will appear here once your bets resolve.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {settled.map((b) => (
              <BetRow key={b.id} bet={b} assets={assets} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BetRow({
  bet,
  assets,
}: {
  bet: Bet;
  assets: ReturnType<typeof useApp>["state"]["assets"];
}) {
  const asset = bet.asset_id ? assets.find((a) => a.id === bet.asset_id) : null;
  const remainMs = new Date(bet.resolves_at).getTime() - Date.now();
  const remain =
    remainMs > 0
      ? remainMs > 60_000
        ? `${Math.round(remainMs / 60_000)}m`
        : `${Math.max(0, Math.round(remainMs / 1000))}s`
      : "resolving…";

  const label =
    bet.bet_type === "market"
      ? `${asset?.ticker ?? "—"} ${bet.direction?.toUpperCase()}`
      : bet.bet_type === "goal"
        ? `${bet.target_value?.toLocaleString()} steps`
        : "Step duel";

  const sub =
    bet.bet_type === "market"
      ? `Start ${bet.start_price?.toFixed(2)}${bet.end_price ? ` → ${bet.end_price.toFixed(2)}` : ""}`
      : bet.bet_type === "goal"
        ? `2× payout`
        : `24h winner takes ${(bet.stake * 2).toFixed(0)}`;

  const statusBadge =
    bet.status === "pending" ? (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {remain}
      </span>
    ) : bet.status === "won" ? (
      <span className="rounded-full bg-[color:var(--success)]/15 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--success)]">
        WON +{(bet.stake * bet.payout_multiplier).toFixed(2)}
      </span>
    ) : (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
        LOST −{bet.stake.toFixed(2)}
      </span>
    );

  return (
    <li className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm tabular-nums text-muted-foreground">
          {bet.stake.toFixed(2)} coins
        </span>
        {statusBadge}
      </div>
    </li>
  );
}
