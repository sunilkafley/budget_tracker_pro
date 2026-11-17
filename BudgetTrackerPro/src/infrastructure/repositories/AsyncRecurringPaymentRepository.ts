import AsyncStorage from "@react-native-async-storage/async-storage";

import { RecurringPayment } from "../../domain/models/RecurringPayment";
import { IRecurringPaymentRepository } from "../../domain/repositories/IRecurringPaymentRepository";
import { StorageKeys } from "../../storage/StorageKeys";

export class AsyncRecurringPaymentRepository implements IRecurringPaymentRepository {
  async save(payment: RecurringPayment): Promise<void> {
    const payments = await this.getAll();

    payments.push(payment);

    await AsyncStorage.setItem(
      StorageKeys.RECURRING_PAYMENTS,
      JSON.stringify(payments),
    );
  }

  async update(payment: RecurringPayment): Promise<void> {
    const payments = await this.getAll();

    const updatedPayments = payments.map((p) =>
      p.id === payment.id ? payment : p,
    );

    await AsyncStorage.setItem(
      StorageKeys.RECURRING_PAYMENTS,
      JSON.stringify(updatedPayments),
    );
  }

  async getAll(): Promise<RecurringPayment[]> {
    const data = await AsyncStorage.getItem(StorageKeys.RECURRING_PAYMENTS);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return parsed.map(
      (payment: any) =>
        new RecurringPayment(
          payment.id,
          payment.name,
          payment.amount,
          payment.category,
          payment.frequency,
          new Date(payment.nextDueDate),
        ),
    );
  }

  async getById(id: string): Promise<RecurringPayment | null> {
    const payments = await this.getAll();

    return payments.find((payment) => payment.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    const payments = await this.getAll();

    const filteredPayments = payments.filter((payment) => payment.id !== id);

    await AsyncStorage.setItem(
      StorageKeys.RECURRING_PAYMENTS,
      JSON.stringify(filteredPayments),
    );
  }
}
