import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { AnalyticsService } from "../../domain/services/AnalyticsService";

export class GetCategoryBreakdownUseCase {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute() {
    const expenses = await this.expenseRepository.getAll();

    return AnalyticsService.getCategoryBreakdown(expenses);
  }
}
