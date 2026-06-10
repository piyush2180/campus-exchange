import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Footprints,
  Coins,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Trophy,
  Activity,
  Play,
  Square,
  Info,
  Flame,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { usePedometer } from "@/hooks/usePedometer";
import { Button } from "@/components/ui/button";
import { STEPS_PER_COIN } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Campus Exchange" }] }),
  component: Dashboard,
});

type LbRow = { display_name: string; total_steps: number; coins: number; id: string };

function Dashboard() {
  const { state, syncSteps, addLiveSteps } = useApp();
  const profile = state.profile;
  const [topLb, setTopLb] = useState<LbRow[]>([]);
  const [pendingSteps, setPendingSteps] = useState(0);

  // Live pedometer — credits steps in batches of 10 to avoid hammering DB
  const pedometer = usePedometer((total) => {
    setPendingSteps(total);
  });

  useEffect(() => {
    if (pendingSteps >= 10) {
      const toCredit = pendingSteps;
      setPendingSteps(0);
      pedometer.reset();
      addLiveSteps(toCredit);
    }
  }, [pendingSteps, addLiveSteps, pedometer]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,display_name,total_steps,coins")
      .order("total_steps", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setTopLb(data as LbRow[]);
      });
  }, [profile?.total_steps]);

  if (!profile) return null;

  const portfolioValue = state.holdings.reduce((sum, h) => {
    const a = state.assets.find((x) => x.id === h.assetId);
    return sum + (a ? a.price * h.shares : 0);
  }, 0);
  const portfolioCost = state.holdings.reduce((s, h) => s + h.avgPrice * h.shares, 0);
  const pnl = portfolioValue - portfolioCost;
  const pnlPct = portfolioCost > 0 ? (pnl / portfolioCost) * 100 : 0;

  const stepsToNextCoin = STEPS_PER_COIN - (profile.steps_today % STEPS_PER_COIN);
  const progress = ((profile.steps_today % STEPS_PER_COIN) / STEPS_PER_COIN) * 100;

  const handleStartLive = async () => {
    const ok = await pedometer.start();
    if (!ok) {
      if (pedometer.status === "denied") {
        toast.error("Motion permission denied", {
          description: "Enable motion access in your browser to track live steps.",
        });
      } else if (pedometer.status === "unsupported") {
        toast.error("Pedometer not supported", {
          description: "Try opening this on your phone — desktop browsers can't read motion.",
        });
      }
    } else {
      toast.success("Live tracking on", {
        description: "Walk with your phone. Steps credit every 10 detected.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {state.user?.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Your daily summary
          </h1>
        </div>
        <Button onClick={syncSteps} variant="outline">
          <RefreshCw className="h-4 w-4" />
          Simulate sync
        </Button>
      </div>

      {/* Live pedometer card */}
      <div className="surface-card hero-bg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Live pedometer</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    pedometer.status === "running"
                      ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pedometer.status === "running" ? "TRACKING" : "OFFLINE"}
                </span>
              </div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Counts steps from your phone's motion sensor while this tab is open.
                Background tracking isn't possible in a browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Detected</p>
              <p className="text-2xl font-semibold tabular-nums">{pedometer.steps}</p>
            </div>
            {pedometer.status === "running" ? (
              <Button variant="outline" onClick={pedometer.stop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button onClick={handleStartLive}>
                <Play className="h-4 w-4" />
                Start tracking
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-2.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Tip: open Campus Exchange on your phone, hit Start, and pop it in your pocket while you walk.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={<Footprints className="h-4 w-4" />}
          label="Steps today"
          value={profile.steps_today.toLocaleString()}
          sub={
            profile.steps_today > 0
              ? `${stepsToNextCoin} steps to next coin`
              : "Walk or simulate to add steps"
          }
          progress={profile.steps_today > 0 ? progress : 0}
        />
        <StatCard
          icon={<Coins className="h-4 w-4" />}
          label="Wallet balance"
          value={profile.coins.toFixed(2)}
          sub="coins available to invest"
          accent
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Portfolio value"
          value={portfolioValue.toFixed(2)}
          sub={
            state.holdings.length > 0
              ? `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} (${pnlPct.toFixed(1)}%)`
              : "No holdings yet"
          }
          subPositive={pnl >= 0 && state.holdings.length > 0}
          subNegative={pnl < 0 && state.holdings.length > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-base font-semibold">Market</h2>
              <p className="text-xs text-muted-foreground">Live simulated prices</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/market">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {state.assets.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                    {a.ticker.slice(0, 3)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{a.price.toFixed(2)}</p>
                  <p
                    className={`text-xs font-medium ${a.change >= 0 ? "text-[color:var(--success)]" : "text-destructive"}`}
                  >
                    {a.change >= 0 ? "+" : ""}
                    {a.change.toFixed(2)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border bg-muted/30 px-6 py-3">
            <Link
              to="/app/bets"
              className="flex items-center justify-between text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-[color:var(--brand)]" />
                Feeling lucky? Bet on the next 60s of any asset
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[color:var(--brand)]" />
              <h2 className="text-base font-semibold">Leaderboard</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/leaderboard">All</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {topLb.length === 0 && (
              <li className="px-6 py-6 text-center text-xs text-muted-foreground">
                No movers yet — sync your steps!
              </li>
            )}
            {topLb.map((entry, i) => {
              const isYou = entry.id === state.user?.id;
              return (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between px-6 py-3 ${isYou ? "bg-[color:var(--accent)]/40" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    <span className="text-sm font-medium">{entry.display_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {entry.total_steps.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  progress,
  accent,
  subPositive,
  subNegative,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  accent?: boolean;
  subPositive?: boolean;
  subNegative?: boolean;
}) {
  return (
    <div
      className={`surface-card relative overflow-hidden p-6 transition-shadow hover:shadow-[var(--shadow-card)] ${accent ? "bg-foreground text-background" : ""}`}
    >
      <div
        className={`flex items-center gap-2 text-xs ${accent ? "text-background/70" : "text-muted-foreground"}`}
      >
        {icon}
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub && (
        <p
          className={`mt-1 text-xs ${
            subPositive
              ? "text-[color:var(--success)] font-medium"
              : subNegative
                ? "text-destructive font-medium"
                : accent
                  ? "text-background/70"
                  : "text-muted-foreground"
          }`}
        >
          {sub}
        </p>
      )}
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[color:var(--brand)] transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}
