import { Frequency } from "../enums/Frequency";
import { CategoryType } from "../enums/CategoryType";

export class RecurringPayment {
  constructor(
    public readonly id: string,
    public name: string,
    public amount: number,
    public category: CategoryType,
    public frequency: Frequency,
    public nextDueDate: Date,
  ) {}
}
