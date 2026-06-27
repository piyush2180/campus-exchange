import { PieChart } from "lucide-react";
import type { PortfolioRow } from "@/hooks/usePortfolio";

interface AllocationBarProps {
  rows: PortfolioRow[];
  totalValue: number;
}

export function AllocationBar({ rows, totalValue }: AllocationBarProps) {
  if (rows.length === 0 || totalValue <= 0) return null;

  return (
    <div className="surface-card overflow-hidden p-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <PieChart className="h-3.5 w-3.5" />
        Allocation
      </div>
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {rows.map((r) => (
          <div
            key={r.h.assetId}
            className="h-full transition-all"
            style={{
              width: `${(r.value / totalValue) * 100}%`,
              backgroundColor: r.color,
            }}
            title={`${r.asset.ticker} — ${((r.value / totalValue) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {rows.map((r) => (
          <div key={r.h.assetId} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
            <span className="font-medium">{r.asset.ticker}</span>
            <span className="text-muted-foreground tabular-nums">
              {((r.value / totalValue) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
