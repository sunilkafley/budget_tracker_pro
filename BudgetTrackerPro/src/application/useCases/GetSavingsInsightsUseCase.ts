import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { AnalyticsService } from "../../domain/services/AnalyticsService";

import { SavingsInsights } from "../dto/SavingsInsights";

export class GetSavingsInsightsUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private expenseRepository: IExpenseRepository,
  ) {}

  async execute(): Promise<SavingsInsights> {
    const incomes = await this.incomeRepository.getAll();

    const expenses = await this.expenseRepository.getAll();

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    const savings = totalIncome - totalExpenses;

    const savingsRate = AnalyticsService.calculateSavingsRate(
      totalIncome,
      totalExpenses,
    );

    return {
      savings,
      savingsRate,
    };
  }
}
