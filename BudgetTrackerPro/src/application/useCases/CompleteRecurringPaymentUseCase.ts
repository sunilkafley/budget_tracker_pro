import { Expense } from "../../domain/models/Expense";
import { FinancialValidation } from "../../domain/services/FinancialValidation";
import { Category } from "../../domain/models/Category";

import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

import { frequencyAdvancers } from "../../utils/recurringPaymentUtils";

export class CompleteRecurringPaymentUseCase {
  constructor(
    private readonly recurringPaymentRepository: IRecurringPaymentRepository,
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(paymentId: string): Promise<void> {
    const payment = await this.recurringPaymentRepository.getById(paymentId);

    if (!payment) {
      throw new Error("Recurring payment not found");
    }

    FinancialValidation.recurringPayment(payment);
    const nextDueDate = frequencyAdvancers[payment.frequency](payment.nextDueDate);
    FinancialValidation.date(nextDueDate);

    const expense = new Expense(
      Date.now().toString(),
      payment.name,
      payment.amount,
      new Date(),
      new Category(payment.category, payment.category, payment.category),
    );

    await this.expenseRepository.save(expense);

    payment.nextDueDate = nextDueDate;

    await this.recurringPaymentRepository.update(payment);
  }
}
