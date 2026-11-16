import { Income } from "../models/Income";
import { Expense } from "../models/Expense";
import { Budget } from "../models/Budget";
import { RecurringPayment } from "../models/RecurringPayment";
import { CategoryType } from "../enums/CategoryType";
import { Frequency } from "../enums/Frequency";
import { Money } from "./Money";

export class FinancialValidation {
  static date(date: Date): void {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      throw new Error("A valid date is required");
    }
  }

  private static expenseCategory(category: CategoryType): void {
    if (!Object.values(CategoryType).includes(category) || category === CategoryType.INCOME) {
      throw new Error("A valid expense category is required");
    }
  }

  private static frequency(frequency: Frequency): void {
    if (!Object.values(Frequency).includes(frequency)) {
      throw new Error("A valid frequency is required");
    }
  }

  static income(income: Income): void {
    Money.validatePositive(income.amount, "Income");
    FinancialValidation.date(income.transactionDate);
  }

  static expense(expense: Expense): void {
    Money.validatePositive(expense.amount, "Expense");
    FinancialValidation.date(expense.transactionDate);
    FinancialValidation.expenseCategory(expense.category?.type);
  }

  static budget(budget: Budget): void {
    Money.validatePositive(budget.limitAmount, "Budget");
    FinancialValidation.expenseCategory(budget.category?.type);
    FinancialValidation.frequency(budget.frequency);
  }

  static recurringPayment(payment: RecurringPayment): void {
    Money.validatePositive(payment.amount, "Recurring payment");
    FinancialValidation.date(payment.nextDueDate);
    FinancialValidation.expenseCategory(payment.category);
    FinancialValidation.frequency(payment.frequency);
    if (typeof payment.name !== "string" || !payment.name.trim()) {
      throw new Error("A recurring payment name is required");
    }
  }
}
