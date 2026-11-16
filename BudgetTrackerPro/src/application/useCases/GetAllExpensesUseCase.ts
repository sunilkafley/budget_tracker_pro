import { Expense } from "../../domain/models/Expense";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class GetAllExpensesUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(): Promise<Expense[]> {
    return this.expenseRepository.getAll();
  }
}
