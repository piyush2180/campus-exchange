import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STEPS_PER_COIN, seedAssets } from "@/lib/store";
import type { Asset, Holding, Profile, AppUser, AppState } from "@/types";
import {
  fetchProfile,
  fetchHoldings,
  fetchMarketAssets,
  toProfile,
  tickMarket,
  tradeAsset,
} from "@/services/trading.service";

export type { Profile, AppUser, AppState };

// Several components mount useApp at once; only one of them needs to ask the server for a tick
let lastTickRequest = 0;

export function useApp() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [assets, setAssets] = useState<Asset[]>(seedAssets);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  // Auth state
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        const next: AppUser = {
          id: u.id,
          email: u.email ?? "",
          name:
            (u.user_metadata as { display_name?: string })?.display_name ||
            (u.email?.split("@")[0] ?? "User"),
        };
        setUser(next);
        userIdRef.current = u.id;
        setTimeout(() => loadAll(u.id), 0);
      } else {
        setUser(null);
        setProfile(null);
        setHoldings([]);
        userIdRef.current = null;
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email ?? "",
          name:
            (u.user_metadata as { display_name?: string })?.display_name ||
            (u.email?.split("@")[0] ?? "User"),
        });
        userIdRef.current = u.id;
        loadAll(u.id);
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const tradingRef = useRef(false);

  async function loadAll(uid: string) {
    setLoading(true);
    let prof = await fetchProfile(uid);
    const hs = await fetchHoldings(uid);
    if (!prof) {
      await new Promise((r) => setTimeout(r, 400));
      prof = await fetchProfile(uid);
    }
    if (prof) setProfile(prof);
    setHoldings(hs);
    setLoading(false);
  }

  // Realtime sync: profile and holdings changes from other tabs, devices and components stream in
  // via Supabase Realtime (postgres_changes, filtered server-side and gated by RLS)
  const uid = user?.id;
  useEffect(() => {
    if (!uid) return;
    const refetchHoldings = () => fetchHoldings(uid).then(setHoldings);
    const channel = supabase
      .channel(`app-state-${uid}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
        (payload) => setProfile(toProfile(payload.new as Parameters<typeof toProfile>[0])),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "holdings", filter: `user_id=eq.${uid}` },
        refetchHoldings,
      )
      // DELETE events cannot be filtered, so a full sell is picked up through its movement log row
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "asset_movements",
          filter: `user_id=eq.${uid}`,
        },
        refetchHoldings,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid]);

  // Shared market: prices live in market_assets, advance server-side via tick_market() and
  // stream to every client through Realtime, so all users see the same price at the same time
  useEffect(() => {
    if (!uid) return;
    fetchMarketAssets().then((rows) => rows.length && setAssets(rows));
    const channel = supabase
      .channel(`market-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "market_assets" },
        (payload) => {
          const row = payload.new as Asset;
          setAssets((prev) =>
            prev.map((a) =>
              a.id === row.id ? { ...a, price: Number(row.price), change: Number(row.change) } : a,
            ),
          );
        },
      )
      .subscribe();
    const id = window.setInterval(() => {
      if (Date.now() - lastTickRequest < 4500) return;
      lastTickRequest = Date.now();
      tickMarket();
    }, 5000);
    return () => {
      window.clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, [uid]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/app`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: name },
      },
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Trades run in the trade_asset() Postgres function, which checks the balance, locks the rows,
  // moves coins and shares, and writes the movement log in one transaction
  const trade = useCallback(async (asset: Asset, side: "buy" | "sell", shares: number) => {
    if (tradingRef.current) return { ok: false, reason: "Trade in progress" };
    tradingRef.current = true;
    try {
      if (!userIdRef.current) return { ok: false, reason: "Not signed in" };
      const { data, error } = await tradeAsset(asset.id, side, shares);
      if (error || !data) return { ok: false, reason: error?.message ?? "Trade failed" };
      setProfile((prev) => (prev ? { ...prev, coins: data.coins } : prev));
      setHoldings((prev) => {
        const without = prev.filter((h) => h.assetId !== asset.id);
        if (data.shares_after === 0) return without;
        return [
          ...without,
          { assetId: asset.id, shares: data.shares_after, avgPrice: data.avg_price },
        ];
      });
      return { ok: true, price: data.price };
    } finally {
      tradingRef.current = false;
    }
  }, []);

  const buy = useCallback((asset: Asset, shares = 1) => trade(asset, "buy", shares), [trade]);
  const sell = useCallback((asset: Asset, shares = 1) => trade(asset, "sell", shares), [trade]);

  const refresh = useCallback(async () => {
    const uid = userIdRef.current;
    if (uid) await loadAll(uid);
  }, []);

  const state: AppState = { user, loading, profile, assets, holdings };
  return {
    state,
    signUp,
    signIn,
    logout,
    buy,
    sell,
    STEPS_PER_COIN,
    refresh,
  };
}
