import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardPodium } from "@/features/leaderboard/LeaderboardPodium";
import { LeaderboardTable } from "@/features/leaderboard/LeaderboardTable";

export const Route = createFileRoute("/app/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Campus Exchange" }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const { state } = useApp();
  const { rows } = useLeaderboard(state.profile?.total_steps);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Top movers across Campus Exchange, ranked by total steps.
          </p>
        </div>
      </header>

      <LeaderboardPodium podium={podium} currentUserId={state.user?.id} />

      <LeaderboardTable entries={rest} podiumCount={3} currentUserId={state.user?.id} />
    </div>
  );
}
