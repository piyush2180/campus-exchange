import { useState, type ReactNode } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricExplainerTooltipProps {
  metricName: string;
  metricValue: string | number;
  explanation: string;
  children: ReactNode;
}

export function MetricExplainerTooltip({
  metricName,
  metricValue,
  explanation,
  children,
}: MetricExplainerTooltipProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="relative group inline-block w-full">
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        <button
          onClick={() => setShowExplanation((prev) => !prev)}
          className="ml-1 text-muted-foreground hover:text-[color:var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title={`Explain ${metricName} with AI`}
        >
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
        </button>
      </div>

      {showExplanation && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-border bg-card p-3.5 shadow-xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5 font-bold text-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
              Explain: {metricName} ({metricValue})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(false)}
              className="h-5 w-5 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-muted-foreground leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
