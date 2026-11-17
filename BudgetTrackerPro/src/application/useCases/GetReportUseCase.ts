import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { AnalyticsService } from "../../domain/services/AnalyticsService";

import { Report } from "../../domain/models/Report";
import { ReportService } from "../../domain/services/ReportService";
import { Money } from "../../domain/services/Money";

export class GetReportUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private expenseRepository: IExpenseRepository,
  ) {}

  async execute(month?: number, year?: number): Promise<Report> {
    const incomes = await this.incomeRepository.getAll();

    const expenses = await this.expenseRepository.getAll();
    let filteredIncomes = incomes;
    let filteredExpenses = expenses;

    if (month && year) {
      filteredIncomes = incomes.filter(
        (income) =>
          income.transactionDate.getMonth() + 1 === month &&
          income.transactionDate.getFullYear() === year,
      );

      filteredExpenses = expenses.filter(
        (expense) =>
          expense.transactionDate.getMonth() + 1 === month &&
          expense.transactionDate.getFullYear() === year,
      );
    }

    const totalIncome = ReportService.calculateTotalIncome(filteredIncomes);

    const totalExpenses = ReportService.calculateTotalExpenses(filteredExpenses);

    const savings = Money.subtract(totalIncome, totalExpenses);

    const savingsRate = AnalyticsService.calculateSavingsRate(
      totalIncome,
      totalExpenses,
    );

    const topCategory =
      AnalyticsService.getTopExpenseCategory(filteredExpenses);

    const categoryBreakdown =
      AnalyticsService.getCategoryBreakdown(filteredExpenses);

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      topCategory,
      categoryBreakdown,
    };
  }
}
