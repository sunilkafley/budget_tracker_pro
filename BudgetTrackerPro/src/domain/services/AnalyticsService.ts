import { Expense } from "../models/Expense";
import { Money } from "./Money";
import { Budget } from "../models/Budget";
import { RecurringPayment } from "../models/RecurringPayment";

import { BudgetService, BudgetUsage } from "./BudgetService";

export class AnalyticsService {
  static getTopExpenseCategory(expenses: Expense[]): string {
    const totals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const category = expense.category.name;

      totals[category] = Money.sum([totals[category] ?? 0, expense.amount]);
    });

    return (
      Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No Data"
    );
  }

  static getUpcomingPayments(
    payments: RecurringPayment[],
    daysAhead: number = 7,
  ): RecurringPayment[] {
    const today = new Date();

    const futureDate = new Date();

    futureDate.setDate(today.getDate() + daysAhead);

    return payments.filter((payment) => {
      const dueDate = payment.nextDueDate.getTime();

      return dueDate >= today.getTime() && dueDate <= futureDate.getTime();
    });
  }

  static calculateBudgetUsage(
    budgets: Budget[],
    expenses: Expense[],
    referenceDate = new Date(),
  ): BudgetUsage[] {
    return budgets.map((budget) => {
      const usage = BudgetService.getBudgetUsage(budget, expenses, referenceDate);
      return { ...usage, percentageUsed: Math.round(usage.percentageUsed) };
    });
  }

  static isOverBudget(spentAmount: number, budgetAmount: number): boolean {
    return spentAmount > budgetAmount;
  }
  static calculateSavingsRate(income: number, expenses: number): number {
    const incomeMinorUnits = Money.toMinorUnits(income);
    const expensesMinorUnits = Money.toMinorUnits(expenses);
    if (income === 0) {
      return 0;
    }

    return ((incomeMinorUnits - expensesMinorUnits) / incomeMinorUnits) * 100;
  }
  static getCategoryBreakdown(expenses: Expense[]): {
    category: string;
    amount: number;
  }[] {
    const totals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const categoryName = expense.category.name;

      totals[categoryName] = Money.sum([totals[categoryName] ?? 0, expense.amount]);
    });

    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
    }));
  }
}
