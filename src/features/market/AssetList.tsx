import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/types";

interface AssetListProps {
  assets: Asset[];
  onBuy: (assetId: string) => void;
}

export function AssetList({ assets, onBuy }: AssetListProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <div className="col-span-5">Asset</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-right">24h</div>
        <div className="col-span-3 text-right">Action</div>
      </div>
      <ul className="divide-y divide-border">
        {assets.map((a) => {
          const up = a.change >= 0;
          const barWidth = Math.min(100, Math.abs(a.change) * 12 + 10);
          return (
            <li
              key={a.id}
              className="grid grid-cols-1 items-center gap-3 px-6 py-5 transition-colors hover:bg-muted/40 md:grid-cols-12 md:gap-4"
            >
              <div className="md:col-span-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                  {a.ticker.slice(0, 3)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.description}</p>
                </div>
              </div>
              <div className="md:col-span-2 md:text-right">
                <p className="text-sm font-semibold tabular-nums">{a.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground md:hidden">{a.ticker}</p>
              </div>
              <div className="md:col-span-2 md:text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-muted md:block">
                    <div
                      className={`h-full rounded-full ${
                        up ? "bg-[color:var(--success)]" : "bg-destructive"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      up ? "text-[color:var(--success)]" : "text-destructive"
                    }`}
                  >
                    {up ? "+" : ""}
                    {a.change.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/app/bets">
                    <Flame className="h-3.5 w-3.5" />
                    Bet
                  </Link>
                </Button>
                <Button size="sm" onClick={() => onBuy(a.id)}>
                  Buy 1
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
