import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, TrendingUp, ArrowRight, Activity, Flame } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useWellness, getLocalTodayString } from "@/hooks/useWellness";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { DashboardStatCard } from "@/features/dashboard/DashboardStatCard";
import { WellnessCheckInCard } from "@/features/dashboard/WellnessCheckInCard";
import { TopLeaderboardWidget } from "@/features/dashboard/TopLeaderboardWidget";
import { AIInsightsWidget } from "@/features/copilot/AIInsightsWidget";
import { PageAISummarizer } from "@/features/copilot/PageAISummarizer";
import { fetchTopLeaderboard, type LeaderboardEntry } from "@/services/leaderboard.service";
import { wellnessCheckInSchema } from "@/schemas";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Campus Exchange" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { state, refresh: refreshApp } = useApp();
  const profile = state.profile;
  const [topLb, setTopLb] = useState<LeaderboardEntry[]>([]);

  // Form State
  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [workout, setWorkout] = useState(false);
  const [mood, setMood] = useState(3);
  const [journal, setJournal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { logs, currentStreak, submitCheckIn, updateCheckIn } = useWellness(
    state.user?.id ?? null,
    () => {
      refreshApp();
    },
  );

  const {
    totalValue: portfolioValue,
    totalPnl: pnl,
    totalPct: pnlPct,
  } = usePortfolio(state.holdings, state.assets);

  const todayStr = getLocalTodayString();
  const todayLog = logs.find((l) => l.date === todayStr);

  const handleStartEdit = () => {
    if (!todayLog) return;
    setSteps(String(todayLog.steps));
    setSleep(String(todayLog.sleep));
    setWater(String(todayLog.water));
    setWorkout(todayLog.workout);
    setMood(todayLog.mood);
    setJournal(todayLog.journal || "");
    setIsEditing(true);
  };

  useEffect(() => {
    fetchTopLeaderboard(5).then(setTopLb);
  }, [profile?.total_steps]);

  if (!profile) return null;

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const stepsNum = parseInt(steps, 10);
    const sleepNum = parseFloat(sleep);
    const waterNum = parseFloat(water);

    const validation = wellnessCheckInSchema.safeParse({
      steps: stepsNum,
      sleep: sleepNum,
      water: waterNum,
      workout,
      mood,
      journal,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid input data";
      toast.error(firstError);
      return;
    }

    setSubmitting(true);
    let res;
    if (isEditing && todayLog) {
      res = await updateCheckIn(todayLog.id, stepsNum, sleepNum, waterNum, workout, mood, journal);
    } else {
      res = await submitCheckIn(stepsNum, sleepNum, waterNum, workout, mood, journal);
    }
    setSubmitting(false);

    if (res.ok) {
      setIsEditing(false);
      toast.success(
        isEditing ? "Today's check-in updated!" : "Wellness check-in submitted successfully!",
        {
          description: `Score: ${res.activityScore!} · Coins awarded: +${res.coinsEarned!.toFixed(2)}`,
        },
      );
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      toast.error(res.error || "Failed to submit check-in");
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
        <PageAISummarizer pageName="Dashboard" routePath="/app" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          icon={<Activity className="h-4 w-4" />}
          label="Activity score"
          value={todayLog ? `${todayLog.activity_score}` : "N/A"}
          sub={
            todayLog
              ? `Coins earned today: +${todayLog.coins_earned.toFixed(2)}`
              : "Complete check-in first"
          }
          progress={todayLog ? todayLog.activity_score : 0}
        />
        <DashboardStatCard
          icon={<Flame className="h-4 w-4 text-[color:var(--brand)]" />}
          label="Current streak"
          value={`${currentStreak} days`}
          sub={todayLog ? "Today's check-in logged" : "Logging pending for today"}
        />
        <DashboardStatCard
          icon={<Coins className="h-4 w-4" />}
          label="Wallet balance"
          value={profile.coins.toFixed(2)}
          sub="coins available to invest"
          accent
        />
        <DashboardStatCard
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

      <WellnessCheckInCard
        todayLog={todayLog}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleStartEdit={handleStartEdit}
        currentStreak={currentStreak}
        steps={steps}
        setSteps={setSteps}
        sleep={sleep}
        setSleep={setSleep}
        water={water}
        setWater={setWater}
        workout={workout}
        setWorkout={setWorkout}
        mood={mood}
        setMood={setMood}
        journal={journal}
        setJournal={setJournal}
        submitting={submitting}
        handleCheckInSubmit={handleCheckInSubmit}
      />

      <AIInsightsWidget />

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
                    className={`text-xs font-medium ${
                      a.change >= 0 ? "text-[color:var(--success)]" : "text-destructive"
                    }`}
                  >
                    {a.change >= 0 ? "+" : ""}
                    {a.change.toFixed(2)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <TopLeaderboardWidget entries={topLb} currentUserId={state.user?.id} />
      </div>
    </div>
  );
}
