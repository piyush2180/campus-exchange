import { useState } from "react";
import { Sparkles, X, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/useApp";

interface PageAISummarizerProps {
  pageName: string;
  routePath: string;
}

export function PageAISummarizer({ pageName, routePath }: PageAISummarizerProps) {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPageSummaryContent = () => {
    if (routePath.includes("portfolio")) {
      const holdingsCount = state.holdings.length;
      return {
        summary: `Your portfolio holds ${holdingsCount} active positions valued across simulated asset indices.`,
        insights: [
          `Total coins active in holdings: ${state.holdings.reduce((acc, h) => acc + h.avgPrice * h.shares, 0).toFixed(2)}`,
          `Live market drift simulates price changes every 5 seconds.`,
        ],
        recommendations:
          "Maintain a diversified allocation across non-correlated indices like SLP and STDY.",
        warning:
          holdingsCount === 1
            ? "Concentration risk detected! Consider buying other asset classes."
            : undefined,
      };
    }
    if (routePath.includes("market")) {
      return {
        summary: "Live simulated Developer & Productivity Index exchange.",
        insights: [
          `Top active tickers: HACK, CODE, FIT, STDY, SLP.`,
          `Prices move via random drift algorithms + 40% momentum retention.`,
        ],
        recommendations: "Look for dip opportunities during temporary negative drift cycles.",
      };
    }
    if (routePath.includes("history")) {
      return {
        summary: "Daily physical health and recovery telemetry dashboard.",
        insights: [
          `Steps today: ${state.profile?.steps_today.toLocaleString() ?? 0}`,
          `Lifetime total steps: ${state.profile?.total_steps.toLocaleString() ?? 0}`,
        ],
        recommendations:
          "Log your daily steps, sleep, and water to maximize your Activity Score and earn base coins.",
      };
    }
    if (routePath.includes("bets")) {
      return {
        summary: "Predictions & Wagering hub for 60s market moves and Step Duels.",
        insights: [
          "Market Bets yield 1.8x multipliers on 60s price movements.",
          "Step Duels pit users in 24-hour head-to-head step challenges for the combined pot.",
        ],
        recommendations:
          "Wager conservatively—only risk coins you earn from daily wellness check-ins.",
      };
    }

    return {
      summary: `Dashboard hub for ${state.user?.name ?? "User"}.`,
      insights: [
        `Active Coin Balance: ${state.profile?.coins.toFixed(2) ?? 0} coins.`,
        `Steps today: ${state.profile?.steps_today.toLocaleString() ?? 0}.`,
      ],
      recommendations:
        "Complete daily check-in logs to earn wellness coins and build your streak bonus.",
    };
  };

  const content = getPageSummaryContent();

  return (
    <div className="my-2">
      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 300);
            setIsOpen(true);
          }}
          className="gap-1.5 text-xs border-border/80 hover:border-[color:var(--brand)] text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />✨ AI Summary
        </Button>
      ) : (
        <div className="rounded-2xl border border-[color:var(--brand)]/40 bg-card p-4 space-y-3 shadow-lg transition-all animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-[color:var(--brand)]" />
              Pulse AI Summary — {pageName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground animate-pulse">
              Generating page Telemetry...
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              <p className="text-foreground font-medium">{content.summary}</p>
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-amber-400" /> Key Insights
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                  {content.insights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-1">
                <span className="font-semibold text-muted-foreground block uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-400" /> Recommendation
                </span>
                <p className="text-muted-foreground mt-0.5">{content.recommendations}</p>
              </div>
              {content.warning && (
                <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 flex items-start gap-1.5 text-amber-400 text-[11px]">
                  <AlertTriangle className="h-3.5 w-3.5 flex-none mt-0.5" />
                  <span>{content.warning}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
