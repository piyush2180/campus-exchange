import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Activity, BedDouble, Footprints, Smile, Inbox } from "lucide-react";

interface WellnessChartDataItem {
  dateFormatted: string;
  activity_score: number;
  sleep: number;
  water: number;
  steps: number;
  mood: number;
}

interface WellnessChartsSectionProps {
  chartData: WellnessChartDataItem[];
}

export function WellnessChartsSection({ chartData }: WellnessChartsSectionProps) {
  if (chartData.length < 2) {
    return (
      <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
        <Inbox className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Log at least 2 days of wellness check-ins to generate chart analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Activity Score over time */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          Activity Score Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="dateFormatted"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#313244",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#cdd6f4", fontWeight: "bold" }}
              />
              <Area
                type="monotone"
                dataKey="activity_score"
                stroke="var(--brand)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreColor)"
                name="Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep and Water levels */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <BedDouble className="h-4 w-4" />
          Sleep Hours vs. Water Intake
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="dateFormatted"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#313244",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#cdd6f4", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#f38ba8"
                strokeWidth={2.5}
                name="Sleep (Hours)"
              />
              <Line
                type="monotone"
                dataKey="water"
                stroke="#89b4fa"
                strokeWidth={2.5}
                name="Water (Liters)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Steps over time */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Footprints className="h-4 w-4" />
          Daily Step Count
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="dateFormatted"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#313244",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#cdd6f4", fontWeight: "bold" }}
                formatter={(value) => Number(value).toLocaleString()}
              />
              <Bar dataKey="steps" fill="var(--brand)" radius={[4, 4, 0, 0]} name="Steps" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Over Time */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Smile className="h-4 w-4" />
          Mood Index Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="dateFormatted"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 5]}
                tickCount={5}
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  borderColor: "#313244",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#cdd6f4", fontWeight: "bold" }}
                formatter={(val) => {
                  if (val === 1) return "😢 Tired";
                  if (val === 2) return "😐 Okay";
                  if (val === 3) return "🙂 Good";
                  if (val === 4) return "😄 Great";
                  return "🤩 Amazing";
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#a6e3a1"
                strokeWidth={2.5}
                name="Mood"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
