import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class GetBudgetByIdUseCase {
  constructor(private readonly repository: IBudgetRepository) {}

  async execute(id: string) {
    const budget = await this.repository.getById(id);
    if (!budget) throw new Error("Budget not found");
    return budget;
  }
}
