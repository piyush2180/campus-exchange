import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AssetMovement } from "@/types";
import { fetchAssetMovements } from "@/services/trading.service";

const MAX_MOVEMENTS = 25;

/**
 * Buy/sell movement log for the signed-in user, kept live over Supabase Realtime.
 */
export function useAssetMovements(userId: string | null) {
  const [movements, setMovements] = useState<AssetMovement[]>([]);

  useEffect(() => {
    if (!userId) {
      setMovements([]);
      return;
    }
    fetchAssetMovements(userId, MAX_MOVEMENTS).then(setMovements);

    const channel = supabase
      .channel(`asset-movements-${userId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "asset_movements",
          filter: `user_id=eq.${userId}`,
        },
        (payload) =>
          setMovements((prev) => [payload.new as AssetMovement, ...prev].slice(0, MAX_MOVEMENTS)),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return movements;
}
