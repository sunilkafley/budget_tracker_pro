import { GetMonthlyReportUseCase } from "../../src/application/useCases/GetMonthlyReportUseCase";

import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";

import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetMonthlyReportUseCase", () => {
  it("should calculate totals and savings", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();

    const category = new Category("1", "Food", CategoryType.GROCERY);

    await incomeRepository.save(
      new Income("1", "Salary", 5000, new Date(), "Employer"),
    );

    await incomeRepository.save(
      new Income("2", "Freelance", 1000, new Date(), "Client"),
    );

    await expenseRepository.save(
      new Expense("1", "Groceries", 800, new Date(), category),
    );

    await expenseRepository.save(
      new Expense("2", "Fuel", 200, new Date(), category),
    );

    const useCase = new GetMonthlyReportUseCase(
      incomeRepository,
      expenseRepository,
    );

    const result = await useCase.execute();

    expect(result).toEqual({
      totalIncome: 6000,
      totalExpenses: 1000,
      savings: 5000,
    });
  });

  it("should return zeros when there is no data", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();

    const useCase = new GetMonthlyReportUseCase(
      incomeRepository,
      expenseRepository,
    );

    const result = await useCase.execute();

    expect(result).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      savings: 0,
    });
  });
});
