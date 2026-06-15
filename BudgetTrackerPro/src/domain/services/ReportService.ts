import { Income } from "../models/Income";
import { Expense } from "../models/Expense";

export class ReportService {
  static calculateTotalIncome(incomes: Income[]): number {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  }

  static calculateTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  static calculateSavings(incomes: Income[], expenses: Expense[]): number {
    return (
      this.calculateTotalIncome(incomes) - this.calculateTotalExpenses(expenses)
    );
  }

  private static filterByMonth<T extends { date: Date }>(
    items: T[],
    month: number,
    year: number,
  ): T[] {
    return items.filter(
      (item) =>
        item.date.getMonth() === month && item.date.getFullYear() === year,
    );
  }

  static calculateMonthlyExpenses(
    expenses: Expense[],
    month: number,
    year: number,
  ): number {
    const filtered = this.filterByMonth(expenses, month, year);

    return filtered.reduce((sum, expense) => sum + expense.amount, 0);
  }
}
