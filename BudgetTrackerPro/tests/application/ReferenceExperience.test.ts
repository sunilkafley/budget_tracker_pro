import { GetInsightsUseCase } from "../../src/application/useCases/GetInsightsUseCase";
import { summarizeMonthlyBudgets } from "../../src/domain/services/MonthlyBudgetSummary";
import { filterActivity } from "../../src/application/filterActivity";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { Expense } from "../../src/domain/models/Expense";
import { Income } from "../../src/domain/models/Income";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";
const category = new Category("food", "Groceries", CategoryType.GROCERY);
const now = new Date(2026, 10, 18, 12);
it("calculates exact month-to-date totals, daily/weekly buckets and elapsed-day average", async () => {
  const incomes = new FakeIncomeRepository();
  const expenses = new FakeExpenseRepository();
  await incomes.save(
    new Income("income", "Salary", 10, new Date(2026, 10, 1), "Employer"),
  );
  for (const [id, amount, date] of [
    ["a", 0.1, new Date(2026, 10, 17)],
    ["b", 0.2, new Date(2026, 10, 18)],
    ["old", 5, new Date(2025, 10, 18)],
    ["future", 8, new Date(2026, 10, 19)],
  ] as const)
    await expenses.save(new Expense(id, "Lunch", amount, date, category));
  const result = await new GetInsightsUseCase(incomes, expenses).execute(
    11,
    2026,
    now,
  );
  expect(result.report.totalExpenses).toBe(0.3);
  expect(result.report.savings).toBe(9.7);
  expect(result.daily).toHaveLength(7);
  expect(result.daily.at(-1)?.amount).toBe(0.2);
  expect(result.weekly.reduce((sum, point) => sum + point.amount, 0)).toBe(0.3);
  expect(result.averageDailySpend).toBe(0.02);
  expect(result.daysInPeriod).toBe(18);
});
it("handles leap February and empty/future periods without NaN", async () => {
  const useCase = new GetInsightsUseCase(
    new FakeIncomeRepository(),
    new FakeExpenseRepository(),
  );
  expect((await useCase.execute(2, 2024, now)).daysInPeriod).toBe(29);
  const future = await useCase.execute(12, 2026, now);
  expect(future.averageDailySpend).toBe(0);
  expect(future.daily).toEqual([]);
  await expect(useCase.execute(13, 2026, now)).rejects.toThrow();
});
it("propagates repository failures and rejects corrupted dates/amounts", async () => {
  const incomes = new FakeIncomeRepository();
  const expenses = new FakeExpenseRepository();
  const useCase = new GetInsightsUseCase(incomes, expenses);
  jest.spyOn(incomes, "getAll").mockRejectedValueOnce(new Error("read failed"));
  await expect(useCase.execute(11, 2026, now)).rejects.toThrow("read failed");
  await expenses.save(
    new Expense("bad", "Bad", 1, new Date("invalid"), category),
  );
  await expect(useCase.execute(11, 2026, now)).rejects.toThrow();
});
it("summarizes only monthly budgets, without counting duplicate category spending twice", () => {
  const base = {
    budgetId: "a",
    category,
    frequency: Frequency.MONTHLY,
    periodStart: new Date(2026, 10, 1),
    periodEnd: new Date(2026, 11, 1),
    budgetAmount: 10,
    spentAmount: 0.3,
    remainingAmount: 9.7,
    percentageUsed: 3,
    isOverBudget: false,
  };
  const result = summarizeMonthlyBudgets([
    base,
    { ...base, budgetId: "b", budgetAmount: 20 },
    { ...base, budgetId: "w", frequency: Frequency.WEEKLY },
  ]);
  expect(result).toMatchObject({
    limit: 10,
    spent: 0.3,
    remaining: 9.7,
    count: 1,
  });
  expect(summarizeMonthlyBudgets([]).count).toBe(0);
});
it("filters activity case-insensitively by title/category/source and transaction kind", () => {
  const expense = {
    kind: "expense" as const,
    transaction: new Expense("1", "Weekly shop", 1, now, category),
  };
  const income = {
    kind: "income" as const,
    transaction: new Income("1", "Pay", 2, now, "Acme"),
  };
  expect(filterActivity([expense, income], " GROC ", "all")).toEqual([expense]);
  expect(filterActivity([expense, income], "acme", "income")).toEqual([income]);
  expect(filterActivity([expense, income], "", "expense")).toEqual([expense]);
  expect(filterActivity([expense, income], "missing", "all")).toEqual([]);
});
it("keeps overspending and negative cashflow visible with cent-accurate totals", async () => {
  const incomes = new FakeIncomeRepository();
  const expenses = new FakeExpenseRepository();
  await incomes.save(new Income("pay", "Pay", 0.1, now, "Work"));
  await expenses.save(new Expense("food", "Food", 0.3, now, category));
  const result = await new GetInsightsUseCase(incomes, expenses).execute(
    11,
    2026,
    now,
  );
  expect(result.report.savings).toBe(-0.2);
  expect(result.report.savingsRate).toBe(-200);
  const summary = summarizeMonthlyBudgets([
    {
      budgetId: "x",
      category,
      frequency: Frequency.MONTHLY,
      periodStart: new Date(2026, 10, 1),
      periodEnd: new Date(2026, 11, 1),
      budgetAmount: 0.1,
      spentAmount: 0.3,
      remainingAmount: -0.2,
      percentageUsed: 300,
      isOverBudget: true,
    },
  ]);
  expect(summary.remaining).toBe(-0.2);
  expect(summary.percentage).toBe(300);
});
it("fills missing daily buckets with zero and excludes the next month boundary", async () => {
  const incomes = new FakeIncomeRepository();
  const expenses = new FakeExpenseRepository();
  await expenses.save(
    new Expense("outside", "Future", 10, new Date(2026, 11, 1), category),
  );
  const result = await new GetInsightsUseCase(incomes, expenses).execute(
    11,
    2026,
    new Date(2026, 11, 5),
  );
  expect(result.daily.map((point) => point.amount)).toEqual([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  expect(result.daysInPeriod).toBe(30);
  expect(result.report.totalExpenses).toBe(0);
});
it("rejects unsupported stored precision in the selected period", async () => {
  const expenses = new FakeExpenseRepository();
  await expenses.save(new Expense("bad", "Bad", 0.001, now, category));
  await expect(
    new GetInsightsUseCase(new FakeIncomeRepository(), expenses).execute(
      11,
      2026,
      now,
    ),
  ).rejects.toThrow();
});
it('reports spending without income with finite savings-rate feedback', async()=>{
 const expenses=new FakeExpenseRepository();await expenses.save(new Expense('food','Food',1,now,category));
 const result=await new GetInsightsUseCase(new FakeIncomeRepository(),expenses).execute(11,2026,now);
 expect(result.report.savingsRate).toBe(0);expect(result.report.savings).toBe(-1);
});
