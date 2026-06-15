import { Expense } from "../../domain/models/Expense";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class AddExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(expense: Expense): Promise<void> {
    if (!expense.isValid()) {
      throw new Error("Expense amount must be greater than zero");
    }

    await this.expenseRepository.save(expense);
  }
}
