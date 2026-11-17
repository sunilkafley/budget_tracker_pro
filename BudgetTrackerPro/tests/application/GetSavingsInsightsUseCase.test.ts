import { GetSavingsInsightsUseCase } from "../../src/application/useCases/GetSavingsInsightsUseCase";

import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";

import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetSavingsInsightsUseCase", () => {
  it("should calculate savings and savings rate", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();

    const category = new Category("1", "Food", CategoryType.GROCERY);

    await incomeRepository.save(
      new Income("1", "Salary", 5000, new Date(), "Employer"),
    );

    await expenseRepository.save(
      new Expense("1", "Groceries", 3000, new Date(), category),
    );

    const useCase = new GetSavingsInsightsUseCase(
      incomeRepository,
      expenseRepository,
    );

    const result = await useCase.execute();

    expect(result).toEqual({
      savings: 2000,
      savingsRate: 40,
    });
  });

  it("should return zero values when there is no data", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();

    const useCase = new GetSavingsInsightsUseCase(
      incomeRepository,
      expenseRepository,
    );

    const result = await useCase.execute();

    expect(result).toEqual({
      savings: 0,
      savingsRate: 0,
    });
  });
});
