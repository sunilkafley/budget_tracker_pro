import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class DeleteRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
