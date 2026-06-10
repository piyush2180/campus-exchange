import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Footprints, Coins } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Campus Exchange" }] }),
  component: Leaderboard,
});

type Row = { id: string; display_name: string; total_steps: number; coins: number };

function Leaderboard() {
  const { state } = useApp();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,display_name,total_steps,coins")
      .order("total_steps", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setRows(data as Row[]);
      });
  }, [state.profile?.total_steps]);

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

      {podium.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <PodiumCard rank={2} entry={podium[1]} isYou={podium[1]?.id === state.user?.id} />
          <PodiumCard rank={1} entry={podium[0]} isYou={podium[0]?.id === state.user?.id} />
          <PodiumCard rank={3} entry={podium[2]} isYou={podium[2]?.id === state.user?.id} />
        </div>
      )}

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Full ranking</h2>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No entries yet. Be the first — sync your steps!
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rest.map((entry, i) => {
              const rank = i + 4;
              const isYou = entry.id === state.user?.id;
              return (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between px-6 py-4 transition-colors ${isYou ? "bg-[color:var(--accent)]/40" : "hover:bg-muted/40"}`}
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
            {rest.length === 0 && podium.length > 0 && (
              <li className="px-6 py-10 text-center text-xs text-muted-foreground">
                Only the top players so far. Keep walking to climb the ranks!
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function PodiumCard({
  rank,
  entry,
  isYou,
}: {
  rank: 1 | 2 | 3;
  entry?: Row;
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
    <div className={`surface-card flex flex-col items-center p-4 text-center ${tones[rank]} ${heights[rank]}`}>
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
