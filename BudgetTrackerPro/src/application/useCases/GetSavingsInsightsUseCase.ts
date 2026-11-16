import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { AnalyticsService } from "../../domain/services/AnalyticsService";

import { SavingsInsights } from "../dto/SavingsInsights";
import { ReportService } from "../../domain/services/ReportService";
import { Money } from "../../domain/services/Money";

export class GetSavingsInsightsUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private expenseRepository: IExpenseRepository,
  ) {}

  async execute(): Promise<SavingsInsights> {
    const incomes = await this.incomeRepository.getAll();

    const expenses = await this.expenseRepository.getAll();

    const totalIncome = ReportService.calculateTotalIncome(incomes);

    const totalExpenses = ReportService.calculateTotalExpenses(expenses);

    const savings = Money.subtract(totalIncome, totalExpenses);

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
