import { useState } from "react";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types";

interface MarketBetsTabProps {
  coins: number;
  assets: Asset[];
  onPlace: (asset: Asset, dir: "up" | "down", stake: number) => void;
}

export function MarketBetsTab({ coins, assets, onPlace }: MarketBetsTabProps) {
  const [stake, setStake] = useState("5");
  const stakeNum = Math.max(1, Number(stake) || 0);

  return (
    <div className="space-y-4">
      <div className="surface-card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Resolves in 60 seconds · 1.8× payout
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="stake" className="text-xs text-muted-foreground">
            Stake
          </Label>
          <Input
            id="stake"
            type="number"
            min={1}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-24 text-right tabular-nums"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((a) => (
          <div
            key={a.id}
            className="surface-card group flex flex-col p-5 transition-shadow hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                  {a.ticker.slice(0, 3)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.ticker}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">{a.price.toFixed(2)}</p>
                <p
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    a.change >= 0 ? "text-[color:var(--success)]" : "text-destructive",
                  )}
                >
                  {a.change >= 0 ? "+" : ""}
                  {a.change.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-[color:var(--success)]/30 text-[color:var(--success)] hover:bg-[color:var(--success)]/10 hover:text-[color:var(--success)]"
                disabled={coins < stakeNum}
                onClick={() => onPlace(a, "up", stakeNum)}
              >
                <TrendingUp className="h-4 w-4" />
                UP
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={coins < stakeNum}
                onClick={() => onPlace(a, "down", stakeNum)}
              >
                <TrendingDown className="h-4 w-4" />
                DOWN
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
