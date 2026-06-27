import { supabase } from "@/integrations/supabase/client";
import type { Holding, Profile } from "@/types";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    display_name: data.display_name,
    steps_today: data.steps_today,
    total_steps: data.total_steps,
    coins: Number(data.coins),
    last_sync: data.last_sync,
  };
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

export async function updateHoldingShares(userId: string, assetId: string, shares: number) {
  return await supabase
    .from("holdings")
    .update({ shares })
    .eq("user_id", userId)
    .eq("asset_id", assetId);
}
