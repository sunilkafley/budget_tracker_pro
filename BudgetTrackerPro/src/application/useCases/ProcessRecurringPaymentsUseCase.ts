import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class ProcessRecurringPaymentsUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(): Promise<void> {
    // Unpaid occurrences remain due until explicitly recorded by completion.
    // Keep this legacy entry point read-only for existing callers.
    await this.repository.getAll();
  }
}
