import { Button } from "@/components/ui/button";
import type { PortfolioRow } from "@/hooks/usePortfolio";

interface HoldingsTableProps {
  rows: PortfolioRow[];
  onSell: (assetId: string) => void;
}

export function HoldingsTable({ rows, onSell }: HoldingsTableProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <div className="col-span-5">Position</div>
        <div className="col-span-2 text-right">Value</div>
        <div className="col-span-3 text-right">P&amp;L</div>
        <div className="col-span-2 text-right">Action</div>
      </div>
      <ul className="divide-y divide-border">
        {rows.map(({ h, asset, value, pnl, pnlPct, color }) => (
          <li
            key={h.assetId}
            className="grid grid-cols-1 items-center gap-3 px-6 py-5 transition-colors hover:bg-muted/40 md:grid-cols-12"
          >
            <div className="md:col-span-5 flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-background"
                style={{ backgroundColor: color }}
              >
                {asset.ticker.slice(0, 3)}
              </span>
              <div>
                <p className="text-sm font-semibold">{asset.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {h.shares} × avg {h.avgPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 md:text-right">
              <p className="text-sm font-semibold tabular-nums">{value.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">value</p>
            </div>
            <div className="md:col-span-3 md:text-right">
              <p
                className={`text-sm font-medium tabular-nums ${
                  pnl >= 0 ? "text-[color:var(--success)]" : "text-destructive"
                }`}
              >
                {pnl >= 0 ? "+" : ""}
                {pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
              </p>
            </div>
            <div className="md:col-span-2 md:text-right">
              <Button size="sm" variant="outline" onClick={() => onSell(h.assetId)}>
                Sell 1
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
