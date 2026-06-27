import { useEffect, useState } from "react";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface DuelBetsTabProps {
  coins: number;
  currentUserId: string;
  currentSteps: number;
  onPlace: (opponentId: string, stake: number) => void;
}

export function DuelBetsTab({ coins, currentUserId, currentSteps, onPlace }: DuelBetsTabProps) {
  const [opponents, setOpponents] = useState<
    { id: string; display_name: string; total_steps: number }[]
  >([]);
  const [stake, setStake] = useState("20");
  const stakeNum = Math.max(1, Number(stake) || 0);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,display_name,total_steps")
      .neq("id", currentUserId)
      .order("total_steps", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setOpponents(data);
      });
  }, [currentUserId, currentSteps]);

  return (
    <div className="space-y-4">
      <div className="surface-card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Swords className="h-3.5 w-3.5" />
          24-hour step duel · 2× payout to the winner
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="duel-stake" className="text-xs text-muted-foreground">
            Stake
          </Label>
          <Input
            id="duel-stake"
            type="number"
            min={1}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-24 text-right tabular-nums"
          />
        </div>
      </div>

      {opponents.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
          <Swords className="h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No other players yet — invite a friend to challenge.
          </p>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <ul className="divide-y divide-border">
            {opponents.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.display_name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {p.total_steps.toLocaleString()} total steps
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={coins < stakeNum}
                  onClick={() => onPlace(p.id, stakeNum)}
                >
                  <Swords className="h-3.5 w-3.5" />
                  Challenge
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
