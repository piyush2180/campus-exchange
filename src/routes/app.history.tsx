import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Activity, Coins, History, BarChart3, Inbox } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useWellness, parseLocalDate } from "@/hooks/useWellness";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WellnessStatsOverview } from "@/features/wellness/WellnessStatsOverview";
import { WellnessHistoryTable } from "@/features/wellness/WellnessHistoryTable";
import { WellnessChartsSection } from "@/features/wellness/WellnessChartsSection";
import { WellnessStatsDashboard } from "@/features/wellness/WellnessStatsDashboard";
import { PageAISummarizer } from "@/features/copilot/PageAISummarizer";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Wellness — Campus Exchange" },
      {
        name: "description",
        content:
          "Track your wellness goals, streaks, daily check-in histories, and health analytics charts.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { state } = useApp();
  const {
    logs,
    loading,
    currentStreak,
    longestStreak,
    weeklyComp,
    monthlyComp,
    getUpcomingMilestone,
  } = useWellness(state.user?.id ?? null);

  const [filter, setFilter] = useState<"7days" | "30days" | "all">("all");

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = parseLocalDate(dateStr);
    logDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - logDate.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const diff = getDaysDiff(log.date);
      if (filter === "7days") return diff < 7;
      if (filter === "30days") return diff < 30;
      return true;
    });
  }, [logs, filter]);

  // Chronological data for charts
  const chartData = useMemo(() => {
    return [...filteredLogs].reverse().map((l) => {
      const d = parseLocalDate(l.date);
      return {
        ...l,
        dateFormatted: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [filteredLogs]);

  // Statistics calculations
  const stats = useMemo(() => {
    if (logs.length === 0) return null;

    const totalLogs = logs.length;
    const avgScore = Math.round(logs.reduce((s, l) => s + l.activity_score, 0) / totalLogs);
    const avgSleep = +(logs.reduce((s, l) => s + l.sleep, 0) / totalLogs).toFixed(1);
    const avgWater = +(logs.reduce((s, l) => s + l.water, 0) / totalLogs).toFixed(1);
    const workoutPct = Math.round((logs.filter((l) => l.workout).length / totalLogs) * 100);
    const avgCoins = +(logs.reduce((s, l) => s + l.coins_earned, 0) / totalLogs).toFixed(2);
    const totalCoins = +logs.reduce((s, l) => s + l.coins_earned, 0).toFixed(2);
    const totalSteps = logs.reduce((s, l) => s + l.steps, 0);

    // Best / Worst Days
    let bestDay = logs[0];
    let worstDay = logs[0];

    for (const log of logs) {
      if (log.activity_score > bestDay.activity_score) bestDay = log;
      if (log.activity_score < worstDay.activity_score) worstDay = log;
    }

    return {
      avgScore,
      avgSleep,
      avgWater,
      workoutPct,
      avgCoins,
      totalCoins,
      totalSteps,
      bestDay: {
        score: bestDay.activity_score,
        date: parseLocalDate(bestDay.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
      worstDay: {
        score: worstDay.activity_score,
        date: parseLocalDate(worstDay.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    };
  }, [logs]);

  const milestone = getUpcomingMilestone();

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Wellness Journey
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Check-in logs &amp; analytics
          </h1>
          <PageAISummarizer pageName="Wellness" routePath="/app/history" />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Analyze your wellness score trends, stats benchmarks, and habits consistency.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <Coins className="h-4 w-4 text-[color:var(--brand)]" />
          <span className="font-semibold tabular-nums">
            {(state.profile?.coins ?? 0).toFixed(2)}
          </span>
          <span className="text-muted-foreground">coins</span>
        </div>
      </header>

      {logs.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">No check-ins logged yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You haven't submitted any wellness logs yet. Head to your dashboard to complete your
            daily check-in and start earning.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/app">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <>
          <WellnessStatsOverview
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            weeklyComp={weeklyComp}
            monthlyComp={monthlyComp}
            milestone={milestone}
          />

          <Tabs defaultValue="history" className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-3.5 w-3.5" />
                  Logs History
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-2">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics Charts
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  Stats Dashboard
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs text-muted-foreground mr-1">Filter:</span>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === "all"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setFilter("30days")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === "30days"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setFilter("7days")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === "7days"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  7 Days
                </button>
              </div>
            </div>

            <TabsContent value="history" className="mt-6 space-y-4">
              <WellnessHistoryTable logs={filteredLogs} />
            </TabsContent>

            <TabsContent value="charts" className="mt-6 space-y-6">
              <WellnessChartsSection chartData={chartData} />
            </TabsContent>

            <TabsContent value="stats" className="mt-6 space-y-6">
              {stats && <WellnessStatsDashboard stats={stats} totalLogs={logs.length} />}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
