import { parseRecurringDate, formatRecurringDate } from '../../src/utils/recurringDateInput';
import { frequencyAdvancers } from '../../src/utils/recurringPaymentUtils';
import { Frequency } from '../../src/domain/enums/Frequency';

it.each(['2025-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '26-01-01', '2026-1-01', '', '2026-01-01extra'])(
  'rejects invalid calendar input %s', value => { expect(() => parseRecurringDate(value)).toThrow(); },
);
it('round trips a leap day at local midnight', () => {
  const date = parseRecurringDate('2024-02-29');
  expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2024, 1, 29, 0]);
  expect(formatRecurringDate(date)).toBe('2024-02-29');
});
it('retains the leap-day anchor over four yearly payments', () => {
  const anchor = new Date(2024, 1, 29, 9);
  let next = anchor;
  for (let year = 2025; year <= 2028; year++) {
    next = frequencyAdvancers[Frequency.YEARLY](next, anchor);
    expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([year, 1, year === 2028 ? 29 : 28]);
  }
});
it('adds seven local days across the NZ spring daylight-saving boundary', () => {
  const next = frequencyAdvancers[Frequency.WEEKLY](new Date(2026, 8, 24, 9));
  expect([next.getMonth(), next.getDate(), next.getHours()]).toEqual([9, 1, 9]);
});
