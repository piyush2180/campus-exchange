import { Database, BookOpen, Activity, PieChart, Flame } from "lucide-react";

interface MessageSourcesProps {
  sources: string[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  if (!sources || sources.length === 0) return null;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Portfolio":
        return <PieChart className="h-3 w-3 text-emerald-400" />;
      case "Wellness Logs":
        return <Activity className="h-3 w-3 text-sky-400" />;
      case "Bets":
        return <Flame className="h-3 w-3 text-amber-400" />;
      case "Knowledge Base":
      case "Platform Guide":
        return <BookOpen className="h-3 w-3 text-purple-400" />;
      default:
        return <Database className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
      <span className="font-medium mr-1">Sources:</span>
      {sources.map((src) => (
        <span
          key={src}
          className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium border border-border/40"
        >
          {getSourceIcon(src)}
          {src}
        </span>
      ))}
    </div>
  );
}
