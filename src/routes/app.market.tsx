import { createFileRoute } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useMarket } from "@/hooks/useMarket";
import { toast } from "sonner";
import { MarketPulseCards } from "@/features/market/MarketPulseCards";
import { AssetList } from "@/features/market/AssetList";
import { PageAISummarizer } from "@/features/copilot/PageAISummarizer";

export const Route = createFileRoute("/app/market")({
  head: () => ({ meta: [{ title: "Market — Campus Exchange" }] }),
  component: Market,
});

function Market() {
  const { state, buy } = useApp();
  const coins = state.profile?.coins ?? 0;
  const { totalAssets, gainers, losers, avgChange } = useMarket(state.assets);

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
        <PageAISummarizer pageName="Market" routePath="/app/market" />
      </header>

      <MarketPulseCards
        totalAssets={totalAssets}
        gainers={gainers}
        losers={losers}
        avgChange={avgChange}
      />

      <AssetList assets={state.assets} onBuy={handleBuy} />
    </div>
  );
}
