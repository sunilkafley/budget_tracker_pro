import { GetAllBudgetsUseCase } from "../../src/application/useCases/GetAllBudgetsUseCase";
import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";
import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

describe("GetAllBudgetsUseCase", () => {
  it("returns all budgets", async () => {
    const repository = new FakeBudgetRepository();

    const groceryCategory = new Category("1", "Grocery", CategoryType.GROCERY);

    const transportCategory = new Category(
      "2",
      "Transport",
      CategoryType.TRANSPORT,
    );

    const budget1 = new Budget("1", groceryCategory, 500, Frequency.MONTHLY);

    const budget2 = new Budget("2", transportCategory, 300, Frequency.MONTHLY);

    await repository.save(budget1);
    await repository.save(budget2);

    const useCase = new GetAllBudgetsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
  });

  it("returns empty array when no budgets exist", async () => {
    const repository = new FakeBudgetRepository();

    const useCase = new GetAllBudgetsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
