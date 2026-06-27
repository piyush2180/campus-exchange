import type { AppState } from "@/types";

export type AIInsightMetrics = {
  portfolioRisk: "Low" | "Moderate" | "High";
  wellnessTrend: "Improving" | "Consistent" | "Needs Attention";
  tradingActivity: "Low" | "Balanced" | "High";
  bestAsset: string;
  worstAsset: string;
  weeklySuggestion: string;
  lastUpdated: string;
};

export type WeeklyReport = {
  generatedAt: string;
  summary: string;
  sections: {
    portfolioPerformance: string;
    wellnessHabits: string;
    bettingStats: string;
    recommendations: string;
  };
};

const INSIGHTS_CACHE_KEY = "pulse_ai_cached_insights";

export function getCachedInsights(userId: string): AIInsightMetrics | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${INSIGHTS_CACHE_KEY}_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function computeAndCacheInsights(userId: string, state: AppState): AIInsightMetrics {
  const holdingsCount = state.holdings.length;
  const portfolioRisk: AIInsightMetrics["portfolioRisk"] =
    holdingsCount === 0
      ? "Low"
      : holdingsCount === 1
        ? "High"
        : holdingsCount < 3
          ? "Moderate"
          : "Low";

  let bestAsset = "None";
  let worstAsset = "None";
  let maxPnl = -Infinity;
  let minPnl = Infinity;

  state.holdings.forEach((h) => {
    const asset = state.assets.find((a) => a.id === h.assetId);
    if (asset) {
      const pnl = (asset.price - h.avgPrice) * h.shares;
      if (pnl > maxPnl) {
        maxPnl = pnl;
        bestAsset = asset.ticker;
      }
      if (pnl < minPnl) {
        minPnl = pnl;
        worstAsset = asset.ticker;
      }
    }
  });

  const steps = state.profile?.steps_today ?? 0;
  const wellnessTrend: AIInsightMetrics["wellnessTrend"] =
    steps > 8000 ? "Improving" : steps > 4000 ? "Consistent" : "Needs Attention";

  const metrics: AIInsightMetrics = {
    portfolioRisk,
    wellnessTrend,
    tradingActivity: holdingsCount > 2 ? "High" : holdingsCount > 0 ? "Balanced" : "Low",
    bestAsset,
    worstAsset,
    weeklySuggestion:
      wellnessTrend === "Needs Attention"
        ? "Sync your daily steps to earn base wellness coins before investing!"
        : portfolioRisk === "High"
          ? "Consider diversifying into non-correlated asset indices like SLP or STDY."
          : "Great job! Your wellness consistency and portfolio allocation are well aligned.",
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${INSIGHTS_CACHE_KEY}_${userId}`, JSON.stringify(metrics));
    } catch (e) {
      console.error("Failed to cache insights:", e);
    }
  }

  return metrics;
}

export function generateWeeklyReport(state: AppState): WeeklyReport {
  const coins = state.profile?.coins ?? 0;
  const totalSteps = state.profile?.total_steps ?? 0;
  const stepsToday = state.profile?.steps_today ?? 0;

  return {
    generatedAt: new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    summary: `Over the past week, you accumulated a total of ${totalSteps.toLocaleString()} lifetime steps and maintained an active balance of ${coins.toFixed(2)} wellness coins.`,
    sections: {
      portfolioPerformance: `Your simulated portfolio currently holds ${state.holdings.length} active positions. Total allocation is focused across asset indices with high simulated activity.`,
      wellnessHabits: `Daily step tracking logged ${stepsToday.toLocaleString()} steps today. Maintaining a steady 7-9 hours of sleep and 3.0L water intake will maximize your Activity Score.`,
      bettingStats: `Your coin balance allows participation in 60-second Market Predictions and head-to-head Step Duels to accelerate earnings.`,
      recommendations: `Maintain a minimum 7-day wellness streak to unlock milestone coin bonuses (+50 coins) and reinvest rewards into diversified index holdings.`,
    },
  };
}

export function downloadWeeklyReportMarkdown(report: WeeklyReport) {
  const markdownContent = `# CampusExchange Weekly Health & Financial Report
*Generated on: ${report.generatedAt}*

## Summary
${report.summary}

## Portfolio Performance
${report.sections.portfolioPerformance}

## Wellness & Daily Habits
${report.sections.wellnessHabits}

## Wagering & Predictions
${report.sections.bettingStats}

## AI Recommendations & Action Plan
${report.sections.recommendations}
`;

  const blob = new Blob([markdownContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CampusExchange_Weekly_Report_${report.generatedAt.replace(/\s+/g, "_")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
