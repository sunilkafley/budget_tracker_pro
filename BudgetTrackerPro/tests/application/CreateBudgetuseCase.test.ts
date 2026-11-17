import { CreateBudgetUseCase } from "../../src/application/useCases/CreateBudgetUseCase";
import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";
import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

describe("CreateBudgetUseCase", () => {
  it("should save a valid budget", async () => {
    const repository = new FakeBudgetRepository();

    const useCase = new CreateBudgetUseCase(repository);

    const category = new Category("1", "Food", CategoryType.GROCERY);

    const budget = new Budget("1", category, 1000, Frequency.MONTHLY);

    await useCase.execute(budget);

    const budgets = await repository.getAll();

    expect(budgets).toHaveLength(1);
    expect(budgets[0].limitAmount).toBe(1000);
  });
  it("should throw when budget amount is zero", async () => {
    const repository = new FakeBudgetRepository();

    const useCase = new CreateBudgetUseCase(repository);

    const category = new Category("1", "Food", CategoryType.GROCERY);

    const budget = new Budget("1", category, 0, Frequency.MONTHLY);

    await expect(useCase.execute(budget)).rejects.toThrow(
      "Budget amount must be greater than zero",
    );
  });
});
