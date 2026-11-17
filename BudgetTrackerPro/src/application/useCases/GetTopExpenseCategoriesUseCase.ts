import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { AnalyticsService } from "../../domain/services/AnalyticsService";

export class GetTopExpenseCategoriesUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(): Promise<string> {
    const expenses = await this.expenseRepository.getAll();

    return AnalyticsService.getTopExpenseCategory(expenses);
  }
}
