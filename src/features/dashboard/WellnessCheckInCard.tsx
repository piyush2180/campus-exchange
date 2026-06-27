import React from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WellnessLog } from "@/types";

interface WellnessCheckInCardProps {
  todayLog?: WellnessLog;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleStartEdit: () => void;
  currentStreak: number;
  steps: string;
  setSteps: (val: string) => void;
  sleep: string;
  setSleep: (val: string) => void;
  water: string;
  setWater: (val: string) => void;
  workout: boolean;
  setWorkout: (val: boolean) => void;
  mood: number;
  setMood: (val: number) => void;
  journal: string;
  setJournal: (val: string) => void;
  submitting: boolean;
  handleCheckInSubmit: (e: React.FormEvent) => void;
}

export function WellnessCheckInCard({
  todayLog,
  isEditing,
  setIsEditing,
  handleStartEdit,
  currentStreak,
  steps,
  setSteps,
  sleep,
  setSleep,
  water,
  setWater,
  workout,
  setWorkout,
  mood,
  setMood,
  journal,
  setJournal,
  submitting,
  handleCheckInSubmit,
}: WellnessCheckInCardProps) {
  if (todayLog && !isEditing) {
    return (
      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-muted">
              <svg className="absolute -rotate-90 h-24 w-24">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  className="stroke-[color:var(--brand)] fill-none"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - todayLog.activity_score / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-bold tracking-tight">{todayLog.activity_score}</span>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Score
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Today's check-in logged{" "}
                  <CheckCircle className="h-5 w-5 text-[color:var(--success)]" />
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                You earned{" "}
                <strong className="text-foreground">
                  +{todayLog.coins_earned.toFixed(2)} coins
                </strong>{" "}
                from this log.
              </p>
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-[color:var(--brand)] fill-[color:var(--brand)]/10" />
                Active streak:{" "}
                <strong>
                  {currentStreak} {currentStreak === 1 ? "day" : "days"}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleStartEdit}>
              Edit Today's Log
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/history">View History & Charts</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border bg-muted/20 px-6 py-6 md:grid-cols-5 md:px-8">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Steps
            </p>
            <p className="text-lg font-bold tabular-nums">{todayLog.steps.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Sleep
            </p>
            <p className="text-lg font-bold tabular-nums">{todayLog.sleep} hours</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Water
            </p>
            <p className="text-lg font-bold tabular-nums">{todayLog.water} L</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Workout
            </p>
            <p className="text-lg font-bold">{todayLog.workout ? "Yes ✅" : "No ❌"}</p>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Mood
            </p>
            <p className="text-lg font-bold">
              {todayLog.mood === 1 && "😢 Tired"}
              {todayLog.mood === 2 && "😐 Okay"}
              {todayLog.mood === 3 && "🙂 Good"}
              {todayLog.mood === 4 && "😄 Great"}
              {todayLog.mood === 5 && "🤩 Amazing"}
            </p>
          </div>
        </div>
        {todayLog.journal && (
          <div className="border-t border-border bg-muted/40 px-6 py-4 md:px-8 text-sm">
            <span className="font-semibold text-xs text-muted-foreground uppercase block mb-1">
              Journal Notes
            </span>
            <p className="text-muted-foreground italic">"{todayLog.journal}"</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="surface-card p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit Today's Wellness Check-In" : "Daily Wellness Check-In"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update your health metrics for today. Your Activity Score and coins will adjust automatically."
              : "Log your health metrics for today to calculate your Activity Score and earn coins."}
          </p>
        </div>
        {isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleCheckInSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="steps" className="text-sm font-medium">
              Steps Today
            </Label>
            <div className="relative">
              <Input
                id="steps"
                type="number"
                placeholder="e.g. 8000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="pr-16"
                min={0}
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">steps</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleep" className="text-sm font-medium">
              Sleep Hours
            </Label>
            <div className="relative">
              <Input
                id="sleep"
                type="number"
                step="0.1"
                placeholder="e.g. 7.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="pr-16"
                min={0}
                max={24}
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">hours</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="water" className="text-sm font-medium">
              Water Intake
            </Label>
            <div className="relative">
              <Input
                id="water"
                type="number"
                step="0.1"
                placeholder="e.g. 2.5"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="pr-16"
                min={0}
                max={20}
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">liters</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Completed a workout?</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWorkout(true)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  workout
                    ? "bg-foreground text-background border-foreground shadow-[var(--shadow-card)]"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWorkout(false)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  !workout
                    ? "bg-foreground text-background border-foreground shadow-[var(--shadow-card)]"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">How is your mood today?</Label>
            <div className="flex justify-between gap-2">
              {[
                { score: 1, emoji: "😢", label: "Tired" },
                { score: 2, emoji: "😐", label: "Okay" },
                { score: 3, emoji: "🙂", label: "Good" },
                { score: 4, emoji: "😄", label: "Great" },
                { score: 5, emoji: "🤩", label: "Amazing" },
              ].map((m) => (
                <button
                  key={m.score}
                  type="button"
                  onClick={() => setMood(m.score)}
                  title={m.label}
                  className={`flex-1 py-2 rounded-lg border text-lg transition-all ${
                    mood === m.score
                      ? "bg-card border-[color:var(--brand)] scale-110 shadow-[0_0_12px_rgba(var(--brand-rgb),0.2)] text-[color:var(--brand)] font-bold"
                      : "bg-card border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal" className="text-sm font-medium">
            Daily Notes / Journal Entry (Optional)
          </Label>
          <Textarea
            id="journal"
            placeholder="How was your day? Any reflections or details?"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="min-h-[80px]"
            maxLength={500}
          />
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Submitting Check-In..." : "Submit Today's Log"}
        </Button>
      </form>
    </div>
  );
}
