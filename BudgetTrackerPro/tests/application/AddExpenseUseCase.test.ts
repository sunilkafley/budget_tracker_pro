import { AddExpenseUseCase } from "../../src/application/useCases/AddExpenseUseCase";

import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";

import { Expense } from "../../src/domain/models/Expense";

import { Category } from "../../src/domain/models/Category";

import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("AddExpenseUseCase", () => {
  it("should save a valid expense", async () => {
    // Arrange

    const repository = new FakeExpenseRepository();

    const useCase = new AddExpenseUseCase(repository);

    const category = new Category("cat-1", "Groceries", CategoryType.GROCERY);

    const expense = new Expense(
      "exp-1",
      "Weekly Groceries",
      150,
      new Date(),
      category,
      "Pak n Save",
    );

    // Act

    await useCase.execute(expense);

    const expenses = await repository.getAll();

    // Assert

    expect(expenses.length).toBe(1);

    expect(expenses[0].title).toBe("Weekly Groceries");
  });
});
