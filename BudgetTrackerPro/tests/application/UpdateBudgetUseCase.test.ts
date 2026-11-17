import { UpdateBudgetUseCase } from "../../src/application/useCases/UpdateBudgetUseCase";

import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";

import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";

import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

describe("UpdateBudgetUseCase", () => {
  it("updates a budget", async () => {
    const repository = new FakeBudgetRepository();

    const useCase = new UpdateBudgetUseCase(repository);

    const category = new Category("1", "Grocery", CategoryType.GROCERY);

    const budget = new Budget("budget-1", category, 500, Frequency.MONTHLY);

    await repository.save(budget);

    budget.limitAmount = 700;

    await useCase.execute(budget);

    const updated = await repository.getById("budget-1");

    expect(updated?.limitAmount).toBe(700);
  });

  it("throws when amount is zero", async () => {
    const repository = new FakeBudgetRepository();

    const useCase = new UpdateBudgetUseCase(repository);

    const category = new Category("1", "Grocery", CategoryType.GROCERY);

    const budget = new Budget("budget-1", category, 0, Frequency.MONTHLY);

    await expect(useCase.execute(budget)).rejects.toThrow(
      "Budget amount must be greater than zero",
    );
  });
});
