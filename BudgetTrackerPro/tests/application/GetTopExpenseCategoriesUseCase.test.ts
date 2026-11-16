import { GetTopExpenseCategoriesUseCase } from "../../src/application/useCases/GetTopExpenseCategoriesUseCase";

import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetTopExpenseCategoriesUseCase", () => {
  it("should return the highest spending category", async () => {
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
      new Expense("1", "Food", 300, new Date(), groceryCategory),
    );

    await expenseRepository.save(
      new Expense("2", "More Food", 200, new Date(), groceryCategory),
    );

    await expenseRepository.save(
      new Expense("3", "Fuel", 150, new Date(), transportCategory),
    );

    const useCase = new GetTopExpenseCategoriesUseCase(expenseRepository);

    const result = await useCase.execute();

    expect(result).toBe("Groceries");
  });

  it("should return 'No Data' when no expenses exist", async () => {
    const expenseRepository = new FakeExpenseRepository();

    const useCase = new GetTopExpenseCategoriesUseCase(expenseRepository);

    const result = await useCase.execute();

    expect(result).toBe("No Data");
  });
});
