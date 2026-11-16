import { DashboardSummary } from "../dto/DashboardSummary";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { ReportService } from "../../domain/services/ReportService";

export class GetDashboardSummaryUseCase {
  constructor(
    private readonly incomeRepository: IIncomeRepository,
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(): Promise<DashboardSummary> {
    const incomes = await this.incomeRepository.getAll();
    const expenses = await this.expenseRepository.getAll();

    const totalIncome = ReportService.calculateTotalIncome(incomes);

    const totalExpenses = ReportService.calculateTotalExpenses(expenses);

    const savings = ReportService.calculateSavings(incomes, expenses);

    return {
      totalIncome,
      totalExpenses,
      savings,
      topCategory: "",
      upcomingPaymentsCount: 0,
    };
  }
}
