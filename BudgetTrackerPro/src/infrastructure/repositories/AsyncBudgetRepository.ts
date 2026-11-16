import AsyncStorage from "@react-native-async-storage/async-storage";

import { Budget } from "../../domain/models/Budget";
import { Category } from "../../domain/models/Category";
import { IBudgetRepository } from "../../domain/repositories/IBudgetRepository";
import { StorageKeys } from "../../storage/StorageKeys";

export class AsyncBudgetRepository implements IBudgetRepository {
  async save(budget: Budget): Promise<void> {
    const budgets = await this.getAll();

    budgets.push(budget);

    await AsyncStorage.setItem(StorageKeys.BUDGETS, JSON.stringify(budgets));
  }

  async getAll(): Promise<Budget[]> {
    const data = await AsyncStorage.getItem(StorageKeys.BUDGETS);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return parsed.map(
      (budget: any) =>
        new Budget(
          budget.id,
          new Category(
            budget.category.id,
            budget.category.name,
            budget.category.type,
          ),
          budget.limitAmount,
          budget.frequency,
        ),
    );
  }

  async getById(id: string): Promise<Budget | null> {
    const budgets = await this.getAll();

    return budgets.find((budget) => budget.id === id) ?? null;
  }

  async update(updatedBudget: Budget): Promise<void> {
    const budgets = await this.getAll();

    const updated = budgets.map((budget) =>
      budget.id === updatedBudget.id ? updatedBudget : budget,
    );

    await AsyncStorage.setItem(StorageKeys.BUDGETS, JSON.stringify(updated));
  }

  async delete(id: string): Promise<void> {
    const budgets = await this.getAll();

    const filtered = budgets.filter((budget) => budget.id !== id);

    await AsyncStorage.setItem(StorageKeys.BUDGETS, JSON.stringify(filtered));
  }
}
