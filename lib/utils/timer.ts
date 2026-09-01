import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * Formats a closing timestamp into MM:SS remaining using dayjs
 */
export function formatTimeRemaining(targetTimestampMs: number): {
  formatted: string;
  isExpired: boolean;
  totalSeconds: number;
} {
  const diffMs = targetTimestampMs - Date.now();

  if (diffMs <= 0) {
    return {
      formatted: '00:00',
      isExpired: true,
      totalSeconds: 0,
    };
  }

  const dur = dayjs.duration(diffMs);
  const minutes = Math.floor(dur.asMinutes());
  const seconds = dur.seconds();

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    formatted,
    isExpired: false,
    totalSeconds: Math.floor(diffMs / 1000),
  };
}

/**
 * Formats a timestamp into human-readable date string using dayjs
 */
export function formatDate(timestampMs: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(timestampMs).format(format);
}

/**
 * Formats a timestamp into relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestampMs: number): string {
  return dayjs(timestampMs).fromNow();
}
