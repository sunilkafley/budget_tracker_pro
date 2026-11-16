import { CreateRecurringPaymentUseCase } from "../../src/application/useCases/CreateRecurringPaymentUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("CreateRecurringPaymentUseCase", () => {
  it("should create recurring payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const useCase = new CreateRecurringPaymentUseCase(repository);

    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await useCase.execute(payment);

    const payments = await repository.getAll();

    expect(payments).toHaveLength(1);
  });
});
