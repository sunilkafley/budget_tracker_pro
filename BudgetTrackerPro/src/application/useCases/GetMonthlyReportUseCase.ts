import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { MonthlyReport } from "../dto/MonthlyReport";
import { ReportService } from "../../domain/services/ReportService";
import { Money } from "../../domain/services/Money";

export class GetMonthlyReportUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private expenseRepository: IExpenseRepository,
  ) {}

  async execute(): Promise<MonthlyReport> {
    const incomes = await this.incomeRepository.getAll();

    const expenses = await this.expenseRepository.getAll();

    const totalIncome = ReportService.calculateTotalIncome(incomes);

    const totalExpenses = ReportService.calculateTotalExpenses(expenses);

    return {
      totalIncome,
      totalExpenses,
      savings: Money.subtract(totalIncome, totalExpenses),
    };
  }
}
