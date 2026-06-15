import { Category } from "./Category";
import { Frequency } from "../enums/Frequency";

export class Budget {
  constructor(
    public readonly id: string,
    public category: Category,
    public limitAmount: number,
    public frequency: Frequency,
  ) {}
}
