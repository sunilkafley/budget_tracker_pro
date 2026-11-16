import { RecurringPayment } from "../../domain/models/RecurringPayment";
import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";

export class FakeRecurringPaymentRepository implements IRecurringPaymentRepository {
  private payments: RecurringPayment[] = [];

  async save(payment: RecurringPayment): Promise<void> {
    this.payments.push(payment);
  }

  async update(payment: RecurringPayment): Promise<void> {
    const index = this.payments.findIndex((p) => p.id === payment.id);

    if (index !== -1) {
      this.payments[index] = payment;
    }
  }

  async getAll(): Promise<RecurringPayment[]> {
    return [...this.payments];
  }

  async getById(id: string): Promise<RecurringPayment | null> {
    return this.payments.find((payment) => payment.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.payments = this.payments.filter((payment) => payment.id !== id);
  }
}
