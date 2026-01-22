import { useCallback, useRef, useState, useEffect } from "react";

interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}

const STORAGE_KEY = "sublime-presence-stats";

const getDefaultStats = (): SessionStats => ({
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
});

export const useSessionTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(5 * 60); // 5 minutes default
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState<SessionStats>(getDefaultStats);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStats(parsed);
      } catch {}
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: SessionStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  // Play gentle completion bell
  const playCompletionBell = useCallback(() => {
    const ctx = audioContextRef.current || new AudioContext();
    audioContextRef.current = ctx;

    if (ctx.state === "suspended") ctx.resume();

    // Create a gentle bell sound
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3 + i * 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 4);
    });
  }, []);

  // Update streak logic
  const updateStreak = useCallback((currentStats: SessionStats): SessionStats => {
    const today = new Date().toDateString();
    const lastDate = currentStats.lastSessionDate;

    let newStreak = currentStats.currentStreak;

    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate === today) {
      // Same day, keep streak
    } else {
      const last = new Date(lastDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = currentStats.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    return {
      ...currentStats,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, currentStats.longestStreak),
      lastSessionDate: today,
    };
  }, []);

  // Complete session
  const completeSession = useCallback(() => {
    if (!sessionStartRef.current) return;

    const sessionMinutes = Math.ceil(elapsedTime / 60);

    const newStats = updateStreak({
      ...stats,
      totalSessions: stats.totalSessions + 1,
      totalMinutes: stats.totalMinutes + sessionMinutes,
    });

    saveStats(newStats);
    playCompletionBell();

    setIsActive(false);
    setIsPaused(false);
    setElapsedTime(0);
    setTimeRemaining(duration);
    sessionStartRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [duration, elapsedTime, playCompletionBell, saveStats, stats, updateStreak]);

  // Start timer
  const startSession = useCallback((minutes?: number) => {
    const totalSeconds = minutes ? minutes * 60 : duration;
    setDuration(totalSeconds);
    setTimeRemaining(totalSeconds);
    setElapsedTime(0);
    setIsActive(true);
    setIsPaused(false);
    sessionStartRef.current = new Date();

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [duration, completeSession]);

  // Pause timer
  const pauseSession = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Resume timer
  const resumeSession = useCallback(() => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [completeSession]);

  // Stop timer
  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setElapsedTime(0);
    setTimeRemaining(duration);
    sessionStartRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [duration]);

  // Add time
  const addTime = useCallback((seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
    setDuration(prev => prev + seconds);
  }, []);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  return {
    isActive,
    isPaused,
    duration,
    timeRemaining,
    elapsedTime,
    stats,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    addTime,
    formatTime,
    setDuration: (mins: number) => {
      setDuration(mins * 60);
      if (!isActive) setTimeRemaining(mins * 60);
    },
  };
};
