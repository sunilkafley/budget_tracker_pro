import { Income } from "../../domain/models/Income";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class AddIncomeUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async execute(income: Income): Promise<void> {
    if (!income.isValid()) {
      throw new Error("Income amount must be greater than zero");
    }

    await this.incomeRepository.save(income);
  }
}
