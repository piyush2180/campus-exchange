import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Asset, AssetMovement, Holding, Profile } from "@/types";

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

export async function fetchMarketAssets(): Promise<Asset[]> {
  const { data } = await supabase
    .from("market_assets")
    .select("*")
    .order("price", { ascending: false });
  return (data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    ticker: a.ticker,
    description: a.description,
    price: Number(a.price),
    change: Number(a.change),
  }));
}

export async function tickMarket() {
  return await supabase.rpc("tick_market");
}

export type TradeResult = { price: number; coins: number; shares_after: number; avg_price: number };

export async function tradeAsset(assetId: string, side: "buy" | "sell", shares: number) {
  const { data, error } = await supabase.rpc("trade_asset", {
    p_asset_id: assetId,
    p_side: side,
    p_shares: shares,
  });
  if (error || !data) return { data: null, error };
  const r = data as Record<string, number | string>;
  const result: TradeResult = {
    price: Number(r.price),
    coins: Number(r.coins),
    shares_after: Number(r.shares_after),
    avg_price: Number(r.avg_price),
  };
  return { data: result, error: null };
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
