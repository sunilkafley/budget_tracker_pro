import { DeleteRecurringPaymentUseCase } from "../../src/application/useCases/DeleteRecurringPaymentUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";

describe("DeleteRecurringPaymentUseCase", () => {
  it("should delete payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.save(payment);

    const useCase = new DeleteRecurringPaymentUseCase(repository);

    await useCase.execute("1");

    const payments = await repository.getAll();

    expect(payments).toHaveLength(0);
  });
});
