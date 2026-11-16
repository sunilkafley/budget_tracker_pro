// Returns number of days until a date
// Negative = overdue
// 0 = today
// 1 = tomorrow

export function getDaysUntil(date: Date): number {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);

  targetDate.setHours(0, 0, 0, 0);

  const difference = targetDate.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}
