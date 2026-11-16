import { RecurringPayment } from "../../domain/models/RecurringPayment";

import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class CreateRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(payment: RecurringPayment): Promise<void> {
    await this.repository.save(payment);
  }
}
