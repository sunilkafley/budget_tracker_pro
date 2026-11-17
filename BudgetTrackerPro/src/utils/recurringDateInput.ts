import { FinancialValidation } from '../domain/services/FinancialValidation';
export function formatRecurringDate(date: Date): string {
  FinancialValidation.date(date);
  return [date.getFullYear().toString().padStart(4, '0'), (date.getMonth() + 1).toString().padStart(2, '0'), date.getDate().toString().padStart(2, '0')].join('-');
}
export function parseRecurringDate(input: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) throw new Error('Enter a valid date as YYYY-MM-DD.');
  const [year, month, day] = input.split('-').map(Number);
  const date = new Date(0); date.setHours(0, 0, 0, 0); date.setFullYear(year, month - 1, day);
  if (formatRecurringDate(date) !== input) throw new Error('Enter a valid calendar date.');
  return date;
}
