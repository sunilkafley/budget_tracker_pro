import { summarizeMonthlyBudgets } from "../../domain/services/MonthlyBudgetSummary";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { AnalyticsService } from "../../domain/services/AnalyticsService";
import { BudgetUsage } from "../dto/BudgetUsage";

export class GetBudgetUsageUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async executeOverview(referenceDate = new Date()) {
    const budgets = await this.execute(referenceDate);
    return { budgets, monthlyPlan: summarizeMonthlyBudgets(budgets) };
  }

  async execute(referenceDate = new Date()): Promise<BudgetUsage[]> {
    const [budgets, expenses] = await Promise.all([
      this.budgetRepository.getAll(),
      this.expenseRepository.getAll(),
    ]);
    return AnalyticsService.calculateBudgetUsage(
      budgets,
      expenses,
      referenceDate,
    );
  }
}
