import type { LeaderboardEntry } from "@/services/leaderboard.service";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  podiumCount: number;
  currentUserId?: string;
}

export function LeaderboardTable({ entries, podiumCount, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold">Full ranking</h2>
      </div>
      {entries.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-muted-foreground">
          No entries yet. Be the first — sync your steps!
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {entries.map((entry, i) => {
            const rank = i + podiumCount + 1;
            const isYou = entry.id === currentUserId;
            return (
              <li
                key={entry.id}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  isYou ? "bg-[color:var(--accent)]/40" : "hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-muted-foreground">
                    {rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {entry.display_name}
                      {isYou && (
                        <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(entry.coins).toFixed(0)} coins earned
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold tabular-nums">
                  {entry.total_steps.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-muted-foreground">steps</span>
                </p>
              </li>
            );
          })}
          {entries.length === 0 && podiumCount > 0 && (
            <li className="px-6 py-10 text-center text-xs text-muted-foreground">
              Only the top players so far. Keep walking to climb the ranks!
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
