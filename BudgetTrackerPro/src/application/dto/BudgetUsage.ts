import { Category } from "../../domain/models/Category";

export interface BudgetUsage {
  budgetId: string;

  category: Category;

  budgetAmount: number;

  spentAmount: number;

  remainingAmount: number;

  percentageUsed: number;
}
