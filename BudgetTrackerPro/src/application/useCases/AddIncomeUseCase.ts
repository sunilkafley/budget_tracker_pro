import { Income } from "../../domain/models/Income";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class AddIncomeUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async execute(income: Income): Promise<void> {
    FinancialValidation.income(income);

    await this.incomeRepository.save(income);
  }
}
