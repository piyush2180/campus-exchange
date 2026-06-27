import type { Message } from "./promptBuilder";

export type Thread = {
  id: string;
  title: string;
  createdAt: string;
  isBookmarked?: boolean;
  messages: Message[];
};

const STORAGE_KEY = "campus_exchange_pulse_ai_threads";

export function getStoredThreads(userId: string): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveThreads(userId: string, threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(threads));
  } catch (e) {
    console.error("Failed to save conversation threads:", e);
  }
}

export function generateThreadTitle(firstMessage: string): string {
  const q = firstMessage.toLowerCase();
  if (q.includes("portfolio") || q.includes("holding") || q.includes("pnl"))
    return "Portfolio Review";
  if (q.includes("trade") || q.includes("buy") || q.includes("sell")) return "Trading Advice";
  if (q.includes("wellness") || q.includes("score") || q.includes("streak") || q.includes("step"))
    return "Wellness Analysis";
  if (q.includes("bet") || q.includes("duel")) return "Betting Strategy";
  if (q.includes("summary") || q.includes("week")) return "Weekly Summary";

  const words = firstMessage.trim().split(/\s+/).slice(0, 4).join(" ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "New Conversation";
}

export function filterThreads(threads: Thread[], searchQuery: string): Thread[] {
  if (!searchQuery.trim()) return threads;
  const q = searchQuery.toLowerCase();
  return threads.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.messages.some((m) => m.content.toLowerCase().includes(q)),
  );
}
