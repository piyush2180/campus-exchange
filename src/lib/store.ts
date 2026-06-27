/**
 * Asset and market simulation core utilities.
 * Handles simulated market price fluctuations, wellness activity scoring, and coin rewards.
 */
import { SEED_ASSETS, STEPS_PER_COIN } from "@/constants";
import type { Asset, Holding } from "@/types";

export type { Asset, Holding };
export const seedAssets = SEED_ASSETS;
export { STEPS_PER_COIN };

/**
 * Converts raw step counts into base platform coins.
 */
export function stepsToCoins(steps: number) {
  return Math.floor(steps / STEPS_PER_COIN);
}

/**
 * Simulates real-time market movement by applying random price drift and momentum calculations.
 */
export function fluctuateAssets(assets: Asset[]): Asset[] {
  return assets.map((a) => {
    const drift = (Math.random() - 0.5) * 0.04;
    const newPrice = Math.max(1, +(a.price * (1 + drift)).toFixed(2));
    const change = +(((newPrice - a.price) / a.price) * 100 + a.change * 0.4).toFixed(2);
    return { ...a, price: newPrice, change };
  });
}

/**
 * Calculates a comprehensive daily Activity Score (0 - 100) based on four health pillars:
 * - Steps (Max 40 pts for 10k steps)
 * - Sleep (Max 20 pts for 7-9 hours)
 * - Water (Max 20 pts for 3.0 Liters)
 * - Workout (20 pts flat for completion)
 */
export function calculateActivityScore(
  steps: number,
  sleep: number,
  water: number,
  workout: boolean,
): number {
  const stepsPoints = Math.min(40, (steps / 10000) * 40);

  let sleepPoints = 5;
  if (sleep >= 7 && sleep <= 9) {
    sleepPoints = 20;
  } else if ((sleep >= 6 && sleep < 7) || (sleep > 9 && sleep <= 10)) {
    sleepPoints = 15;
  } else if ((sleep >= 5 && sleep < 6) || (sleep > 10 && sleep <= 11)) {
    sleepPoints = 10;
  }

  const waterPoints = Math.min(20, (water / 3.0) * 20);
  const workoutPoints = workout ? 20 : 0;

  return Math.round(stepsPoints + sleepPoints + waterPoints + workoutPoints);
}

/**
 * Calculates total coins awarded for a wellness log, incorporating:
 * - Base coins from activity score
 * - Daily streak multiplier bonus
 * - Milestone achievement rewards (7, 14, 30 days)
 */
export function calculateCoinsEarned(
  activityScore: number,
  streak: number,
): {
  baseCoins: number;
  streakBonus: number;
  milestoneBonus: number;
  totalCoins: number;
} {
  const baseCoins = +(activityScore * 0.5).toFixed(2);
  const streakBonus = +Math.min(10, streak * 0.5).toFixed(2);

  let milestoneBonus = 0;
  if (streak === 7) {
    milestoneBonus = 50;
  } else if (streak === 14) {
    milestoneBonus = 100;
  } else if (streak === 30) {
    milestoneBonus = 250;
  }

  const totalCoins = +(baseCoins + streakBonus + milestoneBonus).toFixed(2);
  return { baseCoins, streakBonus, milestoneBonus, totalCoins };
}
