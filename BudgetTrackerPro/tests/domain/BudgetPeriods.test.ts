import { BudgetService } from "../../src/domain/services/BudgetService";
import { AnalyticsService } from "../../src/domain/services/AnalyticsService";
import { Budget } from "../../src/domain/models/Budget";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

const category = new Category("legacy-budget", "Food", CategoryType.GROCERY);
const expenseCategory = new Category("different-legacy-id", "Groceries", CategoryType.GROCERY);
const expense = (date: Date, amount = 0.1, selectedCategory = expenseCategory) =>
  new Expense(String(date.getTime()), "Food", amount, date, selectedCategory);

describe("current calendar budget periods", () => {
  it.each([
    [Frequency.WEEKLY, new Date(2026, 0, 1, 12), new Date(2025, 11, 29), new Date(2026, 0, 5)],
    [Frequency.WEEKLY, new Date(2026, 0, 4, 23), new Date(2025, 11, 29), new Date(2026, 0, 5)],
    [Frequency.WEEKLY, new Date(2026, 0, 5), new Date(2026, 0, 5), new Date(2026, 0, 12)],
    [Frequency.MONTHLY, new Date(2024, 1, 29), new Date(2024, 1, 1), new Date(2024, 2, 1)],
    [Frequency.MONTHLY, new Date(2026, 11, 31), new Date(2026, 11, 1), new Date(2027, 0, 1)],
    [Frequency.YEARLY, new Date(2024, 1, 29), new Date(2024, 0, 1), new Date(2025, 0, 1)],
    // Calendar dates, rather than fixed millisecond durations, span DST changes.
    [Frequency.WEEKLY, new Date(2026, 8, 27), new Date(2026, 8, 21), new Date(2026, 8, 28)],
    [Frequency.WEEKLY, new Date(2026, 2, 8), new Date(2026, 2, 2), new Date(2026, 2, 9)],
  ])("%s uses local boundaries around %s", (frequency, referenceDate, start, end) => {
    const originalTime = referenceDate.getTime();
    const budget = new Budget("budget", category, 0.4, frequency);
    const expenses = [expense(new Date(start.getTime() - 1), 90), expense(start),
      expense(new Date(end.getTime() - 1), 0.2), expense(end, 80),
      expense(referenceDate, 50, new Category(category.id, "Transport", CategoryType.TRANSPORT))];
    const usage = BudgetService.getBudgetUsage(budget, expenses, referenceDate);
    expect(usage).toMatchObject({ periodStart: start, periodEnd: end, spentAmount: 0.3,
      remainingAmount: 0.1, percentageUsed: 75, isOverBudget: false, frequency });
    expect(AnalyticsService.calculateBudgetUsage([budget], expenses, referenceDate)[0]).toMatchObject(usage);
    expect(referenceDate.getTime()).toBe(originalTime);
    expect(expenses[1].transactionDate).toEqual(start);
  });

  it("handles empty, exactly spent, over-budget and legacy zero limits", () => {
    const date = new Date(2026, 0, 15);
    const budget = new Budget("budget", category, 0.3, Frequency.MONTHLY);
    expect(BudgetService.getBudgetUsage(budget, [], date)).toMatchObject({ spentAmount: 0, remainingAmount: 0.3, percentageUsed: 0 });
    expect(BudgetService.getBudgetUsage(budget, [expense(date, 0.3)], date)).toMatchObject({ remainingAmount: 0, isOverBudget: false, percentageUsed: 100 });
    expect(BudgetService.getBudgetUsage(budget, [expense(date, 0.4)], date)).toMatchObject({ remainingAmount: -0.1, isOverBudget: true });
    budget.limitAmount = 0;
    expect(BudgetService.getBudgetUsage(budget, [expense(date)], date)).toMatchObject({ percentageUsed: 0, isOverBudget: true });
  });

  it("rejects invalid reference dates, frequencies, relevant expense dates and invalid amounts", () => {
    const date = new Date(2026, 0, 15);
    const budget = new Budget("budget", category, 10, Frequency.MONTHLY);
    expect(() => BudgetService.getBudgetUsage(budget, [], new Date("bad"))).toThrow();
    expect(() => BudgetService.getBudgetUsage(budget, [expense(new Date("bad"))], date)).toThrow();
    expect(() => BudgetService.getBudgetUsage(budget, [expense(date, 1.005)], date)).toThrow();
    expect(() => BudgetService.getBudgetUsage(budget, [expense(date, -1)], date)).toThrow();
    budget.frequency = "INVALID" as Frequency;
    expect(() => BudgetService.getBudgetUsage(budget, [], date)).toThrow();
    budget.frequency = Frequency.MONTHLY;
    for (const limit of [NaN, Infinity, -1, 1.005]) {
      budget.limitAmount = limit;
      expect(() => BudgetService.getBudgetUsage(budget, [], date)).toThrow();
    }
  });
});
