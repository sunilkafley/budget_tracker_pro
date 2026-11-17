import { GetBudgetUsageUseCase } from "../../src/application/useCases/GetBudgetUsageUseCase";
import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { Budget } from "../../src/domain/models/Budget";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

it("loads period-aware usage without altering stored records", async () => {
  const budgets = new FakeBudgetRepository();
  const expenses = new FakeExpenseRepository();
  const category = new Category("1", "Food", CategoryType.GROCERY);
  const budget = new Budget("1", category, 100, Frequency.MONTHLY);
  await budgets.save(budget);
  await expenses.save(new Expense("old", "Old", 80, new Date(2025, 11, 31), category));
  await expenses.save(new Expense("now", "Now", 20, new Date(2026, 0, 1), category));
  const result = await new GetBudgetUsageUseCase(budgets, expenses).execute(new Date(2026, 0, 15));
  expect(result[0]).toMatchObject({ budgetId: "1", spentAmount: 20, remainingAmount: 80 });
  expect(await budgets.getById("1")).toEqual(budget);
  expect(await expenses.getAll()).toHaveLength(2);
});

it("returns no usage for empty repositories", async () => {
  await expect(new GetBudgetUsageUseCase(new FakeBudgetRepository(), new FakeExpenseRepository()).execute()).resolves.toEqual([]);
});

it.each(["budgets", "expenses"])("propagates %s read failures", async (failedRepository) => {
  const budgets = new FakeBudgetRepository();
  const expenses = new FakeExpenseRepository();
  jest.spyOn(failedRepository === "budgets" ? budgets : expenses, "getAll").mockRejectedValue(new Error("Storage unavailable"));
  await expect(new GetBudgetUsageUseCase(budgets, expenses).execute()).rejects.toThrow("Storage unavailable");
});
