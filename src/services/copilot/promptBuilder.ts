import type { RetrievedContext } from "./retriever";
import type { CopilotIntent } from "./intentClassifier";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  confidence?: "High" | "Medium" | "Low";
  navigateRoute?: string;
  richCard?: {
    title: string;
    totalValue: string;
    bestAsset: string;
    worstAsset: string;
    riskScore: string;
  };
  miniChart?: {
    title: string;
    data: Array<{ label: string; value: number }>;
  };
  timeline?: Array<{
    time: string;
    type: "trade" | "wellness" | "bet" | "coin";
    title: string;
    description: string;
  }>;
  quickActions?: Array<{ label: string; route: string }>;
  suggestions?: string[];
  feedback?: "up" | "down";
};

export function buildGroundedPrompt(
  query: string,
  intent: CopilotIntent,
  context: RetrievedContext,
  activeRoute: string,
  threadHistory: Message[],
): string {
  const pageContextName = activeRoute.includes("portfolio")
    ? "Portfolio Page"
    : activeRoute.includes("market")
      ? "Market Page"
      : activeRoute.includes("history")
        ? "Wellness History Page"
        : activeRoute.includes("bets")
          ? "Bets Page"
          : activeRoute.includes("leaderboard")
            ? "Leaderboard Page"
            : activeRoute.includes("profile")
              ? "Profile Page"
              : "Dashboard Page";

  const historyText = threadHistory
    .slice(-4)
    .map((m) => `${m.role === "user" ? "User" : "Pulse AI"}: ${m.content}`)
    .join("\n");

  const knowledgeText = context.knowledgeDocs
    .map((d) => `### ${d.title}\n${d.content}`)
    .join("\n\n");

  const sqlDataText =
    Object.keys(context.sqlData).length > 0
      ? JSON.stringify(context.sqlData, null, 2)
      : "No specific relational data required for this query.";

  return `You are Pulse AI, an intelligent, grounded financial & wellness copilot integrated inside the CampusExchange platform.

CRITICAL INSTRUCTIONS:
1. You MUST maintain the persona of Pulse AI—an intelligent assistant built specifically for CampusExchange. Never refer to yourself as ChatGPT, Gemini, or a general AI.
2. Ground all answers strictly in the provided User SQL Data and Platform Knowledge Base. Never hallucinate fake application facts or fictitious user numbers.
3. Keep answers concise, direct, helpful, and beautifully formatted using standard Markdown (lists, bold text, tables, headings).
4. Whenever giving advice or recommendations, include a clear **Reason / Why** callout explaining the exact user data behind the recommendation.
5. The user is currently viewing the ${pageContextName} (route: ${activeRoute}). Interpret ambiguous questions like "Explain this" or "Why is this happening?" in the context of the ${pageContextName}.

INTENT CLASSIFICATION: ${intent}

USER RELATIONAL DATA (SQL Context):
\`\`\`json
${sqlDataText}
\`\`\`

PLATFORM KNOWLEDGE BASE:
${knowledgeText}

RECENT CONVERSATION THREAD:
${historyText || "No previous history."}

USER QUERY:
"${query}"

Provide your grounded response as Pulse AI:`;
}
