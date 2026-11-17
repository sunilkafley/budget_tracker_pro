import { Budget } from "../../domain/models/Budget";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(budget: Budget): Promise<void> {
    FinancialValidation.budget(budget);

    await this.budgetRepository.save(budget);
  }
}
