import { Income } from "../models/Income";
import { Money } from "./Money";
import { Expense } from "../models/Expense";

export class ReportService {
  static calculateTotalIncome(incomes: Income[]): number {
    return Money.sum(incomes.map((income) => income.amount));
  }

  static calculateTotalExpenses(expenses: Expense[]): number {
    return Money.sum(expenses.map((expense) => expense.amount));
  }

  static calculateSavings(incomes: Income[], expenses: Expense[]): number {
    return Money.subtract(
      this.calculateTotalIncome(incomes),
      this.calculateTotalExpenses(expenses),
    );
  }

  private static filterByMonth<T extends { transactionDate: Date }>(
    items: T[],
    month: number,
    year: number,
  ): T[] {
    return items.filter(
      (item) =>
        item.transactionDate.getMonth() === month &&
        item.transactionDate.getFullYear() === year,
    );
  }

  static calculateMonthlyExpenses(
    expenses: Expense[],
    month: number,
    year: number,
  ): number {
    const filtered = this.filterByMonth(expenses, month, year);

    return this.calculateTotalExpenses(filtered);
  }
}
