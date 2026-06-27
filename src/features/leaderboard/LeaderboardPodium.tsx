import { Crown, Medal, Footprints, Coins } from "lucide-react";
import type { LeaderboardEntry } from "@/services/leaderboard.service";

interface LeaderboardPodiumProps {
  podium: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardPodium({ podium, currentUserId }: LeaderboardPodiumProps) {
  if (podium.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      <PodiumCard rank={2} entry={podium[1]} isYou={podium[1]?.id === currentUserId} />
      <PodiumCard rank={1} entry={podium[0]} isYou={podium[0]?.id === currentUserId} />
      <PodiumCard rank={3} entry={podium[2]} isYou={podium[2]?.id === currentUserId} />
    </div>
  );
}

function PodiumCard({
  rank,
  entry,
  isYou,
}: {
  rank: 1 | 2 | 3;
  entry?: LeaderboardEntry;
  isYou: boolean;
}) {
  const heights = { 1: "md:pt-4", 2: "md:pt-10", 3: "md:pt-12" } as const;
  const tones = {
    1: "border-[color:var(--brand)]/40 bg-gradient-to-b from-[color:var(--accent)]/60 to-card",
    2: "bg-card",
    3: "bg-card",
  } as const;
  const Icon = rank === 1 ? Crown : Medal;
  const iconBg =
    rank === 1
      ? "bg-[color:var(--brand)] text-[color:var(--brand-foreground)]"
      : rank === 2
        ? "bg-muted text-foreground"
        : "bg-muted text-foreground";

  return (
    <div
      className={`surface-card flex flex-col items-center p-4 text-center ${tones[rank]} ${heights[rank]}`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        #{rank}
      </p>
      <p className="mt-1 truncate text-sm font-semibold">
        {entry?.display_name ?? "—"}
        {isYou && (
          <span className="ml-1.5 rounded-full bg-foreground px-1.5 py-0.5 text-[9px] font-medium text-background">
            YOU
          </span>
        )}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Footprints className="h-3 w-3" />
        <span className="tabular-nums">{(entry?.total_steps ?? 0).toLocaleString()}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Coins className="h-3 w-3" />
        <span className="tabular-nums">{Number(entry?.coins ?? 0).toFixed(0)}</span>
      </div>
    </div>
  );
}
