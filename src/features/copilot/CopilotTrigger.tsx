import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopilotTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function CopilotTrigger({ isOpen, onToggle }: CopilotTriggerProps) {
  return (
    <Button
      variant={isOpen ? "secondary" : "outline"}
      size="sm"
      onClick={onToggle}
      className={`gap-1.5 font-medium transition-all ${
        isOpen
          ? "border-[color:var(--brand)] text-[color:var(--brand)]"
          : "hover:border-[color:var(--brand)]"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
      <span className="text-xs">Pulse AI</span>
    </Button>
  );
}
