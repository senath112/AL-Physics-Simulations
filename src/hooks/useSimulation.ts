import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSimulationOptions {
  initialTime?: number;
  initialTimeScale?: number;
  maxTime?: number;
  onStep?: (time: number, dt: number) => void;
}

export function useSimulation(options: UseSimulationOptions = {}) {
  const {
    initialTime = 0,
    initialTimeScale = 1,
    maxTime = Infinity,
    onStep,
  } = options;

  const [time, setTime] = useState(initialTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeScale, setTimeScale] = useState(initialTimeScale);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  
  // Keep callbacks and refs fresh
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const maxTimeRef = useRef(maxTime);
  maxTimeRef.current = maxTime;

  const timeRef = useRef(time);
  timeRef.current = time;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const timeScaleRef = useRef(timeScale);
  timeScaleRef.current = timeScale;

  const reset = useCallback(() => {
    setIsPlaying(false);
    setTime(initialTime);
    timeRef.current = initialTime;
    previousTimeRef.current = null;
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, [initialTime]);

  const stepForward = useCallback((dt: number = 0.05) => {
    setTime((prev) => {
      const next = prev + dt;
      if (next >= maxTimeRef.current) {
        setIsPlaying(false);
        return maxTimeRef.current;
      }
      if (onStepRef.current) {
        onStepRef.current(next, dt);
      }
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        previousTimeRef.current = null;
      }
      return next;
    });
  }, []);

  const animate = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) {
      previousTimeRef.current = null;
      return;
    }

    if (previousTimeRef.current !== null) {
      // Calculate actual delta time in seconds
      const elapsedMs = timestamp - previousTimeRef.current;
      // Clamp frame time to prevent massive jumps when switching tabs (max 0.1s dt)
      const dtReal = Math.min(elapsedMs / 1000, 0.1);
      // Scale dt by physical time multiplier
      const dt = dtReal * timeScaleRef.current;

      const newTime = timeRef.current + dt;

      if (newTime >= maxTimeRef.current) {
        setTime(maxTimeRef.current);
        setIsPlaying(false);
        isPlayingRef.current = false;
        previousTimeRef.current = null;
        if (onStepRef.current) {
          onStepRef.current(maxTimeRef.current, dt);
        }
        return;
      }

      setTime(newTime);
      timeRef.current = newTime;
      
      if (onStepRef.current) {
        onStepRef.current(newTime, dt);
      }
    }

    previousTimeRef.current = timestamp;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
    }

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, animate]);

  return {
    time,
    setTime: (newTime: number) => {
      setTime(newTime);
      timeRef.current = newTime;
    },
    isPlaying,
    setIsPlaying,
    togglePlay,
    reset,
    stepForward,
    timeScale,
    setTimeScale,
  };
}
