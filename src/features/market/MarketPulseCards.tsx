import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketPulseCardsProps {
  totalAssets: number;
  gainers: number;
  losers: number;
  avgChange: number;
}

export function MarketPulseCards({
  totalAssets,
  gainers,
  losers,
  avgChange,
}: MarketPulseCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <PulseCard label="Assets" value={totalAssets.toString()} />
      <PulseCard
        label="Gainers"
        value={gainers.toString()}
        tone="positive"
        icon={<TrendingUp className="h-3.5 w-3.5" />}
      />
      <PulseCard
        label="Losers"
        value={losers.toString()}
        tone="negative"
        icon={<TrendingDown className="h-3.5 w-3.5" />}
      />
      <PulseCard label="Avg change" value={`${avgChange.toFixed(2)}%`} />
    </div>
  );
}

function PulseCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p
        className={`mt-1.5 text-xl font-semibold tabular-nums ${
          tone === "positive"
            ? "text-[color:var(--success)]"
            : tone === "negative"
              ? "text-destructive"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
