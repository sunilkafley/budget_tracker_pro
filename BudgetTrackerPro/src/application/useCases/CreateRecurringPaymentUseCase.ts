import { RecurringPayment } from "../../domain/models/RecurringPayment";
import { FinancialValidation } from "../../domain/services/FinancialValidation";

import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class CreateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(payment: RecurringPayment): Promise<void> {
    FinancialValidation.recurringPayment(payment);
    await this.repository.save(payment);
  }
}
