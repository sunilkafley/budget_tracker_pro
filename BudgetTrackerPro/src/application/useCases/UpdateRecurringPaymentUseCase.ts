import { serializedOperation } from "../SerializedOperation";
import { RecurringPayment } from "../../domain/models/RecurringPayment";
import { FinancialValidation } from "../../domain/services/FinancialValidation";

import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class UpdateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(payment: RecurringPayment): Promise<void> {
    return serializedOperation("recurring-completion", async () => {
      FinancialValidation.recurringPayment(payment);
      const existing = await this.repository.getById(payment.id);
      if (!existing) throw new Error('Recurring payment not found');
      const sameSchedule = existing.frequency === payment.frequency && existing.nextDueDate.getTime() === payment.nextDueDate.getTime();
      const updated = new RecurringPayment(payment.id, payment.name, payment.amount, payment.category, payment.frequency,
        new Date(payment.nextDueDate), sameSchedule ? existing.recurrenceAnchorDate : undefined);
      await this.repository.update(updated);
    });
  }
}
