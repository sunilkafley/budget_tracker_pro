import { DeleteBudgetUseCase } from "../../src/application/useCases/DeleteBudgetUseCase";

import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";

import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";

import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

describe("DeleteBudgetUseCase", () => {
  it("deletes a budget", async () => {
    const repository = new FakeBudgetRepository();

    const useCase = new DeleteBudgetUseCase(repository);

    const category = new Category("1", "Grocery", CategoryType.GROCERY);

    const budget = new Budget("budget-1", category, 500, Frequency.MONTHLY);

    await repository.save(budget);

    await useCase.execute(budget.id);

    const deleted = await repository.getById(budget.id);

    expect(deleted).toBeNull();
  });
});
