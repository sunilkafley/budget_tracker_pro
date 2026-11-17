import AsyncStorage from "@react-native-async-storage/async-storage";

import { Income } from "../../domain/models/Income";
import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { StorageKeys } from "../../storage/StorageKeys";

export class AsyncIncomeRepository implements IIncomeRepository {
  async save(income: Income): Promise<void> {
    const incomes = await this.getAll();

    incomes.push(income);

    await AsyncStorage.setItem(StorageKeys.INCOMES, JSON.stringify(incomes));
  }

  async getAll(): Promise<Income[]> {
    const data = await AsyncStorage.getItem(StorageKeys.INCOMES);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return parsed.map(
      (income: any) =>
        new Income(
          income.id,
          income.title,
          income.amount,
          new Date(income.transactionDate),
          income.source,
          income.notes,
        ),
    );
  }

  async getById(id: string): Promise<Income | null> {
    const incomes = await this.getAll();

    return incomes.find((i) => i.id === id) ?? null;
  }

  async update(updatedIncome: Income): Promise<void> {
    const incomes = await this.getAll();

    const updated = incomes.map((income) =>
      income.id === updatedIncome.id ? updatedIncome : income,
    );

    await AsyncStorage.setItem(StorageKeys.INCOMES, JSON.stringify(updated));
  }

  async delete(id: string): Promise<void> {
    const incomes = await this.getAll();

    const filtered = incomes.filter((income) => income.id !== id);

    await AsyncStorage.setItem(StorageKeys.INCOMES, JSON.stringify(filtered));
  }
}
