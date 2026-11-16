import { Budget } from "../../domain/models/Budget";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";

export class FakeBudgetRepository implements IBudgetRepository {
  private budgets: Budget[] = [];

  async save(budget: Budget): Promise<void> {
    this.budgets.push(budget);
  }

  async update(updatedBudget: Budget): Promise<void> {
    const index = this.budgets.findIndex(
      (budget) => budget.id === updatedBudget.id,
    );

    if (index !== -1) {
      this.budgets[index] = updatedBudget;
    }
  }

  async getAll(): Promise<Budget[]> {
    return [...this.budgets];
  }

  async getById(id: string): Promise<Budget | null> {
    return this.budgets.find((budget) => budget.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.budgets = this.budgets.filter((budget) => budget.id !== id);
  }
}
