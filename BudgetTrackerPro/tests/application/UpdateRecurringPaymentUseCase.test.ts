import { UpdateRecurringPaymentUseCase } from "../../src/application/useCases/UpdateRecurringPaymentUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("UpdateRecurringPaymentUseCase", () => {
  it("should update payment", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const original = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.save(original);

    const useCase = new UpdateRecurringPaymentUseCase(repository);

    const updated = new RecurringPayment(
      "1",
      "Netflix Premium",
      25,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await useCase.execute(updated);

    const result = await repository.getById("1");

    expect(result?.name).toBe("Netflix Premium");
  });
});
