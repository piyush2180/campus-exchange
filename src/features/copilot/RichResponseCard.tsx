import { PieChart, TrendingUp, ShieldAlert } from "lucide-react";

interface RichResponseCardProps {
  title: string;
  totalValue: string;
  bestAsset: string;
  worstAsset: string;
  riskScore: string;
}

export function RichResponseCard({
  title,
  totalValue,
  bestAsset,
  worstAsset,
  riskScore,
}: RichResponseCardProps) {
  return (
    <div className="my-3 rounded-2xl border border-border bg-card/90 p-4 space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <PieChart className="h-4 w-4 text-[color:var(--brand)]" />
          {title}
        </span>
        <span className="text-[11px] font-semibold text-emerald-400">{totalValue}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
            Best
          </span>
          <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" /> {bestAsset}
          </span>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
            Worst
          </span>
          <span className="font-semibold text-foreground mt-0.5 block">{worstAsset}</span>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
            Risk
          </span>
          <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
            <ShieldAlert className="h-3 w-3 text-amber-400" /> {riskScore}
          </span>
        </div>
      </div>
    </div>
  );
}
