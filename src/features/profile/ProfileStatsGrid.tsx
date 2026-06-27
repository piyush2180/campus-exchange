import { Footprints, Coins, Trophy } from "lucide-react";

interface ProfileStatsGridProps {
  totalSteps: number;
  coins: number;
  stepsToday: number;
}

export function ProfileStatsGrid({ totalSteps, coins, stepsToday }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile
        icon={<Footprints className="h-4 w-4" />}
        label="Total steps"
        value={totalSteps.toLocaleString()}
      />
      <StatTile icon={<Coins className="h-4 w-4" />} label="Coins" value={coins.toFixed(2)} />
      <StatTile
        icon={<Trophy className="h-4 w-4" />}
        label="Steps today"
        value={stepsToday.toLocaleString()}
      />
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
