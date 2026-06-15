import { Frequency } from "../enums/Frequency";

export class RecurringPayment {
  constructor(
    public readonly id: string,
    public name: string,
    public amount: number,
    public frequency: Frequency,
    public nextDueDate: Date,
  ) {}
}
