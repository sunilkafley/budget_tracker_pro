import { Expense } from '../../domain/models/Expense';
import { RecurringPayment } from '../../domain/models/RecurringPayment';
import { FinancialValidation } from '../../domain/services/FinancialValidation';
import { Category } from '../../domain/models/Category';
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { IRecurringPaymentRepository } from '../../domain/repositories/IRecurringPaymentRepository';
import { IRecurringOccurrenceRepository } from '../../domain/repositories/IRecurringOccurrenceRepository';
import { frequencyAdvancers } from '../../utils/recurringPaymentUtils';
import { serializedOperation } from '../SerializedOperation';

export class CompleteRecurringPaymentUseCase {
  constructor(
    private readonly recurringPaymentRepository: IRecurringPaymentRepository,
    private readonly expenseRepository: IExpenseRepository,
    private readonly occurrences: IRecurringOccurrenceRepository,
  ) {}

  async execute(paymentId: string, expectedDueDate?: Date): Promise<void> {
    // Capture the occurrence before queuing so concurrent legacy callers agree.
    const initial = await this.recurringPaymentRepository.getById(paymentId);
    if (!initial) throw new Error('Recurring payment not found');
    const dueDate = new Date(expectedDueDate ?? initial.nextDueDate);
    FinancialValidation.date(dueDate);
    const id = `recurring:${encodeURIComponent(paymentId)}:${dueDate.toISOString()}`;
    return serializedOperation('recurring-completion', async () => {
      let record = await this.occurrences.getById(id);
      if (record?.status === 'completed') return;
      const payment = await this.recurringPaymentRepository.getById(paymentId);
      if (!payment) throw new Error('Recurring payment not found');
      FinancialValidation.recurringPayment(payment);
      if (!record) {
        if (payment.nextDueDate.getTime() !== dueDate.getTime()) throw new Error('Payment schedule changed. Refresh and try again.');
        const today = new Date(); today.setHours(23, 59, 59, 999);
        if (dueDate > today) throw new Error('This payment is not due yet.');
        const anchorDate = payment.recurrenceAnchorDate ?? dueDate;
        const nextDueDate = frequencyAdvancers[payment.frequency](dueDate, anchorDate);
        record = { id, paymentId, frequency: payment.frequency, dueDate, nextDueDate, anchorDate, status: 'pending',
          expense: new Expense(id, payment.name, payment.amount, new Date(), new Category(payment.category, payment.category, payment.category)) };
        // Persist the intent before either financial write; retries use its snapshot.
        await this.occurrences.save(record);
      }
      if (payment.frequency !== record.frequency) throw new Error('Payment frequency changed during recovery. Restore it before retrying.');
      const currentDate = payment.nextDueDate.getTime();
      if (currentDate !== record.dueDate.getTime() && currentDate !== record.nextDueDate.getTime()) {
        throw new Error('Payment schedule changed during recovery. Restore its due date before retrying.');
      }
      if (!await this.expenseRepository.getById(record.expense.id)) await this.expenseRepository.save(record.expense);
      if (currentDate === record.dueDate.getTime()) {
        const updated = new RecurringPayment(payment.id, payment.name, payment.amount, payment.category,
          payment.frequency, new Date(record.nextDueDate), new Date(record.anchorDate));
        await this.recurringPaymentRepository.update(updated);
      }
      await this.occurrences.save({ ...record, status: 'completed' });
    });
  }
}
