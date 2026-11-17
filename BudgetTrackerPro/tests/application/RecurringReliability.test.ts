import { CompleteRecurringPaymentUseCase } from '../../src/application/useCases/CompleteRecurringPaymentUseCase';
import { FakeExpenseRepository } from '../../src/infrastructure/repositories/FakeExpenseRepository';
import { FakeRecurringPaymentRepository } from '../../src/infrastructure/repositories/FakeRecurringPaymentRepository';
import { FakeRecurringOccurrenceRepository } from '../../src/infrastructure/repositories/FakeRecurringOccurrenceRepository';
import { RecurringPayment } from '../../src/domain/models/RecurringPayment';
import { Frequency } from '../../src/domain/enums/Frequency';
import { CategoryType } from '../../src/domain/enums/CategoryType';
import { frequencyAdvancers } from '../../src/utils/recurringPaymentUtils';

const due = new Date(2024, 0, 31, 9);
function setup() {
  const payments = new FakeRecurringPaymentRepository();
  const expenses = new FakeExpenseRepository();
  const occurrences = new FakeRecurringOccurrenceRepository();
  const create = () => new CompleteRecurringPaymentUseCase(payments, expenses, occurrences);
  const payment = new RecurringPayment('bill', 'Rent', 10.10, CategoryType.OTHER, Frequency.MONTHLY, due);
  return { payments, expenses, occurrences, create, payment };
}

describe('reliable recurring completion', () => {
  it('clamps short months and restores the original day in March', async () => {
    const state = setup();
    await state.payments.save(state.payment);
    await state.create().execute('bill', due);
    const february = (await state.payments.getById('bill'))!.nextDueDate;
    expect([february.getMonth(), february.getDate()]).toEqual([1, 29]);
    await state.create().execute('bill', february);
    expect((await state.payments.getById('bill'))!.nextDueDate.getDate()).toBe(31);
  });
  it('clamps leap-day yearly recurrence', () => {
    const next = frequencyAdvancers[Frequency.YEARLY](new Date(2024, 1, 29, 9));
    expect([next.getFullYear(), next.getMonth(), next.getDate(), next.getHours()]).toEqual([2025, 1, 28, 9]);
  });
  it('records one expense across concurrent instances and stale retries', async () => {
    const state = setup();
    await state.payments.save(state.payment);
    await Promise.all([state.create().execute('bill', due), state.create().execute('bill', due)]);
    await state.create().execute('bill', due);
    expect(await state.expenses.getAll()).toHaveLength(1);
    expect((await state.payments.getById('bill'))!.nextDueDate.getMonth()).toBe(1);
  });
  it('recovers after schedule failure without mutating the original or duplicating expense', async () => {
    const state = setup();
    await state.payments.save(state.payment);
    jest.spyOn(state.payments, 'update').mockRejectedValueOnce(new Error('disk full'));
    await expect(state.create().execute('bill', due)).rejects.toThrow('disk full');
    expect((await state.payments.getById('bill'))!.nextDueDate).toEqual(due);
    await state.create().execute('bill', due);
    expect(await state.expenses.getAll()).toHaveLength(1);
    expect((await state.payments.getById('bill'))!.nextDueDate.getMonth()).toBe(1);
  });
  it('does not advance when expense save fails and safely retries', async () => {
    const state = setup(); await state.payments.save(state.payment);
    jest.spyOn(state.expenses, 'save').mockRejectedValueOnce(new Error('expense failed'));
    await expect(state.create().execute('bill', due)).rejects.toThrow('expense failed');
    expect((await state.payments.getById('bill'))!.nextDueDate).toEqual(due);
    await state.create().execute('bill', due);
    expect(await state.expenses.getAll()).toHaveLength(1);
  });
  it('refuses future occurrences and stale unrecorded dates', async () => {
    const state = setup(); state.payment.nextDueDate = new Date(2099, 0, 1);
    await state.payments.save(state.payment);
    await expect(state.create().execute('bill', state.payment.nextDueDate)).rejects.toThrow('not due');
    await expect(state.create().execute('bill', due)).rejects.toThrow('changed');
    expect(await state.expenses.getAll()).toHaveLength(0);
  });
  it('does not write expenses when the recovery record cannot be saved', async () => {
    const state = setup(); await state.payments.save(state.payment);
    jest.spyOn(state.occurrences, 'save').mockRejectedValueOnce(new Error('journal failed'));
    await expect(state.create().execute('bill', due)).rejects.toThrow('journal failed');
    expect(await state.expenses.getAll()).toHaveLength(0);
  });
});
import { UpdateRecurringPaymentUseCase } from '../../src/application/useCases/UpdateRecurringPaymentUseCase';

it('preserves the recurrence anchor on amount edits and resets it on schedule edits', async () => {
  const state = setup(); await state.payments.save(state.payment);
  await state.create().execute('bill', due);
  const existing = (await state.payments.getById('bill'))!;
  const update = new UpdateRecurringPaymentUseCase(state.payments);
  const amountEdit = new RecurringPayment('bill', 'Rent', 20, CategoryType.OTHER, Frequency.MONTHLY, existing.nextDueDate);
  await update.execute(amountEdit);
  expect((await state.payments.getById('bill'))!.recurrenceAnchorDate).toEqual(due);
  const scheduleEdit = new RecurringPayment('bill', 'Rent', 20, CategoryType.OTHER, Frequency.WEEKLY, existing.nextDueDate);
  await update.execute(scheduleEdit);
  expect((await state.payments.getById('bill'))!.recurrenceAnchorDate).toBeUndefined();
});
it('rejects updating a missing recurring payment', async () => {
  const state = setup();
  await expect(new UpdateRecurringPaymentUseCase(state.payments).execute(state.payment)).rejects.toThrow('not found');
});
it('allows a payment later today and advances exactly one unpaid occurrence', async () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date(2024, 0, 31, 8));
    const state = setup(); await state.payments.save(state.payment);
    await state.create().execute('bill', due);
    expect(await state.expenses.getAll()).toHaveLength(1);
    expect((await state.payments.getById('bill'))!.nextDueDate).toEqual(new Date(2024, 1, 29, 9));
  } finally { jest.useRealTimers(); }
});
it('stops recovery if the schedule was manually changed after a partial save', async () => {
  const state = setup(); await state.payments.save(state.payment);
  jest.spyOn(state.payments, 'update').mockRejectedValueOnce(new Error('interrupted'));
  await expect(state.create().execute('bill', due)).rejects.toThrow('interrupted');
  await state.payments.update(new RecurringPayment('bill', 'Rent', 10.10, CategoryType.OTHER, Frequency.WEEKLY, due));
  await expect(state.create().execute('bill', due)).rejects.toThrow('frequency changed');
  expect(await state.expenses.getAll()).toHaveLength(1);
});
