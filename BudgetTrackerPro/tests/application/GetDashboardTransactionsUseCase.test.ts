import { GetDashboardTransactionsUseCase } from "../../src/application/useCases/GetDashboardTransactionsUseCase";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetDashboardTransactionsUseCase", () => {
  it("combines both transaction types newest first without mutating repository order", async () => {
    const incomes = new FakeIncomeRepository();
    const expenses = new FakeExpenseRepository();
    const category = new Category("food", "Groceries", CategoryType.GROCERY);
    await incomes.save(new Income("same-id", "Old salary", 10, new Date(2026, 0, 1), "Employer"));
    await incomes.save(new Income("new", "Salary", 20, new Date(2026, 2, 1), "Employer"));
    await expenses.save(new Expense("same-id", "Food", 5, new Date(2026, 1, 1), category));
    const records = await new GetDashboardTransactionsUseCase(incomes, expenses).execute();
    expect(records.map((record) => [record.kind, record.transaction.title])).toEqual([
      ["income", "Salary"], ["expense", "Food"], ["income", "Old salary"],
    ]);
    expect((await incomes.getAll()).map((income) => income.title)).toEqual(["Old salary", "Salary"]);
  });

  it("retains older transactions so show-all can preserve edit/delete access", async () => {
    const incomes = new FakeIncomeRepository();
    for (let index = 1; index <= 8; index++) {
      await incomes.save(new Income(String(index), "Salary", 10, new Date(2026, 0, index), "Employer"));
    }
    expect(await new GetDashboardTransactionsUseCase(incomes, new FakeExpenseRepository()).execute()).toHaveLength(8);
  });

  it("handles empty data and propagates read errors", async () => {
    const incomes = new FakeIncomeRepository();
    const expenses = new FakeExpenseRepository();
    const useCase = new GetDashboardTransactionsUseCase(incomes, expenses);
    expect(await useCase.execute()).toEqual([]);
    const failure = new Error("Storage unavailable");
    jest.spyOn(expenses, "getAll").mockRejectedValueOnce(failure);
    await expect(useCase.execute()).rejects.toBe(failure);
    jest.spyOn(incomes, "getAll").mockRejectedValueOnce(failure);
    await expect(useCase.execute()).rejects.toBe(failure);
  });
});
