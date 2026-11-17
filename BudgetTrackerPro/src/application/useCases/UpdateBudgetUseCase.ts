import { Budget } from "../../domain/models/Budget";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(budget: Budget): Promise<void> {
    FinancialValidation.budget(budget);
    if (!await this.budgetRepository.getById(budget.id)) throw new Error("Budget not found");
    await this.budgetRepository.update(budget);
  }
}
