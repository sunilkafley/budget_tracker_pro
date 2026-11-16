import { Expense } from "../../domain/models/Expense";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(expense: Expense): Promise<void> {
    FinancialValidation.expense(expense);
    await this.expenseRepository.update(expense);
  }
}
