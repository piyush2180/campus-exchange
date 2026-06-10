import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Coins, Flame } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/market")({
  head: () => ({ meta: [{ title: "Market — Campus Exchange" }] }),
  component: Market,
});

function Market() {
  const { state, buy } = useApp();
  const coins = state.profile?.coins ?? 0;

  const handleBuy = async (assetId: string) => {
    const asset = state.assets.find((a) => a.id === assetId);
    if (!asset) return;
    if (coins < asset.price) {
      toast.error("Not enough coins", {
        description: "Walk a bit more or sync your steps to earn more.",
      });
      return;
    }
    const res = await buy(asset, 1);
    if (res.ok) {
      toast.success(`Bought 1 ${asset.ticker}`, {
        description: `Spent ${asset.price.toFixed(2)} coins`,
      });
    } else {
      toast.error(res.reason ?? "Trade failed");
    }
  };

  const gainers = state.assets.filter((a) => a.change >= 0).length;
  const losers = state.assets.length - gainers;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Market</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Trade the things you love
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Simulated indices for skills, fitness, and habits. Prices update every 5 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <Coins className="h-4 w-4 text-[color:var(--brand)]" />
          <span className="font-semibold tabular-nums">{coins.toFixed(2)}</span>
          <span className="text-muted-foreground">coins</span>
        </div>
      </header>

      {/* Market pulse */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <PulseCard label="Assets" value={state.assets.length.toString()} />
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
        <PulseCard
          label="Avg change"
          value={`${(
            state.assets.reduce((s, a) => s + a.change, 0) / state.assets.length
          ).toFixed(2)}%`}
        />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <div className="col-span-5">Asset</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">24h</div>
          <div className="col-span-3 text-right">Action</div>
        </div>
        <ul className="divide-y divide-border">
          {state.assets.map((a) => {
            const up = a.change >= 0;
            const barWidth = Math.min(100, Math.abs(a.change) * 12 + 10);
            return (
              <li
                key={a.id}
                className="grid grid-cols-1 items-center gap-3 px-6 py-5 transition-colors hover:bg-muted/40 md:grid-cols-12 md:gap-4"
              >
                <div className="md:col-span-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                    {a.ticker.slice(0, 3)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </div>
                <div className="md:col-span-2 md:text-right">
                  <p className="text-sm font-semibold tabular-nums">{a.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground md:hidden">{a.ticker}</p>
                </div>
                <div className="md:col-span-2 md:text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-muted md:block">
                      <div
                        className={`h-full rounded-full ${up ? "bg-[color:var(--success)]" : "bg-destructive"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium tabular-nums ${up ? "text-[color:var(--success)]" : "text-destructive"}`}
                    >
                      {up ? "+" : ""}
                      {a.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="md:col-span-3 flex justify-end gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/app/bets">
                      <Flame className="h-3.5 w-3.5" />
                      Bet
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => handleBuy(a.id)}>
                    Buy 1
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
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
