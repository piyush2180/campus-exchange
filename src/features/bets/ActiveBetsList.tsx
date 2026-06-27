import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bet, Asset } from "@/types";

interface ActiveBetsListProps {
  bets: Bet[];
  assets: Asset[];
  onRefresh: () => void;
}

export function ActiveBetsList({ bets, assets, onRefresh }: ActiveBetsListProps) {
  const [, force] = useState(0);
  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const pending = useMemo(() => bets.filter((b) => b.status === "pending"), [bets]);
  const settled = useMemo(() => bets.filter((b) => b.status !== "pending").slice(0, 10), [bets]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Active bets</h2>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <Loader2 className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
        {pending.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No active bets — place one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {pending.map((b) => (
              <BetRow key={b.id} bet={b} assets={assets} />
            ))}
          </ul>
        )}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Recent results</h2>
        </div>
        {settled.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            History will appear here once your bets resolve.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {settled.map((b) => (
              <BetRow key={b.id} bet={b} assets={assets} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BetRow({ bet, assets }: { bet: Bet; assets: Asset[] }) {
  const asset = bet.asset_id ? assets.find((a) => a.id === bet.asset_id) : null;
  const remainMs = new Date(bet.resolves_at).getTime() - Date.now();
  const remain =
    remainMs > 0
      ? remainMs > 60_000
        ? `${Math.round(remainMs / 60_000)}m`
        : `${Math.max(0, Math.round(remainMs / 1000))}s`
      : "resolving…";

  const label =
    bet.bet_type === "market"
      ? `${asset?.ticker ?? "—"} ${bet.direction?.toUpperCase()}`
      : bet.bet_type === "goal"
        ? `${bet.target_value?.toLocaleString()} steps`
        : "Step duel";

  const sub =
    bet.bet_type === "market"
      ? `Start ${bet.start_price?.toFixed(2)}${
          bet.end_price ? ` → ${bet.end_price.toFixed(2)}` : ""
        }`
      : bet.bet_type === "goal"
        ? `2× payout`
        : `24h winner takes ${(bet.stake * 2).toFixed(0)}`;

  const statusBadge =
    bet.status === "pending" ? (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {remain}
      </span>
    ) : bet.status === "won" ? (
      <span className="rounded-full bg-[color:var(--success)]/15 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--success)]">
        WON +{(bet.stake * bet.payout_multiplier).toFixed(2)}
      </span>
    ) : (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
        LOST −{bet.stake.toFixed(2)}
      </span>
    );

  return (
    <li className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm tabular-nums text-muted-foreground">
          {bet.stake.toFixed(2)} coins
        </span>
        {statusBadge}
      </div>
    </li>
  );
}
