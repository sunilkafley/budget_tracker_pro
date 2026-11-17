import { ReportService } from "../../src/domain/services/ReportService";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("ReportService.calculateMonthlyExpenses", () => {
  const category = new Category("grocery", "Groceries", CategoryType.GROCERY);

  it("uses transaction dates to select the requested zero-based month and year", () => {
    const expenses = [
      new Expense("1", "January", 20, new Date(2026, 0, 1), category),
      new Expense("2", "January end", 30, new Date(2026, 0, 31), category),
      new Expense("3", "February", 80, new Date(2026, 1, 1), category),
      new Expense("4", "Previous year", 90, new Date(2025, 0, 1), category),
    ];

    expect(ReportService.calculateMonthlyExpenses(expenses, 0, 2026)).toBe(50);
  });

  it("returns zero when no expense matches the requested period", () => {
    const expense = new Expense("1", "January", 20, new Date(2026, 0, 1), category);

    expect(ReportService.calculateMonthlyExpenses([expense], 1, 2026)).toBe(0);
    expect(ReportService.calculateMonthlyExpenses([], 0, 2026)).toBe(0);
  });
});
