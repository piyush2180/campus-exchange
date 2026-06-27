import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Shield, Activity, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/useApp";
import {
  getCachedInsights,
  computeAndCacheInsights,
  generateWeeklyReport,
  type AIInsightMetrics,
  type WeeklyReport,
} from "@/services/copilot/insights.service";

export function AIInsightsWidget() {
  const { state } = useApp();
  const userId = state.user?.id;

  const [insights, setInsights] = useState<AIInsightMetrics | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (userId) {
      const cached = getCachedInsights(userId);
      if (cached) {
        setInsights(cached);
      } else {
        const fresh = computeAndCacheInsights(userId, state);
        setInsights(fresh);
      }
    }
  }, [userId, state.holdings, state.profile?.steps_today]);

  const handleRefreshInsights = () => {
    if (userId) {
      const fresh = computeAndCacheInsights(userId, state);
      setInsights(fresh);
    }
  };

  const handleGenerateReport = () => {
    const rep = generateWeeklyReport(state);
    setReport(rep);
    setShowReport(true);
  };

  if (!insights) return null;

  return (
    <div className="surface-card overflow-hidden p-6 space-y-5 border-l-4 border-l-[color:var(--brand)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">Pulse AI Insights</h3>
            <p className="text-xs text-muted-foreground">
              Automated platform wellness & financial telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshInsights}
            title="Refresh Telemetry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="text-xs gap-1"
          >
            <FileText className="h-3.5 w-3.5" />
            Weekly Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-muted/40 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block flex items-center gap-1">
            <Shield className="h-3 w-3 text-sky-400" /> Risk Profile
          </span>
          <p className="mt-1 text-base font-bold tabular-nums">{insights.portfolioRisk}</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-400" /> Wellness Trend
          </span>
          <p className="mt-1 text-base font-bold tabular-nums">{insights.wellnessTrend}</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-amber-400" /> Best Asset
          </span>
          <p className="mt-1 text-base font-bold tabular-nums">{insights.bestAsset}</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block flex items-center gap-1">
            Activity Level
          </span>
          <p className="mt-1 text-base font-bold tabular-nums">{insights.tradingActivity}</p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border/80 p-4 text-xs">
        <span className="font-semibold text-foreground block mb-1">Weekly AI Recommendation:</span>
        <p className="text-muted-foreground leading-relaxed">{insights.weeklySuggestion}</p>
      </div>

      {showReport && report && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[color:var(--brand)]" />
              Weekly Summary Report ({report.generatedAt})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReport(false)}
              className="h-6 text-xs"
            >
              Close
            </Button>
          </div>
          <p className="text-xs text-foreground italic">{report.summary}</p>
          <div className="space-y-2 text-xs text-muted-foreground pt-1">
            <p>
              <strong>Portfolio:</strong> {report.sections.portfolioPerformance}
            </p>
            <p>
              <strong>Wellness:</strong> {report.sections.wellnessHabits}
            </p>
            <p>
              <strong>Wagering:</strong> {report.sections.bettingStats}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
