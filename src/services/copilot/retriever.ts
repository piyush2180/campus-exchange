import { supabase } from "@/integrations/supabase/client";
import { KNOWLEDGE_BASE_DOCS, type KnowledgeDoc } from "./knowledgeBase";
import type { AppState } from "@/types";

export type RetrievedContext = {
  sqlData: Record<string, unknown>;
  knowledgeDocs: KnowledgeDoc[];
  sources: string[];
};

/**
 * SQL-First Data Retriever and Knowledge Base Matcher.
 */
export async function retrieveContext(
  userId: string | null,
  query: string,
  appState?: AppState,
): Promise<RetrievedContext> {
  const q = query.toLowerCase();
  const sources: Set<string> = new Set();
  const sqlData: Record<string, unknown> = {};

  // 1. Relational SQL Retrieval from active AppState and Supabase
  if (appState && userId) {
    if (
      q.includes("portfolio") ||
      q.includes("holding") ||
      q.includes("asset") ||
      q.includes("pnl") ||
      q.includes("loss") ||
      q.includes("profit") ||
      q.includes("gain") ||
      q.includes("worst") ||
      q.includes("best") ||
      q.includes("risk") ||
      q.includes("explain this") ||
      q.includes("why is this")
    ) {
      sources.add("Portfolio");
      const holdingsSummary = appState.holdings.map((h) => {
        const asset = appState.assets.find((a) => a.id === h.assetId);
        const currentValue = asset ? asset.price * h.shares : 0;
        const costBasis = h.avgPrice * h.shares;
        const pnl = currentValue - costBasis;
        return {
          ticker: asset?.ticker ?? h.assetId,
          name: asset?.name ?? "Asset",
          shares: h.shares,
          avgPrice: h.avgPrice,
          currentPrice: asset?.price ?? 0,
          currentValue: +currentValue.toFixed(2),
          pnl: +pnl.toFixed(2),
        };
      });
      sqlData.holdings = holdingsSummary;
      sqlData.totalCoins = appState.profile?.coins ?? 0;
    }

    if (
      q.includes("wellness") ||
      q.includes("log") ||
      q.includes("step") ||
      q.includes("sleep") ||
      q.includes("water") ||
      q.includes("streak") ||
      q.includes("score") ||
      q.includes("habit")
    ) {
      sources.add("Wellness Logs");
      sqlData.profileStats = {
        stepsToday: appState.profile?.steps_today ?? 0,
        totalSteps: appState.profile?.total_steps ?? 0,
        coins: appState.profile?.coins ?? 0,
      };

      const { data: logs } = await supabase
        .from("wellness_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(7);

      if (logs && logs.length > 0) {
        sqlData.recentWellnessLogs = logs.map((l) => ({
          date: l.date.split("T")[0],
          steps: l.steps,
          sleep: l.sleep,
          water: l.water,
          workout: l.workout,
          mood: l.mood,
          score: l.activity_score,
          coins: l.coins_earned,
        }));
      }
    }

    if (q.includes("bet") || q.includes("duel") || q.includes("goal") || q.includes("wager")) {
      sources.add("Bets");
      const { data: bets } = await supabase
        .from("bets")
        .select("*")
        .or(`user_id.eq.${userId},opponent_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (bets && bets.length > 0) {
        sqlData.recentBets = bets.map((b) => ({
          type: b.bet_type,
          stake: b.stake,
          status: b.status,
          direction: b.direction,
          targetValue: b.target_value,
        }));
      }
    }

    if (
      q.includes("trade") ||
      q.includes("bought") ||
      q.includes("sold") ||
      q.includes("movement") ||
      q.includes("activity") ||
      q.includes("timeline") ||
      q.includes("what happened")
    ) {
      sources.add("Asset Movements");
      const { data: movements } = await supabase
        .from("asset_movements")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (movements && movements.length > 0) {
        sqlData.recentAssetMovements = movements.map((m) => ({
          at: m.created_at,
          type: m.movement_type,
          asset: m.asset_id.toUpperCase(),
          shares: m.shares,
          price: m.price,
          coinsDelta: m.coins_delta,
          sharesAfter: m.shares_after,
        }));
      }
    }

    if (
      q.includes("leaderboard") ||
      q.includes("rank") ||
      q.includes("mover") ||
      q.includes("top")
    ) {
      sources.add("Leaderboard");
    }
  }

  // 2. Knowledge Base: keyword matching over the platform guides
  const matchedDocs = keywordSearch(q);
  if (matchedDocs.length > 0) sources.add("Knowledge Base");

  return {
    sqlData,
    knowledgeDocs: matchedDocs,
    sources: Array.from(sources),
  };
}

function keywordSearch(q: string): KnowledgeDoc[] {
  return KNOWLEDGE_BASE_DOCS.filter((doc) => {
    const titleMatch = doc.title
      .toLowerCase()
      .split(" ")
      .some((w) => w.length > 3 && q.includes(w));
    const tagMatch = doc.tags.some((t) => q.includes(t));
    return titleMatch || tagMatch;
  });
}
