import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

import { frequencyAdvancers } from "../../utils/recurringPaymentUtils";

export class ProcessRecurringPaymentsUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(): Promise<void> {
    const payments = await this.repository.getAll();

    const today = new Date();

    for (const payment of payments) {
      let updatedDate = new Date(payment.nextDueDate);

      // Keep advancing until the payment is no longer overdue
      while (updatedDate <= today) {
        updatedDate = frequencyAdvancers[payment.frequency](updatedDate);
      }

      // Only update storage if the date changed
      if (updatedDate.getTime() !== payment.nextDueDate.getTime()) {
        payment.nextDueDate = updatedDate;

        await this.repository.update(payment);
      }
    }
  }
}
