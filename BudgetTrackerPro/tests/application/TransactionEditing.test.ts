import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { UpdateIncomeUseCase } from "../../src/application/useCases/UpdateIncomeUseCase";
import { UpdateExpenseUseCase } from "../../src/application/useCases/UpdateExpenseUseCase";
import { GetIncomeByIdUseCase } from "../../src/application/useCases/GetIncomeByIdUseCase";
import { GetExpenseByIdUseCase } from "../../src/application/useCases/GetExpenseByIdUseCase";

const originalDate = new Date(2025, 3, 12);
const category = new Category("transport-legacy", "Transport", CategoryType.TRANSPORT);

describe("transaction editing", () => {
  it("preserves the income date and omitted notes while changing visible details", async () => {
    const repository = new FakeIncomeRepository();
    await repository.save(new Income("1", "Old", 10, originalDate, "Old source", "Keep notes"));
    await new UpdateIncomeUseCase(repository).execute(new Income("1", "New", 20, new Date(), "New source"));
    const updated = await repository.getById("1");
    expect(updated).toMatchObject({ title: "New", amount: 20, source: "New source", notes: "Keep notes", transactionDate: originalDate });
  });

  it("preserves the expense date and custom category identity; notes can be cleared", async () => {
    const repository = new FakeExpenseRepository();
    await repository.save(new Expense("1", "Old", 10, originalDate, category, "Old note"));
    await new UpdateExpenseUseCase(repository).execute(new Expense("1", "New", 20, new Date(), category, ""));
    expect(await repository.getById("1")).toMatchObject({ title: "New", amount: 20, transactionDate: originalDate, category, notes: "" });
  });

  it("allows intentionally changing an expense category and preserves omitted notes", async () => {
    const repository = new FakeExpenseRepository();
    await repository.save(new Expense("1", "Old", 10, originalDate, category, "Keep"));
    const replacement = new Category("HOUSING", "Housing", CategoryType.HOUSING);
    await new UpdateExpenseUseCase(repository).execute(new Expense("1", "New", 20, new Date(), replacement));
    expect(await repository.getById("1")).toMatchObject({ category: replacement, notes: "Keep", transactionDate: originalDate });
  });

  it.each(["income", "expense"] as const)("rejects updates to missing %s records without writing", async (kind) => {
    if (kind === "income") {
      const repository = new FakeIncomeRepository();
      const write = jest.spyOn(repository, "update");
      await expect(new UpdateIncomeUseCase(repository).execute(new Income("missing", "Title", 10, originalDate, "Source"))).rejects.toThrow("Income not found");
      expect(write).not.toHaveBeenCalled();
    } else {
      const repository = new FakeExpenseRepository();
      const write = jest.spyOn(repository, "update");
      await expect(new UpdateExpenseUseCase(repository).execute(new Expense("missing", "Title", 10, originalDate, category))).rejects.toThrow("Expense not found");
      expect(write).not.toHaveBeenCalled();
    }
  });

  it("loads both transaction types by ID, and fails explicitly on missing records or read failures", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();
    const income = new Income("1", "Title", 10, originalDate, "Source", "Note");
    const expense = new Expense("1", "Title", 10, originalDate, category, "Note");
    await incomeRepository.save(income);
    await expenseRepository.save(expense);
    const incomeReader = new GetIncomeByIdUseCase(incomeRepository);
    const expenseReader = new GetExpenseByIdUseCase(expenseRepository);
    expect(await incomeReader.execute("1")).toEqual(income);
    expect(await expenseReader.execute("1")).toEqual(expense);
    await expect(incomeReader.execute("missing")).rejects.toThrow("Income not found");
    await expect(expenseReader.execute("missing")).rejects.toThrow("Expense not found");
    const failure = new Error("Read failed");
    jest.spyOn(incomeRepository, "getById").mockRejectedValue(failure);
    jest.spyOn(expenseRepository, "getById").mockRejectedValue(failure);
    await expect(incomeReader.execute("1")).rejects.toBe(failure);
    await expect(expenseReader.execute("1")).rejects.toBe(failure);
    await expect(new UpdateIncomeUseCase(incomeRepository).execute(income)).rejects.toBe(failure);
    await expect(new UpdateExpenseUseCase(expenseRepository).execute(expense)).rejects.toBe(failure);
  });
});
