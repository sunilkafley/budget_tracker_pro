import { AddIncomeUseCase } from "../../src/application/useCases/AddIncomeUseCase";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { Income } from "../../src/domain/models/Income";

describe("AddIncomeUseCase", () => {
  it("should save a valid income", async () => {
    const repository = new FakeIncomeRepository();

    const useCase = new AddIncomeUseCase(repository);

    const income = new Income("1", "Salary", 5000, new Date(), "Employment");

    await useCase.execute(income);

    const incomes = await repository.getAll();

    expect(incomes).toHaveLength(1);
    expect(incomes[0].id).toBe("1");
    expect(incomes[0].amount).toBe(5000);
  });

  it("should throw an error for invalid income", async () => {
    const repository = new FakeIncomeRepository();
    const useCase = new AddIncomeUseCase(repository);

    const income = new Income("1", "Salary", 0, new Date(), "Employment");

    await expect(useCase.execute(income)).rejects.toThrow();
  });
});
