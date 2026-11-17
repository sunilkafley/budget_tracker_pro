import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { Report } from "../../domain/models/Report";
import { ReportService } from "../../domain/services/ReportService";
import { AnalyticsService } from "../../domain/services/AnalyticsService";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { Money } from "../../domain/services/Money";
export interface SpendingPoint {
  start: Date;
  end: Date;
  amount: number;
}
export interface Insights {
  report: Report;
  daily: SpendingPoint[];
  weekly: SpendingPoint[];
  averageDailySpend: number;
  daysInPeriod: number;
}
export class GetInsightsUseCase {
  constructor(
    private readonly incomes: IIncomeRepository,
    private readonly expenses: IExpenseRepository,
  ) {}
  async execute(
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
    reference = new Date(),
  ): Promise<Insights> {
    FinancialValidation.date(reference);
    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > 9999
    )
      throw new Error("Select a valid month and year.");
    const [allIncomes, allExpenses] = await Promise.all([
      this.incomes.getAll(),
      this.expenses.getAll(),
    ]);
    for (const item of [...allIncomes, ...allExpenses])
      FinancialValidation.date(item.transactionDate);
    const start = new Date(year, month - 1, 1);
    const end = new Date(
      Math.min(
        new Date(year, month, 1).getTime(),
        new Date(
          reference.getFullYear(),
          reference.getMonth(),
          reference.getDate() + 1,
        ).getTime(),
      ),
    );
    const daysInPeriod =
      end <= start ? 0 : new Date(end.getTime() - 1).getDate();
    const inPeriod = (date: Date) => date >= start && date < end;
    const incomes = allIncomes.filter((item) => inPeriod(item.transactionDate));
    const expenses = allExpenses.filter((item) =>
      inPeriod(item.transactionDate),
    );
    const totalIncome = ReportService.calculateTotalIncome(incomes);
    const totalExpenses = ReportService.calculateTotalExpenses(expenses);
    const points = (width: number, count: number): SpendingPoint[] => {
      if (!daysInPeriod) return [];
      const result: SpendingPoint[] = [];
      for (let index = count - 1; index >= 0; index--) {
        const bucketStart = new Date(
          year,
          month - 1,
          Math.max(1, daysInPeriod - (index + 1) * width + 1),
        );
        const bucketEnd = new Date(
          year,
          month - 1,
          daysInPeriod - index * width + 1,
        );
        if (bucketEnd <= start) continue;
        result.push({
          start: bucketStart,
          end: bucketEnd,
          amount: Money.sum(
            expenses
              .filter(
                (item) =>
                  item.transactionDate >= bucketStart &&
                  item.transactionDate < bucketEnd,
              )
              .map((item) => item.amount),
          ),
        });
      }
      return result;
    };
    return {
      report: {
        totalIncome,
        totalExpenses,
        savings: Money.subtract(totalIncome, totalExpenses),
        savingsRate: AnalyticsService.calculateSavingsRate(
          totalIncome,
          totalExpenses,
        ),
        topCategory: AnalyticsService.getTopExpenseCategory(expenses),
        categoryBreakdown: AnalyticsService.getCategoryBreakdown(expenses),
      },
      daily: points(1, 7),
      weekly: points(7, Math.ceil(daysInPeriod / 7)),
      daysInPeriod,
      averageDailySpend: daysInPeriod
        ? Money.fromMinorUnits(
            Math.round(Money.toMinorUnits(totalExpenses) / daysInPeriod),
          )
        : 0,
    };
  }
}
