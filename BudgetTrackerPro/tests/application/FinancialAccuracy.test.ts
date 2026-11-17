import { GetReportUseCase } from "../../src/application/useCases/GetReportUseCase";
import { GetMonthlyReportUseCase } from "../../src/application/useCases/GetMonthlyReportUseCase";
import { GetSavingsInsightsUseCase } from "../../src/application/useCases/GetSavingsInsightsUseCase";
import { GetDashboardSummaryUseCase } from "../../src/application/useCases/GetDashboardSummaryUseCase";
import { ReportService } from "../../src/domain/services/ReportService";
import { AnalyticsService } from "../../src/domain/services/AnalyticsService";
import { BudgetService } from "../../src/domain/services/BudgetService";
import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

const category = new Category("grocery", "Groceries", CategoryType.GROCERY);
const date = new Date(2026, 0, 15);
const expenses = [0.1, 0.2].map((amount, index) => new Expense(String(index), "Food", amount, date, category));

it("calculates exact category totals, monthly totals and budget remainders", () => {
  expect(ReportService.calculateMonthlyExpenses(expenses, 0, 2026)).toBe(0.3);
  expect(AnalyticsService.getCategoryBreakdown(expenses)).toEqual([{ category: "Groceries", amount: 0.3 }]);
  const budget = new Budget("1", category, 0.4, Frequency.MONTHLY);
  for (const usage of [AnalyticsService.calculateBudgetUsage([budget], expenses, date)[0], BudgetService.getBudgetUsage(budget, expenses, date)]) {
    expect(usage.spentAmount).toBe(0.3);
    expect(usage.remainingAmount).toBe(0.1);
    expect(usage.percentageUsed).toBe(75);
  }
});

it("does not mark a fully spent decimal budget as over budget", () => {
  const budget = new Budget("1", category, 0.3, Frequency.MONTHLY);
  expect(BudgetService.getBudgetUsage(budget, expenses, date).isOverBudget).toBe(false);
  expect(AnalyticsService.calculateBudgetUsage([budget], expenses, date)[0].remainingAmount).toBe(0);
});

describe.each([GetReportUseCase, GetMonthlyReportUseCase, GetDashboardSummaryUseCase])("%p decimal reporting", (UseCase) => {
  it("returns exact totals and savings from persisted major-unit amounts", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();
    await incomeRepository.save(new Income("1", "Income", 0.4, date, "Employer"));
    for (const expense of expenses) await expenseRepository.save(expense);
    const report = await new UseCase(incomeRepository, expenseRepository).execute();
    expect(report.totalIncome).toBe(0.4);
    expect(report.totalExpenses).toBe(0.3);
    expect(report.savings).toBe(0.1);
    const insights = await new GetSavingsInsightsUseCase(incomeRepository, expenseRepository).execute();
    expect(insights.savings).toBe(0.1);
    expect(insights.savingsRate).toBe(25);
  });
});

it("fails explicitly on unsupported stored precision instead of rounding it", () => {
  expect(() => ReportService.calculateTotalExpenses([new Expense("bad", "Bad", 1.005, date, category)])).toThrow();
});
