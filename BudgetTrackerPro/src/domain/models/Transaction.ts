import { Money } from "../services/Money";

export abstract class Transaction {
  constructor(
    public readonly id: string,
    public title: string,
    public amount: number,
    public transactionDate: Date,
    public notes?: string,
  ) {}
  public isValid(): boolean {
    try {
      Money.validatePositive(this.amount, "Transaction");
      return true;
    } catch {
      return false;
    }
  }
}
