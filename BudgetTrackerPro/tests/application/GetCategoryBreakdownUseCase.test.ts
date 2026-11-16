import { GetCategoryBreakdownUseCase } from "../../src/application/useCases/GetCategoryBreakdownUseCase";

import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetCategoryBreakdownUseCase", () => {
  it("should return grouped category totals", async () => {
    const expenseRepository = new FakeExpenseRepository();

    const groceryCategory = new Category(
      "1",
      "Groceries",
      CategoryType.GROCERY,
    );

    const transportCategory = new Category(
      "2",
      "Transport",
      CategoryType.TRANSPORT,
    );

    await expenseRepository.save(
      new Expense("1", "Food", 100, new Date(), groceryCategory),
    );

    await expenseRepository.save(
      new Expense("2", "More Food", 50, new Date(), groceryCategory),
    );

    await expenseRepository.save(
      new Expense("3", "Fuel", 80, new Date(), transportCategory),
    );

    const useCase = new GetCategoryBreakdownUseCase(expenseRepository);

    const result = await useCase.execute();

    expect(result).toEqual([
      {
        category: "Groceries",
        amount: 150,
      },
      {
        category: "Transport",
        amount: 80,
      },
    ]);
  });

  it("should return empty array when there are no expenses", async () => {
    const expenseRepository = new FakeExpenseRepository();

    const useCase = new GetCategoryBreakdownUseCase(expenseRepository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
