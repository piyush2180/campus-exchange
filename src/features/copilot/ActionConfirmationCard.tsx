import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionConfirmationCardProps {
  actionDescription: string;
  details?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActionConfirmationCard({
  actionDescription,
  details,
  onConfirm,
  onCancel,
}: ActionConfirmationCardProps) {
  return (
    <div className="my-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
      <div className="flex items-start gap-2 text-amber-500 text-xs font-semibold">
        <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">{actionDescription}</p>
          {details && <p className="mt-1 text-xs text-muted-foreground font-normal">{details}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs gap-1">
          <X className="h-3 w-3" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="h-7 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
        >
          <Check className="h-3 w-3" />
          Confirm Action
        </Button>
      </div>
    </div>
  );
}
