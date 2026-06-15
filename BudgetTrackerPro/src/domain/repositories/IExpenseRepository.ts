import { Expense } from "../models/Expense";

export interface IExpenseRepository {
  save(expense: Expense): Promise<void>;

  update(expense: Expense): Promise<void>;

  getAll(): Promise<Expense[]>;

  getById(id: string): Promise<Expense | null>;

  delete(id: string): Promise<void>;
}
