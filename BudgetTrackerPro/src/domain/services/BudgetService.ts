import { Budget } from "../models/Budget";
import { Expense } from "../models/Expense";

export interface BudgetUsage {
  budgetId: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export class BudgetService {
  static getBudgetUsage(budget: Budget, expenses: Expense[]) {
    const spentAmount = expenses
      .filter((expense) => expense.category.id === budget.category.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const remainingAmount = budget.limitAmount - spentAmount;

    const percentageUsed = (spentAmount / budget.limitAmount) * 100;

    return {
      budgetAmount: budget.limitAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      isOverBudget: spentAmount > budget.limitAmount,
    };
  }
}
