import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionButtonsProps {
  actions?: Array<{ label: string; route: string }>;
  onActionClick?: () => void;
}

export function QuickActionButtons({ actions, onActionClick }: QuickActionButtonsProps) {
  const navigate = useNavigate();

  if (!actions || actions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((act) => (
        <Button
          key={act.route}
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 bg-card/80 hover:bg-muted border-border/80 text-foreground"
          onClick={() => {
            navigate({ to: act.route as any });
            if (onActionClick) onActionClick();
          }}
        >
          {act.label}
          <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
        </Button>
      ))}
    </div>
  );
}
