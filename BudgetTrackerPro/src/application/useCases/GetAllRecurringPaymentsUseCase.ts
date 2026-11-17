import { RecurringPayment } from "../../domain/models/RecurringPayment";

import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class GetAllRecurringPaymentsUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(): Promise<RecurringPayment[]> {
    return this.repository.getAll();
  }
}
