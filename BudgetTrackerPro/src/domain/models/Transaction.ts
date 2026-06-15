export abstract class Transaction {
  constructor(
    public readonly id: string,
    public title: string,
    public amount: number,
    public transactionDate: Date,
    public notes?: string,
  ) {}

  public isValid(): boolean {
    return this.amount > 0;
  }
}
