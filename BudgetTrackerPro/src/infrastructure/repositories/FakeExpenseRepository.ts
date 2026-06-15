import { Expense } from "../../domain/models/Expense";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";

export class FakeExpenseRepository implements IExpenseRepository {
  private expenses: Expense[] = [];

  async save(expense: Expense): Promise<void> {
    this.expenses.push(expense);
  }

  async update(expense: Expense): Promise<void> {
    const index = this.expenses.findIndex((e) => e.id === expense.id);

    if (index >= 0) {
      this.expenses[index] = expense;
    }
  }

  async getAll(): Promise<Expense[]> {
    return this.expenses;
  }

  async getById(id: string): Promise<Expense | null> {
    return this.expenses.find((e) => e.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }
}
