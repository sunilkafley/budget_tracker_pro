import { Expense } from "../models/Expense";
import { RecurringPayment } from "../models/RecurringPayment";

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
}
