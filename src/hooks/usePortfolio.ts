import { useMemo } from "react";
import type { Asset, Holding } from "@/types";

export type PortfolioRow = {
  h: Holding;
  asset: Asset;
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
  color: string;
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * Custom hook to compute portfolio analytics, total valuation, cost basis, and P&L.
 */
export function usePortfolio(holdings: Holding[], assets: Asset[]) {
  return useMemo(() => {
    const rows: PortfolioRow[] = holdings
      .map((h, i) => {
        const asset = assets.find((a) => a.id === h.assetId);
        if (!asset) return null;
        const value = asset.price * h.shares;
        const cost = h.avgPrice * h.shares;
        const pnl = value - cost;
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
        return {
          h,
          asset,
          value,
          cost,
          pnl,
          pnlPct,
          color: CHART_COLORS[i % CHART_COLORS.length],
        };
      })
      .filter((r): r is PortfolioRow => r !== null);

    const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
    const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
    const totalPnl = totalValue - totalCost;
    const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    return {
      rows,
      totalValue,
      totalCost,
      totalPnl,
      totalPct,
    };
  }, [holdings, assets]);
}
