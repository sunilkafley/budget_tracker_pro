import { DashboardSummary } from "../dto/DashboardSummary";

export class GetDashboardSummaryUseCase {
  execute(
    totalIncome: number,
    totalExpenses: number,
    topCategory: string,
    upcomingPaymentsCount: number,
  ): DashboardSummary {
    return {
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      topCategory,
      upcomingPaymentsCount,
    };
  }
}
