import React from "react";

export function DashboardStatCard({
  icon,
  label,
  value,
  sub,
  progress,
  accent,
  subPositive,
  subNegative,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  accent?: boolean;
  subPositive?: boolean;
  subNegative?: boolean;
}) {
  return (
    <div
      className={`surface-card relative overflow-hidden p-6 transition-shadow hover:shadow-[var(--shadow-card)] ${accent ? "bg-foreground text-background" : ""}`}
    >
      <div
        className={`flex items-center gap-2 text-xs ${accent ? "text-background/70" : "text-muted-foreground"}`}
      >
        {icon}
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub && (
        <p
          className={`mt-1 text-xs ${
            subPositive
              ? "text-[color:var(--success)] font-medium"
              : subNegative
                ? "text-destructive font-medium"
                : accent
                  ? "text-background/70"
                  : "text-muted-foreground"
          }`}
        >
          {sub}
        </p>
      )}
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[color:var(--brand)] transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}
