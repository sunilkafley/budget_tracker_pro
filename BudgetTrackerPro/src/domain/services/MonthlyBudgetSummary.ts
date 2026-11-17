import { BudgetUsage } from "./BudgetService";
import { Frequency } from "../enums/Frequency";
import { Money } from "./Money";
export function summarizeMonthlyBudgets(budgets: readonly BudgetUsage[]) {
  const categories = new Map<string, BudgetUsage>();
  for (const budget of budgets.filter(
    (item) => item.frequency === Frequency.MONTHLY,
  )) {
    const previous = categories.get(budget.category.type);
    // Multiple caps for one category are simultaneous limits; use the strictest.
    if (!previous || budget.budgetAmount < previous.budgetAmount)
      categories.set(budget.category.type, budget);
  }
  const items = [...categories.values()];
  const limit = Money.sum(items.map((item) => item.budgetAmount));
  const spent = Money.sum(items.map((item) => item.spentAmount));
  return {
    limit,
    spent,
    remaining: Money.subtract(limit, spent),
    count: items.length,
    percentage: limit > 0 ? (Money.toMinorUnits(spent) / Money.toMinorUnits(limit)) * 100 : 0,
  };
}
