import { RecurringPayment } from "../models/RecurringPayment";

export interface IRecurringPaymentRepository {
  save(payment: RecurringPayment): Promise<void>;

  update(payment: RecurringPayment): Promise<void>;

  getAll(): Promise<RecurringPayment[]>;

  getById(id: string): Promise<RecurringPayment | null>;

  delete(id: string): Promise<void>;
}
