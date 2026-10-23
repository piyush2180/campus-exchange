/**
 * Shared market constants. Price ticks, trades, bets and wellness rewards are computed in
 * Postgres functions (see supabase/migrations/20261023010000_server_authoritative_economy.sql).
 */
import { SEED_ASSETS, STEPS_PER_COIN } from "@/constants";
import type { Asset, Holding } from "@/types";

export type { Asset, Holding };
export const seedAssets = SEED_ASSETS;
export { STEPS_PER_COIN };
