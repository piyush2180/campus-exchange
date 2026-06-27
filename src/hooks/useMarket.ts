import { useMemo } from "react";
import type { Asset } from "@/types";

/**
 * Custom hook to compute market-wide statistics (gainers, losers, average 24h performance).
 */
export function useMarket(assets: Asset[]) {
  return useMemo(() => {
    const gainers = assets.filter((a) => a.change >= 0).length;
    const losers = assets.length - gainers;
    const avgChange =
      assets.length > 0 ? assets.reduce((sum, a) => sum + a.change, 0) / assets.length : 0;

    return {
      totalAssets: assets.length,
      gainers,
      losers,
      avgChange,
    };
  }, [assets]);
}
