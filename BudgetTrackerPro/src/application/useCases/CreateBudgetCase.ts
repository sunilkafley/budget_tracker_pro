import { Budget } from "../../domain/models/Budget";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(budget: Budget): Promise<void> {
    if (budget.limitAmount <= 0) {
      throw new Error("Budget amount must be greater than zero");
    }

    await this.budgetRepository.save(budget);
  }
}
