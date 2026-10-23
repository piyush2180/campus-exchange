import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { AssetMovement, Holding, Profile } from "@/types";

export function toProfile(row: Database["public"]["Tables"]["profiles"]["Row"]): Profile {
  return {
    id: row.id,
    display_name: row.display_name,
    steps_today: row.steps_today,
    total_steps: row.total_steps,
    coins: Number(row.coins),
    last_sync: row.last_sync,
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data ? toProfile(data) : null;
}

export async function fetchHoldings(userId: string): Promise<Holding[]> {
  const { data } = await supabase.from("holdings").select("*").eq("user_id", userId);
  if (!data) return [];
  return data.map((h) => ({
    assetId: h.asset_id,
    shares: Number(h.shares),
    avgPrice: Number(h.avg_price),
  }));
}

export async function updateProfileCoins(userId: string, coins: number) {
  return await supabase.from("profiles").update({ coins }).eq("id", userId);
}

export async function upsertHolding(holding: {
  user_id: string;
  asset_id: string;
  shares: number;
  avg_price: number;
}) {
  return await supabase.from("holdings").upsert(holding, { onConflict: "user_id,asset_id" });
}

export async function deleteHolding(userId: string, assetId: string) {
  return await supabase.from("holdings").delete().eq("user_id", userId).eq("asset_id", assetId);
}

export async function fetchAssetMovements(userId: string, limit = 25): Promise<AssetMovement[]> {
  const { data } = await supabase
    .from("asset_movements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AssetMovement[]) ?? [];
}

export async function insertAssetMovement(movement: {
  user_id: string;
  asset_id: string;
  movement_type: "buy" | "sell";
  shares: number;
  price: number;
  coins_delta: number;
  shares_after: number;
}) {
  return await supabase.from("asset_movements").insert(movement);
}

export async function updateHoldingShares(userId: string, assetId: string, shares: number) {
  return await supabase
    .from("holdings")
    .update({ shares })
    .eq("user_id", userId)
    .eq("asset_id", assetId);
}
