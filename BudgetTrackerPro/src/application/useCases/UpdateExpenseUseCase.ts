import { Expense } from "../../domain/models/Expense";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(expense: Expense): Promise<void> {
    FinancialValidation.expense(expense);
    const existing = await this.expenseRepository.getById(expense.id);
    if (!existing) throw new Error("Expense not found");
    const updated = new Expense(
      expense.id, expense.title, expense.amount, existing.transactionDate,
      expense.category, expense.notes ?? existing.notes,
    );
    FinancialValidation.expense(updated);
    await this.expenseRepository.update(updated);
  }
}
