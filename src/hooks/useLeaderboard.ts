import { useEffect, useState } from "react";
import { fetchFullLeaderboard, type LeaderboardEntry } from "@/services/leaderboard.service";

/**
 * Custom hook to fetch and reactively manage leaderboard standings.
 */
export function useLeaderboard(totalSteps?: number, limit: number = 50) {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchFullLeaderboard(limit).then((data) => {
      if (isMounted) {
        setRows(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [totalSteps, limit]);

  return { rows, loading };
}
