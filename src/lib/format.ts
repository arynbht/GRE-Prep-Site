/** Formats a number of seconds as M:SS, or H:MM:SS past an hour. */
export function formatDuration(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : '';
  const seconds = Math.abs(Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return h > 0 ? sign + h + ':' + pad(m) + ':' + pad(s) : sign + m + ':' + pad(s);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function percent(score: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((score / total) * 100) + '%';
}
