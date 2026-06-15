import { CategoryType } from "../enums/CategoryType";

export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public type: CategoryType,
  ) {}
}
