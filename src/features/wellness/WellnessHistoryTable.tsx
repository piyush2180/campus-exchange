import { parseLocalDate } from "@/hooks/useWellness";
import type { WellnessLog } from "@/types";

interface WellnessHistoryTableProps {
  logs: WellnessLog[];
}

export function WellnessHistoryTable({ logs }: WellnessHistoryTableProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-right">Coins Earned</th>
              <th className="px-6 py-4">Workout</th>
              <th className="px-6 py-4">Mood</th>
              <th className="px-6 py-4">Steps / Sleep / Water</th>
              <th className="px-6 py-4">Journal Entry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No logs found for this filter range.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const dateObj = parseLocalDate(log.date);
                const dateFormatted = dateObj.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={log.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                      {dateFormatted}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${
                          log.activity_score >= 80
                            ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                            : log.activity_score >= 50
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {log.activity_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-foreground">
                      +{log.coins_earned.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.workout ? (
                        <span className="rounded-full bg-[color:var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[color:var(--success)]">
                          Yes ✅
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg">
                      {log.mood === 1 && "😢"}
                      {log.mood === 2 && "😐"}
                      {log.mood === 3 && "🙂"}
                      {log.mood === 4 && "😄"}
                      {log.mood === 5 && "🤩"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      <div className="flex gap-3">
                        <span>👣 {log.steps.toLocaleString()}</span>
                        <span>💤 {log.sleep}h</span>
                        <span>💧 {log.water}L</span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-muted-foreground max-w-xs truncate"
                      title={log.journal || ""}
                    >
                      {log.journal ? (
                        `"${log.journal}"`
                      ) : (
                        <span className="text-muted-foreground/45">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
