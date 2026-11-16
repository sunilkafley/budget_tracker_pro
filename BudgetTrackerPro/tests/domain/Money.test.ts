import { Money } from "../../src/domain/services/Money";

describe("Money", () => {
  it.each(["1.005", "1.00000000000000001", "", " ", "Infinity", "NaN", "0x10", "1e2", "1,000", "-1", "0"])(
    "rejects invalid input text %s before numeric conversion", (input) => {
      expect(() => Money.parseInput(input)).toThrow();
    },
  );

  it.each([["0.29", 0.29], [" 1.15 ", 1.15], [".5", 0.5], ["10.", 10], ["01.20", 1.2]])(
    "parses valid decimal input %s", (input, amount) => {
      expect(Money.parseInput(String(input))).toBe(amount);
    },
  );

  it.each([0, 0.01, 0.29, 1.15, 1234.56, -0.29, 1_000_000_000_000])(
    "round trips supported major-unit amount %s without rounding",
    (amount) => expect(Money.fromMinorUnits(Money.toMinorUnits(amount))).toBe(amount),
  );

  it.each([NaN, Infinity, -Infinity, 0.001, 1.005, 1e-7, 1_000_000_000_000.01])(
    "rejects unsupported amount %s",
    (amount) => expect(() => Money.toMinorUnits(amount)).toThrow(),
  );

  it("adds decimal amounts and subtracts using integer cents", () => {
    expect(Money.sum([0.1, 0.2])).toBe(0.3);
    expect(Money.subtract(0.3, 0.2)).toBe(0.1);
    expect(Money.subtract(0.1, 0.3)).toBe(-0.2);
    expect(Money.sum([])).toBe(0);
  });

  it("rejects totals and differences outside the supported range", () => {
    expect(() => Money.sum([1_000_000_000_000, 0.01])).toThrow();
    expect(() => Money.subtract(1_000_000_000_000, -0.01)).toThrow();
    expect(() => Money.fromMinorUnits(1.5)).toThrow();
  });
});
