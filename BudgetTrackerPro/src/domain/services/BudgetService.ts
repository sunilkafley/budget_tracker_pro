import { Budget } from "../models/Budget";
import { Money } from "./Money";
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
    const spentAmount = Money.sum(expenses
      .filter((expense) => expense.category.id === budget.category.id)
      .map((expense) => expense.amount));

    const remainingAmount = Money.subtract(budget.limitAmount, spentAmount);

    const percentageUsed = budget.limitAmount === 0 ? 0 :
      (Money.toMinorUnits(spentAmount) / Money.toMinorUnits(budget.limitAmount)) * 100;

    return {
      budgetAmount: budget.limitAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      isOverBudget: spentAmount > budget.limitAmount,
    };
  }
}
