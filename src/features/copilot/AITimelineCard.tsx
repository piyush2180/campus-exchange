import { Calendar, Activity, Coins, Flame, ShoppingBag } from "lucide-react";

interface TimelineEvent {
  time: string;
  type: "trade" | "wellness" | "bet" | "coin";
  title: string;
  description: string;
}

interface AITimelineCardProps {
  events: TimelineEvent[];
}

export function AITimelineCard({ events }: AITimelineCardProps) {
  if (!events || events.length === 0) return null;

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "trade":
        return <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />;
      case "wellness":
        return <Activity className="h-3.5 w-3.5 text-sky-400" />;
      case "bet":
        return <Flame className="h-3.5 w-3.5 text-amber-400" />;
      case "coin":
        return <Coins className="h-3.5 w-3.5 text-yellow-400" />;
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-card/90 p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border/60 pb-2">
        <Calendar className="h-4 w-4 text-[color:var(--brand)]" />
        Activity Timeline
      </div>
      <div className="space-y-2.5">
        {events.map((ev, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-muted mt-0.5">
              {getEventIcon(ev.type)}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{ev.title}</p>
                <span className="text-[10px] text-muted-foreground">{ev.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
