import { getRecurringPaymentStatus } from "../../src/utils/recurringPaymentStatusUtils";

describe("getRecurringPaymentStatus", () => {
  it("should return overdue status", () => {
    const result = getRecurringPaymentStatus(-5);

    expect(result.status).toBe("OVERDUE");
    expect(result.label).toBe("Overdue by 5 days");
    expect(result.indicator).toBe("🔴");
  });

  it("should return due today status", () => {
    const result = getRecurringPaymentStatus(0);

    expect(result.status).toBe("DUE_TODAY");
    expect(result.label).toBe("Due today");
    expect(result.indicator).toBe("🟡");
  });

  it("should return upcoming status", () => {
    const result = getRecurringPaymentStatus(7);

    expect(result.status).toBe("UPCOMING");
    expect(result.label).toBe("Due in 7 days");
    expect(result.indicator).toBe("🟢");
  });

  it("should handle singular overdue day", () => {
    const result = getRecurringPaymentStatus(-1);

    expect(result.label).toBe("Overdue by 1 day");
  });

  it("should handle singular upcoming day", () => {
    const result = getRecurringPaymentStatus(1);

    expect(result.label).toBe("Due in 1 day");
  });
});
