import { Activity, BedDouble, Dumbbell, Coins, Footprints, FileText, Trophy } from "lucide-react";

interface WellnessStatsDashboardProps {
  stats: {
    avgScore: number;
    avgSleep: number;
    avgWater: number;
    workoutPct: number;
    avgCoins: number;
    totalCoins: number;
    totalSteps: number;
    bestDay: { score: number; date: string };
    worstDay: { score: number; date: string };
  };
  totalLogs: number;
}

export function WellnessStatsDashboard({ stats, totalLogs }: WellnessStatsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Grid of Averages */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Activity className="h-4 w-4" />}
          label="Avg Activity Score"
          value={`${stats.avgScore}`}
          desc="Target: 80+ for optimal coins"
        />
        <SummaryCard
          icon={<BedDouble className="h-4 w-4" />}
          label="Avg Sleep Duration"
          value={`${stats.avgSleep}h`}
          desc="Target: 7h - 9h sleep daily"
        />
        <SummaryCard
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workout Frequency"
          value={`${stats.workoutPct}%`}
          desc="Log completions rate"
        />
        <SummaryCard
          icon={<Coins className="h-4 w-4 text-[color:var(--brand)]" />}
          label="Avg Daily Coins"
          value={`${stats.avgCoins}`}
          desc="Value of daily logs"
        />
      </div>

      {/* Benchmark & Extrema metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="surface-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Lifetime Totals
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Footprints className="h-4 w-4 text-sky-500" />
                Total Steps Logged
              </span>
              <span className="font-semibold text-base tabular-nums">
                {stats.totalSteps.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Coins className="h-4 w-4 text-[color:var(--brand)]" />
                Total Wellness Coins Earned
              </span>
              <span className="font-semibold text-base tabular-nums">
                {stats.totalCoins.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" />
                Total Check-ins Logged
              </span>
              <span className="font-semibold text-base tabular-nums">{totalLogs} logs</span>
            </div>
          </div>
        </div>

        <div className="surface-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Record Milestones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Best Activity Day
              </span>
              <div className="text-right">
                <span className="font-semibold text-base block text-[color:var(--success)]">
                  Score: {stats.bestDay.score}
                </span>
                <span className="text-xs text-muted-foreground">{stats.bestDay.date}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-400" />
                Worst Activity Day
              </span>
              <div className="text-right">
                <span className="font-semibold text-base block text-destructive">
                  Score: {stats.worstDay.score}
                </span>
                <span className="text-xs text-muted-foreground">{stats.worstDay.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2.5 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground tracking-wide">{desc}</p>
    </div>
  );
}
