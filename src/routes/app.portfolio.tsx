import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Inbox, Coins } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AllocationBar } from "@/features/portfolio/AllocationBar";
import { HoldingsTable } from "@/features/portfolio/HoldingsTable";
import { PageAISummarizer } from "@/features/copilot/PageAISummarizer";

export const Route = createFileRoute("/app/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Campus Exchange" }] }),
  component: Portfolio,
});

function Portfolio() {
  const { state, sell } = useApp();
  const { rows, totalValue, totalCost, totalPnl, totalPct } = usePortfolio(
    state.holdings,
    state.assets,
  );

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
        <PageAISummarizer pageName="Portfolio" routePath="/app/portfolio" />
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
          <AllocationBar rows={rows} totalValue={totalValue} />
          <HoldingsTable rows={rows} onSell={handleSell} />
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
