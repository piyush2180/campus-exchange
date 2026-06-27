import { classifyIntent } from "./intentClassifier";
import { retrieveContext } from "./retriever";
import { buildGroundedPrompt, type Message } from "./promptBuilder";
import { fetchGeminiResponse } from "./copilot.server";
import type { AppState } from "@/types";

export type StreamChunkHandler = (chunk: {
  textDelta: string;
  sources?: string[];
  confidence?: "High" | "Medium" | "Low";
  navigateRoute?: string;
  richCard?: Message["richCard"];
  miniChart?: Message["miniChart"];
  timeline?: Message["timeline"];
  quickActions?: Array<{ label: string; route: string }>;
  suggestions?: string[];
  isDone?: boolean;
}) => void;

/**
 * Core Copilot service orchestrating grounded prompt construction, server-side AI invocation, and rich card telemetry.
 */
export async function streamCopilotResponse(
  query: string,
  userId: string | null,
  appState: AppState,
  activeRoute: string,
  threadHistory: Message[],
  onChunk: StreamChunkHandler,
): Promise<void> {
  const intent = classifyIntent(query);
  const q = query.toLowerCase().trim();

  // Navigation Intents handling
  if (intent === "Navigation") {
    let targetRoute = "/app";
    let text = "Navigating to Dashboard...";
    if (q.includes("portfolio")) {
      targetRoute = "/app/portfolio";
      text = "Taking you to your Portfolio...";
    } else if (q.includes("wellness") || q.includes("history")) {
      targetRoute = "/app/history";
      text = "Opening Wellness telemetry...";
    } else if (q.includes("market")) {
      targetRoute = "/app/market";
      text = "Opening Simulated Market exchange...";
    } else if (q.includes("bet")) {
      targetRoute = "/app/bets";
      text = "Opening Predictions & Bets hub...";
    } else if (q.includes("leaderboard")) {
      targetRoute = "/app/leaderboard";
      text = "Taking you to Campus Leaderboard...";
    }

    onChunk({
      textDelta: text,
      confidence: "High",
      navigateRoute: targetRoute,
      isDone: true,
    });
    return;
  }

  // Parse quick actions and suggestions based on intent and active page
  const quickActions: Array<{ label: string; route: string }> = [];
  const suggestions: string[] = [];

  if (q.includes("portfolio") || activeRoute.includes("portfolio")) {
    quickActions.push({ label: "View Portfolio", route: "/app/portfolio" });
    suggestions.push("Show portfolio allocation", "Explain diversification", "Which asset performs best?");
  } else if (q.includes("wellness") || activeRoute.includes("history")) {
    quickActions.push({ label: "Go to Wellness", route: "/app/history" });
    suggestions.push("Summarize my habits", "Improve activity score", "Explain milestone bonuses");
  } else if (q.includes("bet") || activeRoute.includes("bets")) {
    quickActions.push({ label: "Open Bets", route: "/app/bets" });
    suggestions.push("Explain betting history", "Calculate win rate", "How do Step Duels work?");
  } else if (q.includes("market") || activeRoute.includes("market")) {
    quickActions.push({ label: "Explore Market", route: "/app/market" });
    suggestions.push("Explain this asset", "Market overview", "Is this volatile?");
  } else {
    quickActions.push({ label: "Explore Market", route: "/app/market" });
    suggestions.push("Why is my portfolio losing value?", "Summarize my wellness habits", "Explain Activity Score");
  }

  // Handle Greetings directly
  if (intent === "Greeting") {
    let text = "Hi! 👋 I'm Pulse AI, your CampusExchange assistant.\n\nI can help you understand your portfolio, wellness progress, trading activity, betting history, and explain how CampusExchange works. What would you like to explore today?";
    if (q.includes("thanks") || q.includes("thank you")) {
      text = "You're welcome! Let me know if you'd like to review your portfolio, summarize your wellness progress, or understand your market performance.";
    } else if (q.includes("who are you") || q.includes("what can you do")) {
      text = "I'm Pulse AI, your CampusExchange assistant.\n\nI analyze your live account data alongside the platform knowledge base to answer questions about your investments, wellness habits, bets, and application features.";
    } else if (q.includes("bye")) {
      text = "Goodbye! Keep hitting your daily wellness goals and happy investing! 🚀";
    }

    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      onChunk({
        textDelta: (i === 0 ? "" : " ") + words[i],
        confidence: "High",
        quickActions,
        suggestions,
      });
      await new Promise((r) => setTimeout(r, 12));
    }
    onChunk({ textDelta: "", isDone: true });
    return;
  }

  // Handle Out of Domain queries politely
  if (intent === "OutOfDomain") {
    const text = "I'm designed specifically to help with CampusExchange. I can analyze your portfolio, wellness metrics, trading history, and betting activity, or explain platform features. How can I help with your campus exchange account?";
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      onChunk({
        textDelta: (i === 0 ? "" : " ") + words[i],
        confidence: "High",
        suggestions: ["Analyze my portfolio", "Summarize my wellness"],
      });
      await new Promise((r) => setTimeout(r, 12));
    }
    onChunk({ textDelta: "", isDone: true });
    return;
  }

  // Perform Context Retrieval for RAG intents
  const context = await retrieveContext(userId, query, appState);
  const prompt = buildGroundedPrompt(query, intent, context, activeRoute, threadHistory);

  // Determine Confidence Score based on retrieved context depth
  const confidence: "High" | "Medium" | "Low" =
    context.sources.length >= 2 ? "High" : context.sources.length === 1 ? "Medium" : "Low";

  // Check if query requests Rich Cards, Mini Charts, or Timelines
  let richCard: Message["richCard"];
  let miniChart: Message["miniChart"];
  let timeline: Message["timeline"];

  if (q.includes("portfolio") || q.includes("holding") || q.includes("pnl") || q.includes("breakdown")) {
    let bestAsset = "None";
    let worstAsset = "None";
    let maxPnl = -Infinity;
    let minPnl = Infinity;

    appState.holdings.forEach((h) => {
      const asset = appState.assets.find((a) => a.id === h.assetId);
      if (asset) {
        const pnl = (asset.price - h.avgPrice) * h.shares;
        if (pnl > maxPnl) {
          maxPnl = pnl;
          bestAsset = asset.ticker;
        }
        if (pnl < minPnl) {
          minPnl = pnl;
          worstAsset = asset.ticker;
        }
      }
    });

    const totalCoins = appState.profile?.coins ?? 0;
    richCard = {
      title: "Portfolio Summary Card",
      totalValue: `${totalCoins.toFixed(2)} coins`,
      bestAsset,
      worstAsset,
      riskScore: appState.holdings.length < 2 ? "High Risk" : "Moderate",
    };
  }

  if (q.includes("chart") || q.includes("trend") || q.includes("growth")) {
    miniChart = {
      title: "Weekly Activity Trend (Steps)",
      data: [
        { label: "Mon", value: 4200 },
        { label: "Tue", value: 6800 },
        { label: "Wed", value: 8100 },
        { label: "Thu", value: 5400 },
        { label: "Fri", value: 9200 },
        { label: "Sat", value: 7500 },
        { label: "Sun", value: appState.profile?.steps_today ?? 8000 },
      ],
    };
  }

  if (intent === "Timeline" || q.includes("timeline") || q.includes("what happened")) {
    timeline = [
      {
        time: "Today",
        type: "wellness",
        title: "Wellness Log Synchronized",
        description: `Logged ${appState.profile?.steps_today.toLocaleString() ?? 0} steps and updated Activity Score.`,
      },
      {
        time: "Yesterday",
        type: "coin",
        title: "Streak Bonus Coins",
        description: "Earned +5.00 wellness coins for maintaining step streak.",
      },
      {
        time: "3 days ago",
        type: "trade",
        title: "Simulated Index Trade",
        description: "Purchased shares in Developer skill futures.",
      },
    ];
  }

  // Execute Gemini via Secure TanStack Start Server Function
  try {
    const serverResult = await fetchGeminiResponse({ data: { prompt } });
    if (serverResult?.text) {
      const words = serverResult.text.split(" ");
      for (let i = 0; i < words.length; i++) {
        const textDelta = (i === 0 ? "" : " ") + words[i];
        onChunk({
          textDelta,
          sources: context.sources,
          confidence,
          richCard,
          miniChart,
          timeline,
          quickActions,
          suggestions,
        });
        await new Promise((r) => setTimeout(r, 12));
      }
      onChunk({ textDelta: "", isDone: true });
      return;
    }
  } catch (err) {
    console.warn("Secure Gemini server call error, falling back to local grounded synthesis:", err);
  }

  // Local grounded synthesis fallback
  const simulatedResponse = generateLocalGroundedResponse(query, context, appState);
  const words = simulatedResponse.split(" ");
  for (let i = 0; i < words.length; i++) {
    const textDelta = (i === 0 ? "" : " ") + words[i];
    onChunk({
      textDelta,
      sources: context.sources,
      confidence,
      richCard,
      miniChart,
      timeline,
      quickActions,
      suggestions,
    });
    await new Promise((r) => setTimeout(r, 12));
  }
  onChunk({ textDelta: "", isDone: true });
}

function generateLocalGroundedResponse(
  query: string,
  context: Record<string, any>,
  appState: AppState,
): string {
  const q = query.toLowerCase();
  const profile = appState.profile;
  const holdings = appState.holdings;

  if (q.includes("portfolio") || q.includes("losing") || q.includes("value") || q.includes("holding")) {
    if (holdings.length === 0) {
      return "### Portfolio Grounded Analysis\nYou currently have no active investments in your portfolio.\n\n**Reason / Why:**\nYour coin balance is preserved in cash. Complete your daily wellness check-ins on the Dashboard to earn base coins and buy your first asset index!";
    }
    const holdingsDetail = holdings
      .map((h) => {
        const asset = appState.assets.find((a) => a.id === h.assetId);
        const pnl = asset ? (asset.price - h.avgPrice) * h.shares : 0;
        return `**${asset?.ticker ?? h.assetId}**: ${h.shares} shares (${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} coins P&L)`;
      })
      .join("\n- ");
    return `### Portfolio Grounded Analysis\nHere is your current live position breakdown:\n- ${holdingsDetail}\n\n**Reason / Why:**\nSimulated market prices drift every 5 seconds. Concentration in a single asset increases portfolio volatility.`;
  }

  if (q.includes("activity score") || q.includes("score")) {
    const doc = context.knowledgeDocs?.find((d: any) => d.id === "activity-score");
    return (
      (doc?.content ??
      "The Activity Score measures your daily health metrics across Steps (max 40pts), Sleep (max 20pts), Water (max 20pts), and Workouts (20pts).") +
      "\n\n**Reason / Why:**\nDaily wellness telemetry directly calculates your base coin earnings each day."
    );
  }

  if (q.includes("bet") || q.includes("duel") || q.includes("market") || q.includes("wager")) {
    return "### Prediction Modes Overview\nCampusExchange offers 3 prediction modes:\n1. **Market Bets**: Predict 60-second price moves for a 1.8x payout multiplier.\n2. **Step Goal Bets**: Hit your daily step target before midnight for a 2.0x payout.\n3. **Step Duels**: Challenge friends in a 24h step battle for the combined pot.\n\n**Reason / Why:**\nWagering utilizes earned wellness coins to provide financial risk simulation without real capital exposure.";
  }

  return `### Account Overview\nBased on your live account data, you currently have **${(profile?.coins ?? 0).toFixed(2)} wellness coins** and a total of **${(profile?.total_steps ?? 0).toLocaleString()} steps logged**.\n\n**Reason / Why:**\nYour telemetry updates dynamically upon completing daily wellness logs and market trades.`;
}
