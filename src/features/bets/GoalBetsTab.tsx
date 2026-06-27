import { useState } from "react";
import { Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalBetsTabProps {
  coins: number;
  stepsToday: number;
  onPlace: (goal: number, stake: number) => void;
}

export function GoalBetsTab({ coins, stepsToday, onPlace }: GoalBetsTabProps) {
  const [goal, setGoal] = useState("10000");
  const [stake, setStake] = useState("10");
  const goalNum = Math.max(1000, Number(goal) || 0);
  const stakeNum = Math.max(1, Number(stake) || 0);
  const progress = Math.min(100, (stepsToday / goalNum) * 100);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="surface-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Target className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          Set today's goal
        </div>
        <h3 className="mt-2 text-2xl font-semibold">Bet on yourself</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Hit your step goal before midnight to double your stake.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal">Step goal</Label>
            <Input
              id="goal"
              type="number"
              min={1000}
              step={500}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-stake">Stake (coins)</Label>
            <Input
              id="goal-stake"
              type="number"
              min={1}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </div>

          <div className="rounded-xl bg-muted/60 p-4">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">Progress today</span>
              <span className="font-medium tabular-nums">
                {stepsToday.toLocaleString()} / {goalNum.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-[color:var(--brand)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={coins < stakeNum}
            onClick={() => onPlace(goalNum, stakeNum)}
          >
            Bet {stakeNum} coins · win {(stakeNum * 2).toFixed(0)}
          </Button>
        </div>
      </div>

      <div className="surface-card overflow-hidden p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          How it works
        </div>
        <h3 className="mt-2 text-2xl font-semibold">Daily commitment</h3>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-[color:var(--accent-foreground)]">
              1
            </span>
            Pick a step goal you can realistically hit today.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-[color:var(--accent-foreground)]">
              2
            </span>
            Stake coins. They're locked until midnight.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-[color:var(--accent-foreground)]">
              3
            </span>
            Hit the goal → 2× payout. Miss → forfeit your stake.
          </li>
        </ul>
      </div>
    </div>
  );
}
