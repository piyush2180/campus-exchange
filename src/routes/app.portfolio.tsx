import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Inbox, PieChart, Coins } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Campus Exchange" }] }),
  component: Portfolio,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Portfolio() {
  const { state, sell } = useApp();

  const rows = state.holdings.map((h, i) => {
    const asset = state.assets.find((a) => a.id === h.assetId)!;
    const value = asset.price * h.shares;
    const cost = h.avgPrice * h.shares;
    const pnl = value - cost;
    const pnlPct = (pnl / cost) * 100;
    return { h, asset, value, cost, pnl, pnlPct, color: COLORS[i % COLORS.length] };
  });

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const handleSell = async (assetId: string) => {
    const asset = state.assets.find((a) => a.id === assetId);
    if (!asset) return;
    const res = await sell(asset, 1);
    if (res.ok) {
      toast.success(`Sold 1 ${asset.ticker}`, {
        description: `Received ${asset.price.toFixed(2)} coins`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Your simulated holdings
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track allocation, P&amp;L, and exit positions any time.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <Coins className="h-4 w-4 text-[color:var(--brand)]" />
          <span className="font-semibold tabular-nums">
            {(state.profile?.coins ?? 0).toFixed(2)}
          </span>
          <span className="text-muted-foreground">coins</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Summary label="Total value" value={totalValue.toFixed(2)} />
        <Summary label="Cost basis" value={totalCost.toFixed(2)} />
        <Summary
          label="Profit / Loss"
          value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`}
          sub={`${totalPct.toFixed(2)}%`}
          positive={totalPnl >= 0 && rows.length > 0}
          negative={totalPnl < 0}
        />
      </div>

      {rows.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">No investments yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Earn coins by syncing your steps, then buy your first asset to start your portfolio.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/app/market">
              <TrendingUp className="h-4 w-4" />
              Explore market
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Allocation bar */}
          <div className="surface-card overflow-hidden p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <PieChart className="h-3.5 w-3.5" />
              Allocation
            </div>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {rows.map((r) => (
                <div
                  key={r.h.assetId}
                  className="h-full transition-all"
                  style={{
                    width: `${(r.value / totalValue) * 100}%`,
                    backgroundColor: r.color,
                  }}
                  title={`${r.asset.ticker} — ${((r.value / totalValue) * 100).toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {rows.map((r) => (
                <div key={r.h.assetId} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="font-medium">{r.asset.ticker}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {((r.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
              <div className="col-span-5">Position</div>
              <div className="col-span-2 text-right">Value</div>
              <div className="col-span-3 text-right">P&amp;L</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            <ul className="divide-y divide-border">
              {rows.map(({ h, asset, value, pnl, pnlPct, color }) => (
                <li
                  key={h.assetId}
                  className="grid grid-cols-1 items-center gap-3 px-6 py-5 transition-colors hover:bg-muted/40 md:grid-cols-12"
                >
                  <div className="md:col-span-5 flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-background"
                      style={{ backgroundColor: color }}
                    >
                      {asset.ticker.slice(0, 3)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{asset.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {h.shares} × avg {h.avgPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <p className="text-sm font-semibold tabular-nums">{value.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">value</p>
                  </div>
                  <div className="md:col-span-3 md:text-right">
                    <p
                      className={`text-sm font-medium tabular-nums ${
                        pnl >= 0 ? "text-[color:var(--success)]" : "text-destructive"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                    </p>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <Button size="sm" variant="outline" onClick={() => handleSell(h.assetId)}>
                      Sell 1
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  sub,
  positive,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="surface-card p-6">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${
          positive ? "text-[color:var(--success)]" : negative ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
