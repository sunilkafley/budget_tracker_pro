import { GetAllRecurringPaymentsUseCase } from "../../src/application/useCases/GetAllRecurringPaymentsUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";

describe("GetAllRecurringPaymentsUseCase", () => {
  it("should return all recurring payments", async () => {
    const repository = new FakeRecurringPaymentRepository();

    await repository.save(
      new RecurringPayment(
        "1",
        "Netflix",
        19.99,
        Frequency.MONTHLY,
        new Date(),
      ),
    );

    const useCase = new GetAllRecurringPaymentsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
  });
});
