import { RecurringPayment } from "../domain/models/RecurringPayment";
import { Frequency } from "../domain/enums/Frequency";
import { CategoryType } from "../domain/enums/CategoryType";

export function createRecurringPayment(
  name: string,
  amount: number,
  category: CategoryType,
  frequency: Frequency,
  nextDueDate: Date,
): RecurringPayment {
  return new RecurringPayment(
    Date.now().toString(),
    name,
    amount,
    category,
    frequency,
    nextDueDate,
  );
}
