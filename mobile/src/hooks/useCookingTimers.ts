// useCookingTimers.ts — manage N parallel countdown timers for cooking mode.
//
// Why: a real cook is running 3-4 things at once (rice boiling, sauce
// simmering, veg roasting). The old CountdownTimer was tied to the current
// step — navigating steps reset its state, which made parallel cooking
// impossible.
//
// API:
//   const timers = useCookingTimers();
//   const id = timers.add('Boil rice', 600);   // 10 min
//   timers.toggle(id);                          // start/pause
//   timers.reset(id);
//   timers.remove(id);
//   timers.list   // → [{ id, label, remaining, totalSeconds, running }, ...]
//
// The hook owns a single setInterval that ticks all timers in lock-step,
// so 5 timers cost 1 timer, not 5.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remaining: number;
  running: boolean;
  /** Timer finished (remaining = 0) AND the parent already notified. */
  acknowledged: boolean;
}

export interface UseCookingTimers {
  list: ActiveTimer[];
  add: (label: string, seconds: number) => string;
  toggle: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
  acknowledge: (id: string) => void;
  hasRunning: boolean;
}

export function useCookingTimers(onTimerDone?: (label: string) => void): UseCookingTimers {
  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const onDoneRef = useRef(onTimerDone);
  useEffect(() => { onDoneRef.current = onTimerDone; }, [onTimerDone]);

  // Single global ticker — fires every second only when at least one timer
  // is running. We rebuild on every change to `timers`'s running set so we
  // don't burn CPU when nothing's active.
  const anyRunning = timers.some((t) => t.running);
  useEffect(() => {
    if (!anyRunning) return;
    const handle = setInterval(() => {
      setTimers((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (!t.running || t.remaining <= 0) return t;
          changed = true;
          const newRemaining = t.remaining - 1;
          if (newRemaining <= 0) {
            // Defer to the next tick so we don't call setState from
            // inside another setState during onDone fan-out.
            queueMicrotask(() => onDoneRef.current?.(t.label));
            return { ...t, remaining: 0, running: false };
          }
          return { ...t, remaining: newRemaining };
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(handle);
  }, [anyRunning]);

  const add = useCallback((label: string, seconds: number): string => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setTimers((prev) => [
      ...prev,
      {
        id,
        label,
        totalSeconds: seconds,
        remaining: seconds,
        running: true, // auto-start — user tapped "Start"
        acknowledged: false,
      },
    ]);
    return id;
  }, []);

  const toggle = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id && t.remaining > 0 ? { ...t, running: !t.running } : t,
      ),
    );
  }, []);

  const reset = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remaining: t.totalSeconds, running: false, acknowledged: false }
          : t,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const acknowledge = useCallback((id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, acknowledged: true } : t)));
  }, []);

  return { list: timers, add, toggle, reset, remove, acknowledge, hasRunning: anyRunning };
}
