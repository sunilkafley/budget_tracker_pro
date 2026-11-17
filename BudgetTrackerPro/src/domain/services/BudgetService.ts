import { Budget } from "../models/Budget";
import { Money } from "./Money";
import { Expense } from "../models/Expense";
import { Category } from "../models/Category";
import { CategoryType } from "../enums/CategoryType";
import { Frequency } from "../enums/Frequency";
import { FinancialValidation } from "./FinancialValidation";

export interface BudgetUsage {
  budgetId: string;
  category: Category;
  frequency: Frequency;
  periodStart: Date;
  /** Exclusive local calendar boundary. */
  periodEnd: Date;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export class BudgetService {
  static getPeriod(frequency: Frequency, referenceDate: Date): { periodStart: Date; periodEnd: Date } {
    FinancialValidation.date(referenceDate);
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    switch (frequency) {
      case Frequency.WEEKLY: {
        const daysSinceMonday = (referenceDate.getDay() + 6) % 7;
        const day = referenceDate.getDate() - daysSinceMonday;
        return { periodStart: new Date(year, month, day), periodEnd: new Date(year, month, day + 7) };
      }
      case Frequency.MONTHLY:
        return { periodStart: new Date(year, month, 1), periodEnd: new Date(year, month + 1, 1) };
      case Frequency.YEARLY:
        return { periodStart: new Date(year, 0, 1), periodEnd: new Date(year + 1, 0, 1) };
      default:
        throw new Error("A valid budget frequency is required");
    }
  }

  static getBudgetUsage(budget: Budget, expenses: Expense[], referenceDate = new Date()): BudgetUsage {
    const period = BudgetService.getPeriod(budget.frequency, referenceDate);
    const limitMinorUnits = Money.toMinorUnits(budget.limitAmount);
    if (limitMinorUnits < 0) throw new Error("Budget limit cannot be negative");
    if (!Object.values(CategoryType).includes(budget.category?.type) || budget.category.type === CategoryType.INCOME) {
      throw new Error("A valid expense category is required");
    }
    const spentAmount = Money.sum(expenses
      .filter((expense) => {
        if (expense.category?.type !== budget.category.type) return false;
        FinancialValidation.date(expense.transactionDate);
        const inPeriod = expense.transactionDate >= period.periodStart && expense.transactionDate < period.periodEnd;
        if (inPeriod) FinancialValidation.expense(expense);
        return inPeriod;
      })
      .map((expense) => expense.amount));

    const remainingAmount = Money.subtract(budget.limitAmount, spentAmount);

    const percentageUsed = budget.limitAmount === 0 ? 0 :
      (Money.toMinorUnits(spentAmount) / limitMinorUnits) * 100;

    return {
      budgetId: budget.id,
      category: budget.category,
      frequency: budget.frequency,
      ...period,
      budgetAmount: budget.limitAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      isOverBudget: spentAmount > budget.limitAmount,
    };
  }
}
