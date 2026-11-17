import { Frequency } from "../enums/Frequency";
import { Expense } from '../models/Expense';
export interface RecurringOccurrence {
  id: string;
  paymentId: string;
  frequency: Frequency;
  dueDate: Date;
  nextDueDate: Date;
  anchorDate: Date;
  expense: Expense;
  status: 'pending' | 'completed';
}
export interface IRecurringOccurrenceRepository {
  getById(id: string): Promise<RecurringOccurrence | null>;
  save(occurrence: RecurringOccurrence): Promise<void>;
}
