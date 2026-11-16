import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

import { MonthlyReport } from "../dto/MonthlyReport";

export class GetMonthlyReportUseCase {
  constructor(
    private incomeRepository: IIncomeRepository,
    private expenseRepository: IExpenseRepository,
  ) {}

  async execute(): Promise<MonthlyReport> {
    const incomes = await this.incomeRepository.getAll();

    const expenses = await this.expenseRepository.getAll();

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    return {
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
    };
  }
}
