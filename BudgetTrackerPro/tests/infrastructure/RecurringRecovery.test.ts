import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncExpenseRepository } from '../../src/infrastructure/repositories/AsyncExpenseRepository';
import { AsyncRecurringPaymentRepository } from '../../src/infrastructure/repositories/AsyncRecurringPaymentRepository';
import { AsyncRecurringOccurrenceRepository } from '../../src/infrastructure/repositories/AsyncRecurringOccurrenceRepository';
import { CompleteRecurringPaymentUseCase } from '../../src/application/useCases/CompleteRecurringPaymentUseCase';
import { RecurringPayment } from '../../src/domain/models/RecurringPayment';
import { Expense } from '../../src/domain/models/Expense';
import { Category } from '../../src/domain/models/Category';
import { CategoryType } from '../../src/domain/enums/CategoryType';
import { Frequency } from '../../src/domain/enums/Frequency';
import { StorageKeys } from '../../src/storage/StorageKeys';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() },
}));
const data = new Map<string, string>();
const due = new Date(2024, 0, 31, 9);
const create = () => new CompleteRecurringPaymentUseCase(new AsyncRecurringPaymentRepository(), new AsyncExpenseRepository(), new AsyncRecurringOccurrenceRepository());
const bill = (id = 'bill') => new RecurringPayment(id, 'Rent', 0.10, CategoryType.OTHER, Frequency.MONTHLY, due);

beforeEach(() => {
  data.clear(); jest.resetAllMocks();
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => data.get(key) ?? null);
  jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => { data.set(key, value); });
});

it.each(['expense-before', 'expense-after', 'schedule-before', 'schedule-after', 'journal-after'])(
  'recovers after %s failure with fresh repository instances', async failure => {
    await new AsyncRecurringPaymentRepository().save(bill());
    let failed = false;
    jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => {
      const matches = failure.startsWith('expense') ? key === StorageKeys.EXPENSES :
        failure.startsWith('schedule') ? key === StorageKeys.RECURRING_PAYMENTS :
          key.startsWith('RECURRING_OCCURRENCE_V1:') && JSON.parse(value).status === 'completed';
      if (!failed && matches) {
        failed = true;
        if (failure.endsWith('after')) data.set(key, value);
        throw new Error('interrupted');
      }
      data.set(key, value);
    });
    await expect(create().execute('bill', due)).rejects.toThrow('interrupted');
    await create().execute('bill', due);
    await create().execute('bill', due);
    const expenses = await new AsyncExpenseRepository().getAll();
    expect(expenses).toHaveLength(1);
    expect(expenses[0].amount).toBe(0.10);
    const payment = (await new AsyncRecurringPaymentRepository().getById('bill'))!;
    expect([payment.nextDueDate.getMonth(), payment.nextDueDate.getDate()]).toEqual([1, 29]);
    expect(payment.recurrenceAnchorDate).toEqual(due);
  },
);
it('retains unrelated concurrent manual expenses and different recurring payments', async () => {
  const payments = new AsyncRecurringPaymentRepository();
  await Promise.all([payments.save(bill()), new AsyncRecurringPaymentRepository().save(bill('second'))]);
  const manual = new Expense('manual', 'Lunch', 1, due, new Category('other', 'Other', CategoryType.OTHER));
  await Promise.all([create().execute('bill', due), create().execute('second', due), new AsyncExpenseRepository().save(manual)]);
  expect(await new AsyncExpenseRepository().getAll()).toHaveLength(3);
  expect(await payments.getAll()).toHaveLength(2);
});
it.each(['{bad', '{}', 'null', '{"status":"pending"}'])('fails closed on corrupted recovery data %s', async value => {
  await new AsyncRecurringPaymentRepository().save(bill());
  data.set('RECURRING_OCCURRENCE_V1:recurring:bill:' + due.toISOString(), value);
  await expect(create().execute('bill', due)).rejects.toThrow('damaged');
  expect(await new AsyncExpenseRepository().getAll()).toHaveLength(0);
});
it('retries completed occurrences without resurrecting a deliberately deleted expense', async () => {
  await new AsyncRecurringPaymentRepository().save(bill());
  await create().execute('bill', due);
  const repository = new AsyncExpenseRepository();
  await repository.delete((await repository.getAll())[0].id);
  await create().execute('bill', due);
  expect(await repository.getAll()).toHaveLength(0);
});
it('propagates recovery read failures without financial writes', async () => {
  await new AsyncRecurringPaymentRepository().save(bill());
  jest.mocked(AsyncStorage.getItem).mockImplementation(async key => {
    if (key.startsWith('RECURRING_OCCURRENCE_V1:')) throw new Error('read failed');
    return data.get(key) ?? null;
  });
  await expect(create().execute('bill', due)).rejects.toThrow('read failed');
  expect(data.has(StorageKeys.EXPENSES)).toBe(false);
});
