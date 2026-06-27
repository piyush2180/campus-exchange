import { Sparkles, Bot } from "lucide-react";

interface SuggestedPromptsProps {
  userName?: string;
  activeRoute?: string;
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({
  userName = "User",
  activeRoute = "",
  onSelectPrompt,
}: SuggestedPromptsProps) {
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getRoutePrompts = (): string[] => {
    if (activeRoute.includes("portfolio")) {
      return [
        "Analyze my portfolio",
        "Diversification advice",
        "Which asset performs best?",
        "Why is my portfolio losing value?",
      ];
    }
    if (activeRoute.includes("market")) {
      return [
        "Explain market simulation",
        "Market overview",
        "What are seed assets?",
        "How does drift momentum work?",
      ];
    }
    if (activeRoute.includes("history")) {
      return [
        "Analyze my wellness habits",
        "Sleep trends summary",
        "How do I improve Activity Score?",
        "Explain coin milestone bonuses",
      ];
    }
    if (activeRoute.includes("bets")) {
      return [
        "Show my betting history",
        "Explain Market Bets",
        "How do Step Duels work?",
        "What are Step Goal wagers?",
      ];
    }
    if (activeRoute.includes("leaderboard")) {
      return [
        "Compare my ranking",
        "Improvement suggestions",
        "How is leaderboard computed?",
        "Top wellness performers",
      ];
    }

    return [
      "Why is my portfolio losing value?",
      "Summarize my wellness this week",
      "Explain Activity Score",
      "Show my recent bets",
    ];
  };

  const prompts = getRoutePrompts();

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl surface-card p-5 space-y-2 border-l-4 border-l-[color:var(--brand)]">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <Bot className="h-5 w-5 text-[color:var(--brand)]" />
          {getGreetingTime()}, {userName} 👋
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          I'm <strong>Pulse AI</strong>. I can analyze your portfolio, wellness metrics, trading
          activity, and betting performance in real time.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          Try Asking
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onSelectPrompt(p)}
              className="surface-card p-3 text-left text-xs font-medium text-foreground hover:border-[color:var(--brand)] transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
