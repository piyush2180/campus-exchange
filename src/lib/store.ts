// Asset/market simulation utilities. User/portfolio data lives in Supabase.

export type Asset = {
  id: string;
  name: string;
  ticker: string;
  description: string;
  price: number;
  change: number;
};

export type Holding = {
  assetId: string;
  shares: number;
  avgPrice: number;
};

export const seedAssets: Asset[] = [
  {
    id: "hack",
    name: "Hackathon Points",
    ticker: "HACK",
    description: "Index of competitive coding events",
    price: 142.5,
    change: 2.4,
  },
  {
    id: "code",
    name: "Coding Skill Index",
    ticker: "CODE",
    description: "Aggregate developer skill benchmark",
    price: 318.2,
    change: -0.8,
  },
  {
    id: "fit",
    name: "Fitness Index",
    ticker: "FIT",
    description: "Composite of global fitness activity",
    price: 87.6,
    change: 4.1,
  },
  {
    id: "study",
    name: "Study Hours Futures",
    ticker: "STDY",
    description: "Tracks collective study commitment",
    price: 56.3,
    change: 1.2,
  },
  {
    id: "sleep",
    name: "Sleep Quality ETF",
    ticker: "SLP",
    description: "Diversified rest & recovery basket",
    price: 204.9,
    change: -1.6,
  },
];

export const STEPS_PER_COIN = 100;

export function stepsToCoins(steps: number) {
  return Math.floor(steps / STEPS_PER_COIN);
}

export function fluctuateAssets(assets: Asset[]): Asset[] {
  return assets.map((a) => {
    const drift = (Math.random() - 0.5) * 0.04;
    const newPrice = Math.max(1, +(a.price * (1 + drift)).toFixed(2));
    const change = +(((newPrice - a.price) / a.price) * 100 + a.change * 0.4).toFixed(2);
    return { ...a, price: newPrice, change };
  });
}
