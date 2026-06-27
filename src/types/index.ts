import type { Database } from "@/integrations/supabase/types";

export type WellnessLog = Database["public"]["Tables"]["wellness_logs"]["Row"];
export type Bet = Database["public"]["Tables"]["bets"]["Row"] & {
  bet_type: "market" | "duel" | "goal";
  direction: "up" | "down" | null;
  status: "pending" | "won" | "lost" | "cancelled";
};
export type Profile = {
  id: string;
  display_name: string;
  steps_today: number;
  total_steps: number;
  coins: number;
  last_sync: string | null;
};

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

export type Asset = {
  id: string;
  name: string;
  ticker: string;
  description: string;
  price: number;
  change: number;
};

export type Holding = {
  assetId: string;
  shares: number;
  avgPrice: number;
};

export type AppState = {
  user: AppUser | null;
  loading: boolean;
  profile: Profile | null;
  assets: Asset[];
  holdings: Holding[];
};
