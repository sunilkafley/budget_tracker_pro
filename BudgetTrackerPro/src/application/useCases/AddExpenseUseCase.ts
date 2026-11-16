import { Expense } from "../../domain/models/Expense";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class AddExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(expense: Expense): Promise<void> {
    FinancialValidation.expense(expense);

    await this.expenseRepository.save(expense);
  }
}
