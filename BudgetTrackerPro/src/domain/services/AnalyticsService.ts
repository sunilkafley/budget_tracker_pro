import { Expense } from "../models/Expense";
import { Budget } from "../models/Budget";
import { RecurringPayment } from "../models/RecurringPayment";

import { BudgetUsage } from "../../application/dto/BudgetUsage";

export class AnalyticsService {
  static getTopExpenseCategory(expenses: Expense[]): string {
    const totals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const category = expense.category.name;

      totals[category] = (totals[category] || 0) + expense.amount;
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
  ): BudgetUsage[] {
    return budgets.map((budget) => {
      const spentAmount = expenses
        .filter((expense) => expense.category.type === budget.category.type)
        .reduce((total, expense) => total + expense.amount, 0);

      const remainingAmount = budget.limitAmount - spentAmount;

      const percentageUsed =
        budget.limitAmount === 0
          ? 0
          : Math.round((spentAmount / budget.limitAmount) * 100);

      return {
        category: budget.category,
        budgetAmount: budget.limitAmount,
        spentAmount,
        remainingAmount,
        percentageUsed,
      };
    });
  }

  static isOverBudget(spentAmount: number, budgetAmount: number): boolean {
    return spentAmount > budgetAmount;
  }
}
