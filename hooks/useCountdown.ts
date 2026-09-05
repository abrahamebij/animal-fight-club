'use client';

import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '@/lib/utils/timer';

export interface CountdownState {
  formatted: string;
  isExpired: boolean;
  totalSeconds: number;
}

export function useCountdown(targetTimestampMs?: number | null): CountdownState | null {
  const [countdown, setCountdown] = useState<CountdownState | null>(() =>
    targetTimestampMs ? formatTimeRemaining(targetTimestampMs) : null
  );

  useEffect(() => {
    if (!targetTimestampMs) {
      setCountdown(null);
      return;
    }

    setCountdown(formatTimeRemaining(targetTimestampMs));

    const interval = setInterval(() => {
      const current = formatTimeRemaining(targetTimestampMs);
      setCountdown(current);
      if (current.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestampMs]);

  return countdown;
}
