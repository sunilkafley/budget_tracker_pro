import { Income } from "../../domain/models/Income";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class UpdateIncomeUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository) {}

  async execute(income: Income): Promise<void> {
    FinancialValidation.income(income);
    const existing = await this.incomeRepository.getById(income.id);
    if (!existing) throw new Error("Income not found");
    const updated = new Income(
      income.id, income.title, income.amount, existing.transactionDate,
      income.source, income.notes ?? existing.notes,
    );
    FinancialValidation.income(updated);
    await this.incomeRepository.update(updated);
  }
}
