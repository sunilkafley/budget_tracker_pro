import { RecurringPayment } from "../domain/models/RecurringPayment";
import { Frequency } from "../domain/enums/Frequency";

export function createRecurringPayment(
  name: string,
  amount: number,
  frequency: Frequency,
  nextDueDate: Date,
): RecurringPayment {
  return new RecurringPayment(
    Date.now().toString(),
    name,
    amount,
    frequency,
    nextDueDate,
  );
}
