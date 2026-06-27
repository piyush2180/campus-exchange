import { Flame, Calendar, Trophy } from "lucide-react";

interface WellnessStatsOverviewProps {
  currentStreak: number;
  longestStreak: number;
  weeklyComp: number;
  monthlyComp: number;
  milestone: {
    target: number;
    reward: number;
    daysLeft: number;
  };
}

export function WellnessStatsOverview({
  currentStreak,
  longestStreak,
  weeklyComp,
  monthlyComp,
  milestone,
}: WellnessStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StreakCard
        icon={<Flame className="h-4 w-4 text-[color:var(--brand)]" />}
        label="Active Streak"
        value={`${currentStreak} days`}
        sub={`Best record: ${longestStreak} days`}
      />
      <StreakCard
        icon={<Calendar className="h-4 w-4" />}
        label="Weekly Consistency"
        value={`${weeklyComp}%`}
        sub="Check-ins (past 7 days)"
        progress={weeklyComp}
      />
      <StreakCard
        icon={<Calendar className="h-4 w-4" />}
        label="Monthly Consistency"
        value={`${monthlyComp}%`}
        sub="Check-ins (past 30 days)"
        progress={monthlyComp}
      />
      <StreakCard
        icon={<Trophy className="h-4 w-4 text-amber-500" />}
        label="Next Milestone"
        value={`${milestone.target}-day streak`}
        sub={`${milestone.daysLeft} days left (+${milestone.reward} coins)`}
        progress={Math.round(((currentStreak % milestone.target) / milestone.target) * 100)}
      />
    </div>
  );
}

function StreakCard({
  icon,
  label,
  value,
  sub,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  progress?: number;
}) {
  return (
    <div className="surface-card flex flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">{icon}</span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-[color:var(--brand)] transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
