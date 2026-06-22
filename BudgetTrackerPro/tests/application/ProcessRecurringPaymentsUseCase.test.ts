import { ProcessRecurringPaymentsUseCase } from "../../src/application/useCases/ProcessRecurringPaymentsUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";

describe("ProcessRecurringPaymentsUseCase", () => {
  it("should advance an overdue monthly payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      Frequency.MONTHLY,
      new Date("2025-01-01"),
    );

    await repository.save(payment);

    const useCase = new ProcessRecurringPaymentsUseCase(repository);

    await useCase.execute();

    const payments = await repository.getAll();

    expect(payments[0].nextDueDate.getMonth()).toBeGreaterThan(0);
  });

  it("should advance an overdue weekly payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const payment = new RecurringPayment(
      "1",
      "Gym Membership",
      15,
      Frequency.WEEKLY,
      new Date("2025-01-01"),
    );

    await repository.save(payment);

    const useCase = new ProcessRecurringPaymentsUseCase(repository);

    await useCase.execute();

    const payments = await repository.getAll();

    expect(payments[0].nextDueDate.getTime()).toBeGreaterThan(
      new Date("2025-01-01").getTime(),
    );
  });

  it("should not modify future payments", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const futureDate = new Date();

    futureDate.setMonth(futureDate.getMonth() + 1);

    const payment = new RecurringPayment(
      "1",
      "Spotify",
      14.99,
      Frequency.MONTHLY,
      futureDate,
    );

    await repository.save(payment);

    const useCase = new ProcessRecurringPaymentsUseCase(repository);

    await useCase.execute();

    const payments = await repository.getAll();

    expect(payments[0].nextDueDate.getTime()).toBe(futureDate.getTime());
  });
});
