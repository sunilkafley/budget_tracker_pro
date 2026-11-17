import { GetUpcomingPaymentsUseCase } from "../../src/application/useCases/GetUpcomingPaymentsUseCase";

import { FakeRecurringPaymentRepository } from "../../src/infrastructure/repositories/FakeRecurringPaymentRepository";

import { RecurringPayment } from "../../src/domain/models/RecurringPayment";

import { Frequency } from "../../src/domain/enums/Frequency";
import { CategoryType } from "../../src/domain/enums/CategoryType";

describe("GetUpcomingPaymentsUseCase", () => {
  it("should return payments sorted by due date", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const payment1 = new RecurringPayment(
      "1",
      "Spotify",
      15,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date("2026-07-10"),
    );

    const payment2 = new RecurringPayment(
      "2",
      "Netflix",
      20,
      CategoryType.ENTERTAINMENT,
      Frequency.MONTHLY,
      new Date("2026-07-01"),
    );

    const payment3 = new RecurringPayment(
      "3",
      "Rent",
      500,
      CategoryType.HOUSING,
      Frequency.MONTHLY,
      new Date("2026-07-05"),
    );

    await repository.save(payment1);
    await repository.save(payment2);
    await repository.save(payment3);

    const useCase = new GetUpcomingPaymentsUseCase(repository);

    const result = await useCase.execute();

    expect(result[0].name).toBe("Netflix");
    expect(result[1].name).toBe("Rent");
    expect(result[2].name).toBe("Spotify");
  });

  it("should return empty array when no payments exist", async () => {
    const repository = new FakeRecurringPaymentRepository();

    const useCase = new GetUpcomingPaymentsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
