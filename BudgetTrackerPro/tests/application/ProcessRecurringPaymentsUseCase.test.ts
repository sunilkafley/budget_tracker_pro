import { ProcessRecurringPaymentsUseCase } from "../../src/application/useCases/ProcessRecurringPaymentsUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("ProcessRecurringPaymentsUseCase", () => {
  it("preserves an unpaid overdue monthly payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date("2025-01-01"),
    );

    await repository.save(payment);

    const useCase = new ProcessRecurringPaymentsUseCase(repository);

    await useCase.execute();

    const payments = await repository.getAll();

    expect(payments[0].nextDueDate.getTime()).toBe(new Date("2025-01-01").getTime());
  });

  it("preserves an unpaid overdue weekly payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const payment = new RecurringPayment(
      "1",
      "Gym Membership",
      15,
      CategoryType.FITNESS,
      Frequency.WEEKLY,
      new Date("2025-01-01"),
    );

    await repository.save(payment);

    const useCase = new ProcessRecurringPaymentsUseCase(repository);

    await useCase.execute();

    const payments = await repository.getAll();

    expect(payments[0].nextDueDate.getTime()).toBe(
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
      CategoryType.ENTERTAINMENT,
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
