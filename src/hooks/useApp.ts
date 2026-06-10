import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type Asset,
  type Holding,
  fluctuateAssets,
  stepsToCoins,
  STEPS_PER_COIN,
  seedAssets,
} from "@/lib/store";

export type Profile = {
  id: string;
  display_name: string;
  steps_today: number;
  total_steps: number;
  coins: number;
  last_sync: string | null;
};

export type AppUser = { id: string; email: string; name: string };

export type AppState = {
  user: AppUser | null;
  loading: boolean;
  profile: Profile | null;
  assets: Asset[];
  holdings: Holding[];
};

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
        // defer DB calls
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

  async function loadAll(uid: string) {
    setLoading(true);
    const [{ data: prof }, { data: hs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("holdings").select("*").eq("user_id", uid),
    ]);
    if (prof) {
      setProfile({
        id: prof.id,
        display_name: prof.display_name,
        steps_today: prof.steps_today,
        total_steps: prof.total_steps,
        coins: Number(prof.coins),
        last_sync: prof.last_sync,
      });
    }
    if (hs) {
      setHoldings(
        hs.map((h) => ({
          assetId: h.asset_id,
          shares: Number(h.shares),
          avgPrice: Number(h.avg_price),
        })),
      );
    }
    setLoading(false);
  }

  // Market simulation (client-side)
  useEffect(() => {
    const id = window.setInterval(() => {
      setAssets((prev) => fluctuateAssets(prev));
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

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

  // Credit a delta of real (live-pedometer) steps to the user
  const addLiveSteps = useCallback(
    async (delta: number) => {
      const uid = userIdRef.current;
      if (!uid || !profile || delta <= 0) return;
      const newSteps = profile.steps_today + delta;
      const newTotal = profile.total_steps + delta;
      const earned = stepsToCoins(newSteps) - stepsToCoins(profile.steps_today);
      const newCoins = +(profile.coins + earned).toFixed(2);
      const lastSync = new Date().toISOString();
      setProfile({
        ...profile,
        steps_today: newSteps,
        total_steps: newTotal,
        coins: newCoins,
        last_sync: lastSync,
      });
      await supabase
        .from("profiles")
        .update({
          steps_today: newSteps,
          total_steps: newTotal,
          coins: newCoins,
          last_sync: lastSync,
        })
        .eq("id", uid);
    },
    [profile],
  );

  // Adjust coin balance (for bet stakes/payouts). Returns false if insufficient.
  const adjustCoins = useCallback(
    async (delta: number) => {
      const uid = userIdRef.current;
      if (!uid || !profile) return false;
      const next = +(profile.coins + delta).toFixed(2);
      if (next < 0) return false;
      setProfile({ ...profile, coins: next });
      await supabase.from("profiles").update({ coins: next }).eq("id", uid);
      return true;
    },
    [profile],
  );

  const syncSteps = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid || !profile) return;
    const added = Math.floor(800 + Math.random() * 2400);
    const newSteps = profile.steps_today + added;
    const newTotal = profile.total_steps + added;
    const earned = stepsToCoins(newSteps) - stepsToCoins(profile.steps_today);
    const newCoins = +(profile.coins + earned).toFixed(2);
    const lastSync = new Date().toISOString();

    setProfile({
      ...profile,
      steps_today: newSteps,
      total_steps: newTotal,
      coins: newCoins,
      last_sync: lastSync,
    });

    await supabase
      .from("profiles")
      .update({
        steps_today: newSteps,
        total_steps: newTotal,
        coins: newCoins,
        last_sync: lastSync,
      })
      .eq("id", uid);
  }, [profile]);

  const buy = useCallback(
    async (asset: Asset, shares = 1) => {
      const uid = userIdRef.current;
      if (!uid || !profile) return { ok: false, reason: "Not signed in" };
      const cost = asset.price * shares;
      if (profile.coins < cost) return { ok: false, reason: "Not enough coins" };

      const existing = holdings.find((h) => h.assetId === asset.id);
      const newShares = (existing?.shares ?? 0) + shares;
      const newAvg = existing
        ? (existing.avgPrice * existing.shares + asset.price * shares) / newShares
        : asset.price;

      const newCoins = +(profile.coins - cost).toFixed(2);

      setProfile({ ...profile, coins: newCoins });
      setHoldings((prev) => {
        const without = prev.filter((h) => h.assetId !== asset.id);
        return [...without, { assetId: asset.id, shares: newShares, avgPrice: newAvg }];
      });

      await Promise.all([
        supabase.from("profiles").update({ coins: newCoins }).eq("id", uid),
        supabase
          .from("holdings")
          .upsert(
            {
              user_id: uid,
              asset_id: asset.id,
              shares: newShares,
              avg_price: newAvg,
            },
            { onConflict: "user_id,asset_id" },
          ),
      ]);
      return { ok: true };
    },
    [profile, holdings],
  );

  const sell = useCallback(
    async (asset: Asset, shares = 1) => {
      const uid = userIdRef.current;
      if (!uid || !profile) return { ok: false };
      const existing = holdings.find((h) => h.assetId === asset.id);
      if (!existing || existing.shares < shares) return { ok: false };

      const proceeds = asset.price * shares;
      const remaining = existing.shares - shares;
      const newCoins = +(profile.coins + proceeds).toFixed(2);

      setProfile({ ...profile, coins: newCoins });
      setHoldings((prev) => {
        if (remaining === 0) return prev.filter((h) => h.assetId !== asset.id);
        return prev.map((h) =>
          h.assetId === asset.id ? { ...h, shares: remaining } : h,
        );
      });

      await supabase.from("profiles").update({ coins: newCoins }).eq("id", uid);
      if (remaining === 0) {
        await supabase
          .from("holdings")
          .delete()
          .eq("user_id", uid)
          .eq("asset_id", asset.id);
      } else {
        await supabase
          .from("holdings")
          .update({ shares: remaining })
          .eq("user_id", uid)
          .eq("asset_id", asset.id);
      }
      return { ok: true };
    },
    [profile, holdings],
  );

  const state: AppState = { user, loading, profile, assets, holdings };
  return {
    state,
    signUp,
    signIn,
    logout,
    syncSteps,
    addLiveSteps,
    adjustCoins,
    buy,
    sell,
    STEPS_PER_COIN,
  };
}
