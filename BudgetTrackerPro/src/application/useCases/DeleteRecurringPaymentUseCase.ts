import { serializedOperation } from "../SerializedOperation";
import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class DeleteRecurringPaymentUseCase {
  constructor(private readonly repository: IRecurringPaymentRepository) {}

  async execute(id: string): Promise<void> {
    return serializedOperation("recurring-completion", async () => {
      await this.repository.delete(id);
    });
  }
}
