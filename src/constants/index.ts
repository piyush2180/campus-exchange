import type { Asset } from "@/types";

export const SEED_ASSETS: Asset[] = [
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

export const MILESTONES = [
  { target: 7, reward: 50 },
  { target: 14, reward: 100 },
  { target: 30, reward: 250 },
];
