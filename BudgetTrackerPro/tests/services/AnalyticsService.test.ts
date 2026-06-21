import { AnalyticsService } from "../../src/domain/services/AnalyticsService";

import { Budget } from "../../src/domain/models/Budget";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";

import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

describe("AnalyticsService", () => {
  it("calculates budget usage correctly", () => {
    const groceryCategory = new Category("1", "Grocery", CategoryType.GROCERY);

    const budget = new Budget(
      "budget-1",
      groceryCategory,
      500,
      Frequency.MONTHLY,
    );

    const expenses = [
      new Expense("expense-1", "Milk", 100, new Date(), groceryCategory),

      new Expense("expense-2", "Bread", 50, new Date(), groceryCategory),

      new Expense("expense-3", "Vegetables", 75, new Date(), groceryCategory),
    ];

    const result = AnalyticsService.calculateBudgetUsage([budget], expenses);

    expect(result).toHaveLength(1);

    expect(result[0].budgetAmount).toBe(500);

    expect(result[0].spentAmount).toBe(225);

    expect(result[0].remainingAmount).toBe(275);

    expect(result[0].percentageUsed).toBe(45);
  });

  it("returns zero spent when no expenses exist", () => {
    const groceryCategory = new Category("1", "Grocery", CategoryType.GROCERY);

    const budget = new Budget(
      "budget-1",
      groceryCategory,
      500,
      Frequency.MONTHLY,
    );

    const result = AnalyticsService.calculateBudgetUsage([budget], []);

    expect(result[0].spentAmount).toBe(0);

    expect(result[0].remainingAmount).toBe(500);

    expect(result[0].percentageUsed).toBe(0);
  });

  it("ignores expenses from different categories", () => {
    const groceryCategory = new Category("1", "Grocery", CategoryType.GROCERY);

    const transportCategory = new Category(
      "2",
      "Transport",
      CategoryType.TRANSPORT,
    );

    const budget = new Budget(
      "budget-1",
      groceryCategory,
      500,
      Frequency.MONTHLY,
    );

    const expenses = [
      new Expense(
        "expense-1",
        "Bus Ticket",
        200,
        new Date(),
        transportCategory,
      ),
    ];

    const result = AnalyticsService.calculateBudgetUsage([budget], expenses);

    expect(result[0].spentAmount).toBe(0);

    expect(result[0].remainingAmount).toBe(500);

    expect(result[0].percentageUsed).toBe(0);
  });
});
