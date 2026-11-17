import { GetBudgetByIdUseCase } from "../../src/application/useCases/GetBudgetByIdUseCase";
import { UpdateBudgetUseCase } from "../../src/application/useCases/UpdateBudgetUseCase";
import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";
import { Budget } from "../../src/domain/models/Budget";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";

const makeBudget = () => new Budget("budget", new Category("legacy", "Food", CategoryType.GROCERY), 20, Frequency.WEEKLY);

it("loads the persisted frequency and category for editing", async () => {
  const repository = new FakeBudgetRepository();
  const budget = makeBudget();
  await repository.save(budget);
  await expect(new GetBudgetByIdUseCase(repository).execute(budget.id)).resolves.toEqual(budget);
});

it("rejects missing budgets on load and update", async () => {
  const repository = new FakeBudgetRepository();
  await expect(new GetBudgetByIdUseCase(repository).execute("missing")).rejects.toThrow("Budget not found");
  await expect(new UpdateBudgetUseCase(repository).execute(makeBudget())).rejects.toThrow("Budget not found");
});

it("preserves a weekly frequency on amount-only updates", async () => {
  const repository = new FakeBudgetRepository();
  await repository.save(makeBudget());
  const stored = await new GetBudgetByIdUseCase(repository).execute("budget");
  await new UpdateBudgetUseCase(repository).execute(new Budget(stored.id, stored.category, 30, stored.frequency));
  expect(await repository.getById("budget")).toMatchObject({ limitAmount: 30, frequency: Frequency.WEEKLY, category: { id: "legacy" } });
});

it("propagates editor read and update failures", async () => {
  const repository = new FakeBudgetRepository();
  await repository.save(makeBudget());
  const read = jest.spyOn(repository, "getById").mockRejectedValue(new Error("Read failed"));
  await expect(new GetBudgetByIdUseCase(repository).execute("budget")).rejects.toThrow("Read failed");
  await expect(new UpdateBudgetUseCase(repository).execute(makeBudget())).rejects.toThrow("Read failed");
  read.mockRestore();
  jest.spyOn(repository, "update").mockRejectedValue(new Error("Write failed"));
  await expect(new UpdateBudgetUseCase(repository).execute(makeBudget())).rejects.toThrow("Write failed");
});
