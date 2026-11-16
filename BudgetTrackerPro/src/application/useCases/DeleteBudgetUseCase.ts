import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(id: string): Promise<void> {
    await this.budgetRepository.delete(id);
  }
}
