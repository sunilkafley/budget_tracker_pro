import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class GetExpenseByIdUseCase {
  constructor(private readonly repository: IExpenseRepository) {}

  async execute(id: string) {
    const expense = await this.repository.getById(id);
    if (!expense) throw new Error("Expense not found");
    return expense;
  }
}
