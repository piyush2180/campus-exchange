export type KnowledgeDoc = {
  id: string;
  title: string;
  category: "guide" | "rules" | "faq" | "assets" | "wellness" | "trading";
  content: string;
  tags: string[];
};

export const KNOWLEDGE_BASE_DOCS: KnowledgeDoc[] = [
  {
    id: "platform-overview",
    title: "CampusExchange Platform Overview",
    category: "guide",
    tags: ["overview", "welcome", "basics", "coins"],
    content: `CampusExchange turns your daily wellness and physical activity into simulated investments. Users earn wellness coins by logging daily check-ins (steps, sleep, water, workouts, mood) and can use these coins to trade simulated tech & skills indices or place predictions on market movements and step goals.`,
  },
  {
    id: "activity-score",
    title: "Daily Activity Score & Coin Rewards Formula",
    category: "wellness",
    tags: ["score", "activity", "coins", "formula", "wellness", "streak"],
    content: `The Activity Score is a composite health metric scaled from 0 to 100 based on 4 pillars:
1. Steps (Max 40 points): Scaled linearly up to 10,000 steps.
2. Sleep Duration (Max 20 points): 7-9 hours earns 20 pts; 6-7h or 9-10h earns 15 pts; 5-6h or 10-11h earns 10 pts.
3. Water Intake (Max 20 points): Scaled linearly up to 3.0 Liters.
4. Workout Completion (20 points): 20 pts flat for completing a workout today.

Coin Rewards Calculation:
- Base Coins = Activity Score * 0.5
- Streak Bonus = min(10, current_streak * 0.5)
- Milestone Bonuses: 7-day streak (+50 coins), 14-day streak (+100 coins), 30-day streak (+250 coins).`,
  },
  {
    id: "market-simulation",
    title: "Simulated Market & Fluctuation Mechanics",
    category: "trading",
    tags: ["market", "simulation", "assets", "price", "drift", "trading"],
    content: `CampusExchange features a live simulated market representing Developer and Productivity indices. Prices update automatically every 5 seconds using a random drift algorithm (up to ±4% variation per tick) blended with 40% momentum retention.
Available Seed Assets:
- HACK (Hackathon Points): Index of competitive coding events.
- CODE (Coding Skill Index): Aggregate developer benchmark.
- FIT (Fitness Index): Composite of global physical activity.
- STDY (Study Hours Futures): Tracks collective academic commitment.
- SLP (Sleep Quality ETF): Diversified rest & recovery basket.`,
  },
  {
    id: "betting-system",
    title: "Wagering & Predictions (Market Bets, Step Goals, Duels)",
    category: "rules",
    tags: ["bets", "wagering", "duels", "goals", "predictions"],
    content: `CampusExchange offers 3 distinct prediction modes:
1. Market Bets: Predict whether an asset price will move UP or DOWN over a 60-second window. Successful predictions yield a 1.8x multiplier payout.
2. Step Goal Bets: Wager coins on hitting your daily step target before midnight. Hitting your goal yields a 2.0x multiplier payout.
3. Step Duels: Challenge another user in a 24-hour head-to-head step competition. Whoever logs more steps during the duel wins the combined pot (2.0x multiplier).`,
  },
  {
    id: "portfolio-concepts",
    title: "Portfolio Management & P&L Analytics",
    category: "trading",
    tags: ["portfolio", "pnl", "allocation", "cost basis", "holdings"],
    content: `Your portfolio tracks simulated asset positions. 
- Cost Basis = Total coins spent purchasing shares (shares * average buy price).
- Total Valuation = Current market value of held shares (shares * live market price).
- Profit / Loss (P&L) = Total Valuation minus Cost Basis.
- Diversification / Allocation: Visualized via distribution bars showing percentage concentration in each ticker.`,
  },
  {
    id: "faq-general",
    title: "Frequently Asked Questions (FAQ)",
    category: "faq",
    tags: ["faq", "help", "support", "money", "risk"],
    content: `Q: Is real money involved?
A: No. CampusExchange uses 100% simulated coins and virtual indices for educational and financial wellness purposes.

Q: How do I get more coins?
A: Complete your daily wellness check-ins, build streak milestones, win step goal predictions, or profit from market trading.

Q: Can I edit my check-in today?
A: Yes! You can update your daily log from the Dashboard. Your Activity Score and earned coins will adjust automatically.`,
  },
];
