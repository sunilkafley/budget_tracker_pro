import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { Income } from "../../src/domain/models/Income";

describe("FakeIncomeRepository", () => {
  it("should save an income", async () => {
    const repository = new FakeIncomeRepository();

    const income = new Income("1", "Salary", 5000, new Date(), "Employment");

    await repository.save(income);

    const incomes = await repository.getAll();

    expect(incomes).toHaveLength(1);
    expect(incomes[0].id).toBe("1");
  });
});
