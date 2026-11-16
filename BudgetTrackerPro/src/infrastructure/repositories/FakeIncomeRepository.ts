import { Income } from "../../domain/models/Income";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";

export class FakeIncomeRepository implements IIncomeRepository {
  private incomes: Income[] = [];

  async save(income: Income): Promise<void> {
    this.incomes.push(income);
  }

  async update(updatedIncome: Income): Promise<void> {
    const index = this.incomes.findIndex(
      (income) => income.id === updatedIncome.id,
    );

    if (index !== -1) {
      this.incomes[index] = updatedIncome;
    }
  }

  async getAll(): Promise<Income[]> {
    return [...this.incomes];
  }

  async getById(id: string): Promise<Income | null> {
    return this.incomes.find((income) => income.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.incomes = this.incomes.filter((income) => income.id !== id);
  }
}
