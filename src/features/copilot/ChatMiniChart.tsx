import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface ChatMiniChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

export function ChatMiniChart({ title, data }: ChatMiniChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="my-3 rounded-2xl border border-border bg-card/90 p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              stroke="currentColor"
              className="text-[10px] text-muted-foreground"
              tickLine={false}
            />
            <YAxis
              stroke="currentColor"
              className="text-[10px] text-muted-foreground"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                fontSize: "11px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--brand)"
              fillOpacity={1}
              fill="url(#miniGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
