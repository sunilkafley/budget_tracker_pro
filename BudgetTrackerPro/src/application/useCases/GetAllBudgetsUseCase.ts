import { Budget } from "../../domain/models/Budget";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class GetAllBudgetsUseCase {
  constructor(private budgetRepository: IBudgetRepository) {}

  async execute(): Promise<Budget[]> {
    return this.budgetRepository.getAll();
  }
}
