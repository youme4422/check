import type { Locale } from '../storage/types';

export function formatDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  }).format(new Date(value));
}

export function formatRemainingTime(
  remainingMs: number,
  unitLabels: { day: string; hour: string; minute: string },
  readyLabel: string
) {
  if (remainingMs <= 0) {
    return readyLabel;
  }

  const totalMinutes = Math.ceil(remainingMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [
    days > 0 ? `${days}${unitLabels.day}` : null,
    hours > 0 ? `${hours}${unitLabels.hour}` : null,
    `${minutes}${unitLabels.minute}`,
  ].filter(Boolean);

  return parts.join(' ');
}
