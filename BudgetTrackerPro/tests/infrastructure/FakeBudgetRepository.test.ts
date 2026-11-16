import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";
import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

describe("FakeBudgetRepository", () => {
  it("should save a budget", async () => {
    const repository = new FakeBudgetRepository();

    const category = new Category("1", "Food", CategoryType.GROCERY);

    const budget = new Budget("1", category, 1000, Frequency.MONTHLY);

    await repository.save(budget);

    const budgets = await repository.getAll();

    expect(budgets).toHaveLength(1);
    expect(budgets[0].id).toBe("1");
    expect(budgets[0].limitAmount).toBe(1000);
  });
});
