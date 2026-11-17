import { Frequency } from "../../domain/enums/Frequency";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IRecurringOccurrenceRepository, RecurringOccurrence } from '../../domain/repositories/IRecurringOccurrenceRepository';
import { Expense } from '../../domain/models/Expense';
import { Category } from '../../domain/models/Category';
import { FinancialValidation } from '../../domain/services/FinancialValidation';

export class AsyncRecurringOccurrenceRepository implements IRecurringOccurrenceRepository {
  private key(id: string) { return 'RECURRING_OCCURRENCE_V1:' + id; }
  async getById(id: string): Promise<RecurringOccurrence | null> {
    const data = await AsyncStorage.getItem(this.key(id));
    if (data === null) return null;
    try {
      const raw = JSON.parse(data);
      if (!raw || raw.id !== id || typeof raw.paymentId !== 'string' || !raw.expense || raw.expense.id !== id ||
          (raw.status !== 'pending' && raw.status !== 'completed')) throw new Error();
      if (![raw.dueDate, raw.nextDueDate, raw.anchorDate, raw.expense.transactionDate].every(value => typeof value === 'string' && Number.isFinite(Date.parse(value)))) throw new Error();
      if (!Object.values(Frequency).includes(raw.frequency)) throw new Error();
      const expense = new Expense(raw.expense.id, raw.expense.title, raw.expense.amount, new Date(raw.expense.transactionDate),
        new Category(raw.expense.category.id, raw.expense.category.name, raw.expense.category.type));
      FinancialValidation.expense(expense);
      const record: RecurringOccurrence = { ...raw, expense, dueDate: new Date(raw.dueDate),
        nextDueDate: new Date(raw.nextDueDate), anchorDate: new Date(raw.anchorDate) };
      for (const date of [record.dueDate, record.nextDueDate, record.anchorDate]) FinancialValidation.date(date);
      if (record.nextDueDate <= record.dueDate || id !== 'recurring:' + encodeURIComponent(record.paymentId) + ':' + record.dueDate.toISOString()) throw new Error();
      return record;
    } catch { throw new Error('Recurring payment recovery data is damaged. Retry was stopped to protect existing records.'); }
  }
  async save(record: RecurringOccurrence): Promise<void> {
    await AsyncStorage.setItem(this.key(record.id), JSON.stringify(record));
  }
}
