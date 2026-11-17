import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(id: string): Promise<void> {
    await this.expenseRepository.delete(id);
  }
}
