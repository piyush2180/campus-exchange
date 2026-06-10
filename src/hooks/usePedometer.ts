import { useCallback, useEffect, useRef, useState } from "react";

// Lightweight peak-detection step counter using DeviceMotion accelerometer.
// Note: only works while the app/tab is visible and the screen is on.
// True 24h passive tracking requires a native app — explained to user in UI.

type Status = "idle" | "requesting" | "running" | "denied" | "unsupported";

// Stricter thresholds — previously the algorithm fired on tiny vibrations
// (phone on a desk, scrolling, etc.), which made step count tick every second.
// We now require a much larger acceleration spike AND a clean rest between steps.
const PEAK_THRESHOLD = 1.45; // g-force a real step produces (≈ +0.4-0.6 g over 1g rest)
const REST_THRESHOLD = 1.05; // must drop near 1g (gravity) between steps
const MIN_STEP_INTERVAL = 350; // ms between steps (≈ max 2.8 steps/sec — natural cadence)
const MAX_STEP_INTERVAL = 2000; // if no rest seen for 2s, ignore — likely noise/idle

export function usePedometer(onStep?: (totalSinceStart: number) => void) {
  const [status, setStatus] = useState<Status>("idle");
  const [steps, setSteps] = useState(0);
  const lastPeakRef = useRef(0);
  const lastMagRef = useRef(1);
  const goingUpRef = useRef(false);
  const stepsRef = useRef(0);
  const onStepRef = useRef(onStep);

  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
    const mag =
      Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z) / 9.81;
    const now = performance.now();

    // Require: device must be at rest (~1g) THEN spike above PEAK_THRESHOLD.
    // Without the rest gate, phones on a desk register micro-vibrations as steps.
    if (!goingUpRef.current && mag > PEAK_THRESHOLD && lastMagRef.current < REST_THRESHOLD) {
      goingUpRef.current = true;
    } else if (goingUpRef.current && mag < REST_THRESHOLD) {
      goingUpRef.current = false;
      const dt = now - lastPeakRef.current;
      // Reject if too fast (noise) OR if no peak for too long (idle then 1 spike = noise)
      if (dt > MIN_STEP_INTERVAL && dt < MAX_STEP_INTERVAL) {
        stepsRef.current += 1;
        setSteps(stepsRef.current);
        onStepRef.current?.(stepsRef.current);
      }
      lastPeakRef.current = now;
    }
    lastMagRef.current = mag;
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setStatus("unsupported");
      return false;
    }
    setStatus("requesting");
    // iOS 13+ requires explicit permission
    const DM = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DM.requestPermission === "function") {
      try {
        const res = await DM.requestPermission();
        if (res !== "granted") {
          setStatus("denied");
          return false;
        }
      } catch {
        setStatus("denied");
        return false;
      }
    }
    window.addEventListener("devicemotion", handleMotion);
    setStatus("running");
    return true;
  }, [handleMotion]);

  const stop = useCallback(() => {
    window.removeEventListener("devicemotion", handleMotion);
    setStatus("idle");
  }, [handleMotion]);

  const reset = useCallback(() => {
    stepsRef.current = 0;
    setSteps(0);
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [handleMotion]);

  return { status, steps, start, stop, reset };
}
