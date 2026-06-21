import { Category } from "../../domain/models/Category";

export interface BudgetUsage {
  category: Category;

  budgetAmount: number;

  spentAmount: number;

  remainingAmount: number;

  percentageUsed: number;
}
