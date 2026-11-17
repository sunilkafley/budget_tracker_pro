import { GetDashboardSummaryUseCase } from "../../src/application/useCases/GetDashboardSummaryUseCase";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetDashboardSummaryUseCase", () => {
  it("should calculate dashboard summary", async () => {
    const incomeRepository = new FakeIncomeRepository();
    const expenseRepository = new FakeExpenseRepository();

    await incomeRepository.save(
      new Income("1", "Salary", 5000, new Date(), "Employment"),
    );

    const category = new Category("1", "Food", CategoryType.GROCERY);

    await expenseRepository.save(
      new Expense("1", "Groceries", 1000, new Date(), category),
    );

    const useCase = new GetDashboardSummaryUseCase(
      incomeRepository,
      expenseRepository,
    );

    const summary = await useCase.execute();

    expect(summary.totalIncome).toBe(5000);
    expect(summary.totalExpenses).toBe(1000);
    expect(summary.savings).toBe(4000);
  });
});
