import { IRecurringOccurrenceRepository, RecurringOccurrence } from '../../domain/repositories/IRecurringOccurrenceRepository';
export class FakeRecurringOccurrenceRepository implements IRecurringOccurrenceRepository {
  private readonly records = new Map<string, RecurringOccurrence>();
  async getById(id: string): Promise<RecurringOccurrence | null> { return this.records.get(id) ?? null; }
  async save(record: RecurringOccurrence): Promise<void> { this.records.set(record.id, { ...record }); }
}
