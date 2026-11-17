import { Frequency } from '../domain/enums/Frequency';
import { FinancialValidation } from '../domain/services/FinancialValidation';

function advance(date: Date, frequency: Frequency, anchor: Date = date): Date {
  FinancialValidation.date(date);
  FinancialValidation.date(anchor);
  const next = new Date(date);
  if (frequency === Frequency.WEEKLY) next.setDate(next.getDate() + 7);
  else {
    // Set day to 1 before moving months to prevent JavaScript date overflow.
    next.setDate(1);
    if (frequency === Frequency.MONTHLY) next.setMonth(next.getMonth() + 1);
    else { next.setFullYear(next.getFullYear() + 1); next.setMonth(anchor.getMonth()); }
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(anchor.getDate(), lastDay));
  }
  FinancialValidation.date(next);
  return next;
}
export const frequencyAdvancers = {
  [Frequency.WEEKLY]: (date: Date, anchor?: Date) => advance(date, Frequency.WEEKLY, anchor),
  [Frequency.MONTHLY]: (date: Date, anchor?: Date) => advance(date, Frequency.MONTHLY, anchor),
  [Frequency.YEARLY]: (date: Date, anchor?: Date) => advance(date, Frequency.YEARLY, anchor),
};
