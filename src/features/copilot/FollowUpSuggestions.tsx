import { Sparkles } from "lucide-react";

interface FollowUpSuggestionsProps {
  suggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSelectSuggestion }: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-2.5 w-2.5 text-[color:var(--brand)]" />
        Suggested follow-ups
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSelectSuggestion(s)}
            className="rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground border border-border/60 hover:border-[color:var(--brand)] hover:text-foreground transition-all text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
