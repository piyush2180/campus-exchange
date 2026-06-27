import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LeaderboardEntry } from "@/services/leaderboard.service";

interface TopLeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function TopLeaderboardWidget({ entries, currentUserId }: TopLeaderboardWidgetProps) {
  return (
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
        {entries.length === 0 && (
          <li className="px-6 py-6 text-center text-xs text-muted-foreground">
            No movers yet — log your steps!
          </li>
        )}
        {entries.map((entry, i) => {
          const isYou = entry.id === currentUserId;
          return (
            <li
              key={entry.id}
              className={`flex items-center justify-between px-6 py-3 ${
                isYou ? "bg-[color:var(--accent)]/40" : ""
              }`}
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
  );
}
