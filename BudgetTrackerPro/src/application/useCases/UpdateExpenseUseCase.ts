import { Expense } from "../../domain/models/Expense";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(expense: Expense): Promise<void> {
    await this.expenseRepository.update(expense);
  }
}
