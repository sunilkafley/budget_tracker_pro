import { Income } from "../models/Income";

export interface IIncomeRepository {
  save(income: Income): Promise<void>;

  update(income: Income): Promise<void>;

  getAll(): Promise<Income[]>;

  getById(id: string): Promise<Income | null>;

  delete(id: string): Promise<void>;
}
