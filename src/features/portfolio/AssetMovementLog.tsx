import { formatDistanceToNow } from "date-fns";
import type { Asset, AssetMovement } from "@/types";

interface AssetMovementLogProps {
  movements: AssetMovement[];
  assets: Asset[];
}

export function AssetMovementLog({ movements, assets }: AssetMovementLogProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold">Asset movement log</h2>
        <p className="text-xs text-muted-foreground">Every buy and sell, updated live.</p>
      </div>
      {movements.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          No trades yet. Your buys and sells will be logged here.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {movements.map((m) => {
            const ticker =
              assets.find((a) => a.id === m.asset_id)?.ticker ?? m.asset_id.toUpperCase();
            const isBuy = m.movement_type === "buy";
            const delta = Number(m.coins_delta);
            return (
              <li
                key={m.id}
                className="grid grid-cols-2 items-center gap-3 px-6 py-3 text-sm md:grid-cols-4"
              >
                <div>
                  <span
                    className={`mr-2 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
                      isBuy
                        ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {m.movement_type}
                  </span>
                  <span className="font-medium">
                    {Number(m.shares)} {ticker}
                  </span>
                </div>
                <p className="text-right tabular-nums text-muted-foreground md:text-left">
                  @ {Number(m.price).toFixed(2)}
                </p>
                <p
                  className={`tabular-nums ${delta >= 0 ? "text-[color:var(--success)]" : "text-destructive"}`}
                >
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(2)} coins · {Number(m.shares_after)} held
                </p>
                <p className="text-right text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
