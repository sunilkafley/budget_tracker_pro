import { RecurringPayment } from "../../domain/models/RecurringPayment";

import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class GetUpcomingPaymentsUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(): Promise<RecurringPayment[]> {
    const payments = await this.repository.getAll();

    // Sort payments by nearest due date
    return payments.sort(
      (a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime(),
    );
  }
}
