import { useCallback, useEffect, useState } from "react";
import type { WellnessLog } from "@/types";
import { fetchWellnessLogs, submitWellnessCheckIn } from "@/services/wellness.service";

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
      if (logs.some((l) => l.date === todayStr)) {
        return { ok: false, error: "You have already completed your daily check-in today." };
      }

      try {
        const result = await submitWellnessCheckIn({
          date: todayStr,
          steps,
          sleep,
          water,
          workout,
          mood,
          journal: journal.trim() || null,
        });
        await refresh();
        if (onCoinsUpdated) onCoinsUpdated();
        return {
          ok: true,
          activityScore: result.activity_score,
          coinsEarned: result.total_coins,
          rewards: result,
        };
      } catch (err: unknown) {
        console.error("Error submitting daily wellness check-in:", err);
        const errorObj = err as { message?: string };
        return { ok: false, error: errorObj?.message || "Failed to submit check-in" };
      }
    },
    [userId, logs, refresh, onCoinsUpdated],
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

      try {
        // Same function as a new check-in: it upserts the day and credits only the coin difference
        const result = await submitWellnessCheckIn({
          date: existingLog.date,
          steps,
          sleep,
          water,
          workout,
          mood,
          journal: journal.trim() || null,
        });
        await refresh();
        if (onCoinsUpdated) onCoinsUpdated();
        return {
          ok: true,
          activityScore: result.activity_score,
          coinsEarned: result.total_coins,
          coinDelta: result.coin_delta,
        };
      } catch (err: unknown) {
        console.error("Error updating daily wellness check-in:", err);
        const errorObj = err as { message?: string };
        return { ok: false, error: errorObj?.message || "Failed to update check-in" };
      }
    },
    [userId, logs, refresh, onCoinsUpdated],
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
