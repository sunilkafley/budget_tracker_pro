import { FakeRecurringOccurrenceRepository } from "../../src/infrastructure/repositories/FakeRecurringOccurrenceRepository";
import { CompleteRecurringPaymentUseCase } from "../../src/application/useCases/CompleteRecurringPaymentUseCase";

import { FakeExpenseRepository } from "../../src/infrastructure/repositories/FakeExpenseRepository";
import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("CompleteRecurringPaymentUseCase", () => {
  let recurringPaymentRepository: FakeRecurringPaymentRepository;
  let expenseRepository: FakeExpenseRepository;

  let useCase: CompleteRecurringPaymentUseCase;

  beforeEach(() => {
    recurringPaymentRepository = new FakeRecurringPaymentRepository();

    expenseRepository = new FakeExpenseRepository();

    useCase = new CompleteRecurringPaymentUseCase(
      recurringPaymentRepository,
      expenseRepository,
      new FakeRecurringOccurrenceRepository(),
    );
  });

  it("creates an expense when a recurring payment is completed", async () => {
    const payment = new RecurringPayment(
      "1",
      "Netflix",
      25,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date("2025-05-01"),
    );

    await recurringPaymentRepository.save(payment);

    await useCase.execute(payment.id);

    const expenses = await expenseRepository.getAll();

    expect(expenses).toHaveLength(1);

    expect(expenses[0].title).toBe("Netflix");

    expect(expenses[0].amount).toBe(25);
  });

  it("creates an expense with the correct category", async () => {
    const payment = new RecurringPayment(
      "1",
      "Gym Membership",
      20,
      CategoryType.FITNESS,
      Frequency.MONTHLY,
      new Date("2025-05-01"),
    );

    await recurringPaymentRepository.save(payment);

    await useCase.execute(payment.id);

    const expenses = await expenseRepository.getAll();

    expect(expenses[0].category.type).toBe(CategoryType.FITNESS);
  });

  it("advances a weekly payment by one week", async () => {
    const payment = new RecurringPayment(
      "1",
      "Gym",
      20,
      CategoryType.FITNESS,
      Frequency.WEEKLY,
      new Date("2025-05-01"),
    );

    await recurringPaymentRepository.save(payment);

    await useCase.execute(payment.id);

    const updated = await recurringPaymentRepository.getById(payment.id);

    expect(updated?.nextDueDate.toISOString()).toBe(
      new Date("2025-05-08").toISOString(),
    );
  });

  it("advances a monthly payment by one month", async () => {
    const payment = new RecurringPayment(
      "1",
      "Netflix",
      25,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date("2025-05-01"),
    );

    await recurringPaymentRepository.save(payment);

    await useCase.execute(payment.id);

    const updated = await recurringPaymentRepository.getById(payment.id);

    expect(updated?.nextDueDate.toISOString()).toBe(
      new Date("2025-06-01").toISOString(),
    );
  });

  it("advances a yearly payment by one year", async () => {
    const payment = new RecurringPayment(
      "1",
      "Insurance",
      500,
      CategoryType.INSURANCE,
      Frequency.YEARLY,
      new Date("2025-05-01"),
    );

    await recurringPaymentRepository.save(payment);

    await useCase.execute(payment.id);

    const updated = await recurringPaymentRepository.getById(payment.id);

    expect(updated?.nextDueDate.toISOString()).toBe(
      new Date("2026-05-01").toISOString(),
    );
  });

  it("updates the recurring payment repository", async () => {
    const payment = new RecurringPayment(
      "1",
      "Spotify",
      15,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date("2025-05-01"),
    );

    await recurringPaymentRepository.save(payment);

    await useCase.execute(payment.id);

    const updated = await recurringPaymentRepository.getById(payment.id);

    expect(updated).not.toBeNull();

    expect(updated?.nextDueDate.toISOString()).toBe(
      new Date("2025-06-01").toISOString(),
    );
  });

  it("throws when recurring payment does not exist", async () => {
    await expect(useCase.execute("missing-id")).rejects.toThrow(
      "Recurring payment not found",
    );
  });
});
