import { Transaction } from "./Transaction";

export class Income extends Transaction {
  constructor(
    id: string,
    title: string,
    amount: number,
    transactionDate: Date,
    public source: string,
    notes?: string,
  ) {
    super(id, title, amount, transactionDate, notes);
  }
}
