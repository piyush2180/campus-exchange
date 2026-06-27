import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence?: "High" | "Medium" | "Low";
}

export function ConfidenceBadge({ confidence = "High" }: ConfidenceBadgeProps) {
  const getStyle = () => {
    switch (confidence) {
      case "High":
        return {
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "Medium":
        return {
          icon: <AlertCircle className="h-3 w-3 text-amber-400" />,
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "Low":
        return {
          icon: <HelpCircle className="h-3 w-3 text-muted-foreground" />,
          bg: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${style.bg}`}
      title={`${confidence} Confidence response based on retrieved telemetry depth.`}
    >
      {style.icon}
      {confidence} Confidence
    </span>
  );
}
