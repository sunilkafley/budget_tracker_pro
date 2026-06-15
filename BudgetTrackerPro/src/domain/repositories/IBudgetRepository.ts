import { Budget } from "../models/Budget";

export interface IBudgetRepository {
  save(budget: Budget): Promise<void>;

  update(budget: Budget): Promise<void>;

  getAll(): Promise<Budget[]>;

  getById(id: string): Promise<Budget | null>;

  delete(id: string): Promise<void>;
}
