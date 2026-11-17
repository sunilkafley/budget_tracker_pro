// Persisted amounts remain in major units. Convert decimal text, rather than
// multiplying a binary float by 100, so values such as 0.29 retain every cent.
export class Money {
  static readonly MAX_AMOUNT = 1_000_000_000_000;
  private static readonly MAX_MINOR_UNITS = Money.MAX_AMOUNT * 100;

  static parseInput(input: string): number {
    const decimal = input.trim();
    if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(decimal)) {
      throw new Error("Enter a positive amount with at most two decimal places");
    }
    const amount = Number(decimal);
    Money.validatePositive(amount, "Payment");
    return amount;
  }

  static toMinorUnits(amount: number): number {
    if (
      !Number.isFinite(amount) || Math.abs(amount) > Money.MAX_AMOUNT ||
      !/^-?\d+(?:\.\d{1,2})?$/.test(String(amount))
    ) {
      throw new Error("Amount must be finite, within 1 trillion, and have at most two decimal places");
    }
    const [whole, fraction = ""] = Math.abs(amount).toString().split(".");
    const minorUnits = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return amount < 0 ? -minorUnits : minorUnits;
  }

  static fromMinorUnits(minorUnits: number): number {
    if (!Number.isSafeInteger(minorUnits) || Math.abs(minorUnits) > Money.MAX_MINOR_UNITS) {
      throw new Error("Financial result exceeds the supported amount range");
    }
    return minorUnits / 100;
  }

  static sum(amounts: readonly number[]): number {
    let totalMinorUnits = 0;
    for (const amount of amounts) {
      totalMinorUnits += Money.toMinorUnits(amount);
      Money.fromMinorUnits(totalMinorUnits);
    }
    return Money.fromMinorUnits(totalMinorUnits);
  }

  static subtract(amount: number, deduction: number): number {
    return Money.fromMinorUnits(Money.toMinorUnits(amount) - Money.toMinorUnits(deduction));
  }

  static validatePositive(amount: number, label: string): void {
    if (amount <= 0) throw new Error(`${label} amount must be greater than zero`);
    Money.toMinorUnits(amount);
  }
}
