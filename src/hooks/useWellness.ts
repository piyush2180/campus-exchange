import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateActivityScore, calculateCoinsEarned } from "@/lib/store";
import type { WellnessLog } from "@/types";
import {
  fetchWellnessLogs,
  insertWellnessLog,
  updateWellnessLog,
} from "@/services/wellness.service";

export type { WellnessLog };

export function getLocalTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function useWellness(userId: string | null, onCoinsUpdated?: () => void) {
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyComp, setWeeklyComp] = useState(0);
  const [monthlyComp, setMonthlyComp] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const typedLogs = await fetchWellnessLogs(userId);
      setLogs(typedLogs);

      const streaks = calculateStreaks(typedLogs);
      setCurrentStreak(streaks.currentStreak);
      setLongestStreak(streaks.longestStreak);
      setWeeklyComp(streaks.weeklyComp);
      setMonthlyComp(streaks.monthlyComp);
    } catch (err) {
      console.error("Error fetching wellness logs:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const calculateStreaks = (sortedLogs: WellnessLog[]) => {
    if (sortedLogs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, weeklyComp: 0, monthlyComp: 0 };
    }

    const todayStr = getLocalTodayString();
    const loggedDatesSet = new Set(sortedLogs.map((l) => l.date));

    const hasCheckedInToday = loggedDatesSet.has(todayStr);

    const expectedDate = new Date();
    if (!hasCheckedInToday) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    let streakCount = 0;
    let active = true;
    const tempDate = new Date(expectedDate);

    while (active) {
      const year = tempDate.getFullYear();
      const month = String(tempDate.getMonth() + 1).padStart(2, "0");
      const day = String(tempDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (loggedDatesSet.has(dateStr)) {
        streakCount++;
        tempDate.setDate(tempDate.getDate() - 1);
      } else {
        active = false;
      }
    }

    let maxStreak = 0;
    let tempStreak = 0;
    const sortedAsc = Array.from(loggedDatesSet).sort();

    if (sortedAsc.length > 0) {
      let prevDate: Date | null = null;
      for (const dateStr of sortedAsc) {
        const curDate = parseLocalDate(dateStr);
        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const diffTime = Math.abs(curDate.getTime() - prevDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
        prevDate = curDate;
      }
    }

    let weeklyCount = 0;
    let monthlyCount = 0;
    const today = parseLocalDate(todayStr);

    for (const log of sortedLogs) {
      const logDate = parseLocalDate(log.date);
      const diffTime = Math.abs(today.getTime() - logDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 7) weeklyCount++;
      if (diffDays < 30) monthlyCount++;
    }

    const calculatedWeeklyComp = Math.round((weeklyCount / 7) * 100);
    const calculatedMonthlyComp = Math.round((monthlyCount / 30) * 100);

    return {
      currentStreak: streakCount,
      longestStreak: maxStreak,
      weeklyComp: Math.min(100, calculatedWeeklyComp),
      monthlyComp: Math.min(100, calculatedMonthlyComp),
    };
  };

  const getUpcomingMilestone = () => {
    if (currentStreak < 7) return { target: 7, daysLeft: 7 - currentStreak, reward: 50 };
    if (currentStreak < 14) return { target: 14, daysLeft: 14 - currentStreak, reward: 100 };
    return { target: 30, daysLeft: Math.max(0, 30 - currentStreak), reward: 250 };
  };

  const submitCheckIn = useCallback(
    async (
      steps: number,
      sleep: number,
      water: number,
      workout: boolean,
      mood: number,
      journal: string,
    ) => {
      if (!userId) return { ok: false, error: "User not logged in" };

      const todayStr = getLocalTodayString();

      const alreadyCheckedIn = logs.some((l) => l.date === todayStr);
      if (alreadyCheckedIn) {
        return { ok: false, error: "You have already completed your daily check-in today." };
      }

      const activityScore = calculateActivityScore(steps, sleep, water, workout);
      const nextStreak = currentStreak + 1;
      const rewards = calculateCoinsEarned(activityScore, nextStreak);

      try {
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profErr || !prof) throw new Error("Could not find user profile");

        const updatedCoins = +(Number(prof.coins) + rewards.totalCoins).toFixed(2);
        const updatedTotalSteps = prof.total_steps + steps;

        const [logRes, profileRes] = await Promise.all([
          insertWellnessLog({
            user_id: userId,
            date: todayStr,
            steps,
            sleep,
            water,
            workout,
            mood,
            journal: journal.trim() || null,
            activity_score: activityScore,
            coins_earned: rewards.totalCoins,
          }),
          supabase
            .from("profiles")
            .update({
              coins: updatedCoins,
              steps_today: steps,
              total_steps: updatedTotalSteps,
              last_sync: new Date().toISOString(),
            })
            .eq("id", userId),
        ]);

        if (logRes.error) throw logRes.error;
        if (profileRes.error) throw profileRes.error;

        await refresh();
        if (onCoinsUpdated) onCoinsUpdated();

        return {
          ok: true,
          activityScore,
          coinsEarned: rewards.totalCoins,
          rewards,
        };
      } catch (err: unknown) {
        console.error("Error submitting daily wellness check-in:", err);
        const errorObj = err as { code?: string; message?: string };
        const isDuplicate =
          errorObj?.code === "23505" || errorObj?.message?.includes("unique constraint");
        return {
          ok: false,
          error: isDuplicate
            ? "You have already completed your daily check-in today."
            : errorObj?.message ||
              (err instanceof Error ? err.message : "Failed to submit check-in"),
        };
      }
    },
    [userId, logs, currentStreak, refresh, onCoinsUpdated],
  );

  const updateCheckIn = useCallback(
    async (
      logId: string,
      steps: number,
      sleep: number,
      water: number,
      workout: boolean,
      mood: number,
      journal: string,
    ) => {
      if (!userId) return { ok: false, error: "User not logged in" };

      const existingLog = logs.find((l) => l.id === logId);
      if (!existingLog) return { ok: false, error: "Log entry not found" };

      const activityScore = calculateActivityScore(steps, sleep, water, workout);
      const rewards = calculateCoinsEarned(activityScore, currentStreak);

      try {
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profErr || !prof) throw new Error("Could not find user profile");

        const coinDelta = +(rewards.totalCoins - existingLog.coins_earned).toFixed(2);
        const stepsDelta = steps - existingLog.steps;

        const updatedCoins = +(Number(prof.coins) + coinDelta).toFixed(2);
        const updatedTotalSteps = Math.max(0, prof.total_steps + stepsDelta);

        const [logRes, profileRes] = await Promise.all([
          updateWellnessLog(logId, {
            steps,
            sleep,
            water,
            workout,
            mood,
            journal: journal.trim() || null,
            activity_score: activityScore,
            coins_earned: rewards.totalCoins,
            updated_at: new Date().toISOString(),
          }),
          supabase
            .from("profiles")
            .update({
              coins: updatedCoins,
              steps_today: steps,
              total_steps: updatedTotalSteps,
              last_sync: new Date().toISOString(),
            })
            .eq("id", userId),
        ]);

        if (logRes.error) throw logRes.error;
        if (profileRes.error) throw profileRes.error;

        await refresh();
        if (onCoinsUpdated) onCoinsUpdated();

        return {
          ok: true,
          activityScore,
          coinsEarned: rewards.totalCoins,
          coinDelta,
        };
      } catch (err: unknown) {
        console.error("Error updating daily wellness check-in:", err);
        const errorObj = err as { message?: string };
        return {
          ok: false,
          error:
            errorObj?.message || (err instanceof Error ? err.message : "Failed to update check-in"),
        };
      }
    },
    [userId, logs, currentStreak, refresh, onCoinsUpdated],
  );

  return {
    logs,
    loading,
    currentStreak,
    longestStreak,
    weeklyComp,
    monthlyComp,
    getUpcomingMilestone,
    submitCheckIn,
    updateCheckIn,
    refresh,
  };
}
