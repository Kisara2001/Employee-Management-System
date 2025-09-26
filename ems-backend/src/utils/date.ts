export function startOfMonth(year: number, month: number): Date {
  // month is 1..12
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

export function endOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

export function weekdaysInMonth(year: number, month: number): number {
  const start = startOfMonth(year, month);
  const end = endOfMonth(year, month);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay(); // 0=Sun..6=Sat
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export function toDateOnly(date: Date | string): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function parseISODate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  return d;
}

