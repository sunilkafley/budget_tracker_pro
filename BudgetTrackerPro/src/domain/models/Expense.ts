import { Transaction } from "./Transaction";
import { Category } from "./Category";

export class Expense extends Transaction {
  constructor(
    id: string,
    title: string,
    amount: number,
    transactionDate: Date,
    public category: Category,
    notes?: string,
  ) {
    super(id, title, amount, transactionDate, notes);
  }
}
