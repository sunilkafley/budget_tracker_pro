import { GetReportUseCase } from "../../src/application/useCases/GetReportUseCase";

import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetReportUseCase", () => {
  it("should build a complete report", async () => {
    const incomeRepository = new FakeIncomeRepository();

    const expenseRepository = new FakeExpenseRepository();

    const category = new Category("1", "Groceries", CategoryType.GROCERY);

    await incomeRepository.save(
      new Income("1", "Salary", 5000, new Date(), "Employer"),
    );

    await expenseRepository.save(
      new Expense("1", "Food", 2000, new Date(), category),
    );

    const useCase = new GetReportUseCase(incomeRepository, expenseRepository);

    const report = await useCase.execute();

    expect(report.totalIncome).toBe(5000);
    expect(report.totalExpenses).toBe(2000);
    expect(report.savings).toBe(3000);
    expect(report.savingsRate).toBe(60);
    expect(report.topCategory).toBe("Groceries");

    expect(report.categoryBreakdown.length).toBe(1);
  });

  it("should filter report by month and year", async () => {
    const incomeRepository = new FakeIncomeRepository();

    const expenseRepository = new FakeExpenseRepository();

    const category = new Category("1", "Groceries", CategoryType.GROCERY);

    await incomeRepository.save(
      new Income("1", "June Salary", 5000, new Date(2026, 5, 15), "Employer"),
    );

    await incomeRepository.save(
      new Income("2", "May Salary", 3000, new Date(2026, 4, 15), "Employer"),
    );

    await expenseRepository.save(
      new Expense("1", "June Grocery", 1000, new Date(2026, 5, 20), category),
    );

    await expenseRepository.save(
      new Expense("2", "May Grocery", 500, new Date(2026, 4, 20), category),
    );

    const useCase = new GetReportUseCase(incomeRepository, expenseRepository);

    const report = await useCase.execute(6, 2026);

    expect(report.totalIncome).toBe(5000);

    expect(report.totalExpenses).toBe(1000);

    expect(report.savings).toBe(4000);
  });
});
