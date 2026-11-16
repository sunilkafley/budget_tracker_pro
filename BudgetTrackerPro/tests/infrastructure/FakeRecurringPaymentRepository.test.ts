import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("FakeRecurringPaymentRepository", () => {
  let repository: FakeRecurringPaymentRepository;

  beforeEach(() => {
    repository = new FakeRecurringPaymentRepository();
  });

  it("should save a recurring payment", async () => {
    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.save(payment);

    const payments = await repository.getAll();

    expect(payments).toHaveLength(1);
  });

  it("should update a recurring payment", async () => {
    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.save(payment);

    const updated = new RecurringPayment(
      "1",
      "Netflix Premium",
      25,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.update(updated);

    const result = await repository.getById("1");

    expect(result?.name).toBe("Netflix Premium");
  });

  it("should delete a recurring payment", async () => {
    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.save(payment);

    await repository.delete("1");

    const payments = await repository.getAll();

    expect(payments).toHaveLength(0);
  });

  it("should get payment by id", async () => {
    const payment = new RecurringPayment(
      "1",
      "Netflix",
      19.99,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date(),
    );

    await repository.save(payment);

    const result = await repository.getById("1");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("1");
  });
});
