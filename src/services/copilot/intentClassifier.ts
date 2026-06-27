export type CopilotIntent =
  | "SQL"
  | "Knowledge"
  | "Mixed"
  | "Action"
  | "Greeting"
  | "OutOfDomain"
  | "Navigation"
  | "Timeline"
  | "MetricExplainer"
  | "General";

/**
 * Enhanced intent classifier handling greetings, out-of-domain queries, actions, navigation, timelines, and RAG data routing.
 */
export function classifyIntent(query: string): CopilotIntent {
  const q = query.toLowerCase().trim();

  // Navigation intents
  if (
    q.startsWith("take me to") ||
    q.startsWith("go to") ||
    q.startsWith("open ") ||
    q.startsWith("navigate to") ||
    q.startsWith("show page")
  ) {
    return "Navigation";
  }

  // Timeline intents
  if (
    q.includes("timeline") ||
    q.includes("what happened") ||
    q.includes("what changed") ||
    q.includes("summarize last month") ||
    q.includes("recent activity log")
  ) {
    return "Timeline";
  }

  // Greetings and small talk
  const greetingPhrases = [
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "good morning",
    "good afternoon",
    "good evening",
    "who are you",
    "what can you do",
    "what is pulse ai",
    "help",
    "bye",
  ];
  if (greetingPhrases.some((g) => q === g || q.startsWith(g + " ") || q.endsWith(" " + g))) {
    return "Greeting";
  }

  // Out of domain queries
  const outOfDomainKeywords = [
    "leetcode",
    "quantum physics",
    "essay",
    "recipe",
    "weather",
    "python code",
    "javascript code",
    "math problem",
    "capital of",
    "who won the",
  ];
  if (outOfDomainKeywords.some((k) => q.includes(k))) {
    return "OutOfDomain";
  }

  // Action intents (trading / betting requests)
  if (
    q.startsWith("buy ") ||
    q.startsWith("sell ") ||
    q.includes("place bet") ||
    q.includes("create duel") ||
    q.includes("reset journal")
  ) {
    return "Action";
  }

  const sqlKeywords = [
    "portfolio",
    "holding",
    "wallet",
    "balance",
    "coins",
    "trade",
    "bought",
    "sold",
    "bet",
    "duel",
    "streak",
    "steps",
    "log",
    "history",
    "pnl",
    "loss",
    "profit",
    "gain",
    "summary",
    "habit",
    "chart",
    "trend",
  ];

  const knowledgeKeywords = [
    "explain",
    "how to",
    "what is",
    "formula",
    "rules",
    "guide",
    "faq",
    "how do",
    "definition",
    "index",
    "meaning",
  ];

  const hasSql = sqlKeywords.some((k) => q.includes(k));
  const hasKnowledge = knowledgeKeywords.some((k) => q.includes(k));

  if (hasSql && hasKnowledge) return "Mixed";
  if (hasSql) return "SQL";
  if (hasKnowledge) return "Knowledge";

  return "General";
}
