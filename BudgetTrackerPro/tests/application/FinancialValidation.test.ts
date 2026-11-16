import { AddIncomeUseCase } from "../../src/application/useCases/AddIncomeUseCase";
import { UpdateIncomeUseCase } from "../../src/application/useCases/UpdateIncomeUseCase";
import { AddExpenseUseCase } from "../../src/application/useCases/AddExpenseUseCase";
import { UpdateExpenseUseCase } from "../../src/application/useCases/UpdateExpenseUseCase";
import { CreateBudgetUseCase } from "../../src/application/useCases/CreateBudgetUseCase";
import { UpdateBudgetUseCase } from "../../src/application/useCases/UpdateBudgetUseCase";
import { CreateRecurringPaymentUseCase } from "../../src/application/useCases/CreateRecurringPaymentUseCase";
import { UpdateRecurringPaymentUseCase } from "../../src/application/useCases/UpdateRecurringPaymentUseCase";
import { CompleteRecurringPaymentUseCase } from "../../src/application/useCases/CompleteRecurringPaymentUseCase";
import { Income } from "../../src/domain/models/Income";
import { Expense } from "../../src/domain/models/Expense";
import { Budget } from "../../src/domain/models/Budget";
import { RecurringPayment } from "../../src/domain/models/RecurringPayment";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";
import { Frequency } from "../../src/domain/enums/Frequency";
import { FakeIncomeRepository } from "../../src/infrastructure/repositories/FakeIncomeRepository";
import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { FakeBudgetRepository } from "../../src/infrastructure/repositories/FakeBudgetRepository";
import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

const category = new Category("grocery", "Groceries", CategoryType.GROCERY);
const date = new Date(2026, 0, 15);

function operation<RecordType>(
  record: RecordType,
  repository: {
    save(record: RecordType): Promise<void>;
    update(record: RecordType): Promise<void>;
  },
  useCase: { execute(record: RecordType): Promise<void> },
) {
  return {
    record,
    save: jest.spyOn(repository, "save"),
    update: jest.spyOn(repository, "update"),
    execute: () => useCase.execute(record),
  };
}

const operations = [
  ...[false, true].map((update) => ({
    name: `${update ? "update" : "add"} income`,
    create: (amount: number) => {
      const repository = new FakeIncomeRepository();
      return operation(new Income("1", "Salary", amount, date, "Employer"), repository,
        update ? new UpdateIncomeUseCase(repository) : new AddIncomeUseCase(repository));
    },
  })),
  ...[false, true].map((update) => ({
    name: `${update ? "update" : "add"} expense`,
    create: (amount: number) => {
      const repository = new FakeExpenseRepository();
      return operation(new Expense("1", "Food", amount, date, category), repository,
        update ? new UpdateExpenseUseCase(repository) : new AddExpenseUseCase(repository));
    },
  })),
  ...[false, true].map((update) => ({
    name: `${update ? "update" : "create"} budget`,
    create: (amount: number) => {
      const repository = new FakeBudgetRepository();
      return operation(new Budget("1", category, amount, Frequency.MONTHLY), repository,
        update ? new UpdateBudgetUseCase(repository) : new CreateBudgetUseCase(repository));
    },
  })),
  ...[false, true].map((update) => ({
    name: `${update ? "update" : "create"} recurring payment`,
    create: (amount: number) => {
      const repository = new FakeRecurringPaymentRepository();
      return operation(new RecurringPayment("1", "Food", amount, CategoryType.GROCERY, Frequency.MONTHLY, date), repository,
        update ? new UpdateRecurringPaymentUseCase(repository) : new CreateRecurringPaymentUseCase(repository));
    },
  })),
];

describe.each(operations)("$name validation", ({ create }) => {
  it.each([0, -1, NaN, Infinity, -Infinity, 0.001, 1.005, 1_000_000_000_000.01])(
    "rejects amount %s without writing", async (amount) => {
      const subject = create(amount);
      await expect(subject.execute()).rejects.toThrow();
      expect(subject.save).not.toHaveBeenCalled();
      expect(subject.update).not.toHaveBeenCalled();
    },
  );

  it.each([0.01, 0.29, 1.15, 1_000_000_000_000])("accepts valid amount %s unchanged", async (amount) => {
    const subject = create(amount);
    await subject.execute();
    expect([...subject.save.mock.calls, ...subject.update.mock.calls]).toEqual([[subject.record]]);
  });

  it("propagates repository write failures", async () => {
    const subject = create(10);
    const failure = new Error("Storage unavailable");
    subject.save.mockRejectedValueOnce(failure);
    subject.update.mockRejectedValueOnce(failure);
    await expect(subject.execute()).rejects.toBe(failure);
  });

  it("rejects invalid dates, categories and frequencies where applicable", async () => {
    const invalidDate = create(10);
    if ("transactionDate" in invalidDate.record) {
      invalidDate.record.transactionDate = new Date("invalid");
    } else if ("nextDueDate" in invalidDate.record) {
      invalidDate.record.nextDueDate = new Date("invalid");
    } else {
      invalidDate.record.frequency = "INVALID" as Frequency;
    }
    await expect(invalidDate.execute()).rejects.toThrow();
    expect(invalidDate.save).not.toHaveBeenCalled();
    expect(invalidDate.update).not.toHaveBeenCalled();

    const invalidCategory = create(10);
    if (invalidCategory.record instanceof Income) return;
    if (invalidCategory.record instanceof RecurringPayment) {
      invalidCategory.record.category = CategoryType.INCOME;
    } else {
      invalidCategory.record.category = new Category("income", "Income", CategoryType.INCOME);
    }
    await expect(invalidCategory.execute()).rejects.toThrow();
    expect(invalidCategory.save).not.toHaveBeenCalled();
    expect(invalidCategory.update).not.toHaveBeenCalled();
  });
});

it.each([
  { name: "nonfinite amount", corrupt: (payment: RecurringPayment) => { payment.amount = NaN; } },
  { name: "invalid date", corrupt: (payment: RecurringPayment) => { payment.nextDueDate = new Date("invalid"); } },
  { name: "invalid frequency", corrupt: (payment: RecurringPayment) => { payment.frequency = "INVALID" as Frequency; } },
  { name: "income category", corrupt: (payment: RecurringPayment) => { payment.category = CategoryType.INCOME; } },
  { name: "blank name", corrupt: (payment: RecurringPayment) => { payment.name = " "; } },
])("blocks completing a recurring payment with $name before creating any expense", async ({ corrupt }) => {
  const recurringRepository = new FakeRecurringPaymentRepository();
  const expenseRepository = new FakeExpenseRepository();
  const payment = new RecurringPayment("1", "Food", 10, CategoryType.GROCERY, Frequency.MONTHLY, date);
  corrupt(payment);
  await recurringRepository.save(payment);
  const update = jest.spyOn(recurringRepository, "update");
  await expect(new CompleteRecurringPaymentUseCase(recurringRepository, expenseRepository).execute("1")).rejects.toThrow();
  expect(await expenseRepository.getAll()).toEqual([]);
  expect(update).not.toHaveBeenCalled();
});
