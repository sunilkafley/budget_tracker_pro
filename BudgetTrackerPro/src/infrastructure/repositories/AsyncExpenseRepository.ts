import { serializedOperation } from "../../application/SerializedOperation";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Expense } from "../../domain/models/Expense";
import { Category } from "../../domain/models/Category";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { StorageKeys } from "../../storage/StorageKeys";

export class AsyncExpenseRepository implements IExpenseRepository {
  async save(expense: Expense): Promise<void> {
    return serializedOperation("storage:EXPENSES", async () => {
      const expenses = await this.getAll();

      expenses.push(expense);

      await AsyncStorage.setItem(StorageKeys.EXPENSES, JSON.stringify(expenses));
    });
  }

  async getAll(): Promise<Expense[]> {
    const data = await AsyncStorage.getItem(StorageKeys.EXPENSES);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return parsed.map(
      (expense: any) =>
        new Expense(
          expense.id,
          expense.title,
          expense.amount,
          new Date(expense.transactionDate),
          new Category(
            expense.category.id,
            expense.category.name,
            expense.category.type,
          ),
          expense.notes,
        ),
    );
  }

  async getById(id: string): Promise<Expense | null> {
    const expenses = await this.getAll();

    return expenses.find((expense) => expense.id === id) ?? null;
  }

  async update(updatedExpense: Expense): Promise<void> {
    return serializedOperation("storage:EXPENSES", async () => {
      const expenses = await this.getAll();

      const updated = expenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense,
      );

      await AsyncStorage.setItem(StorageKeys.EXPENSES, JSON.stringify(updated));
    });
  }

  async delete(id: string): Promise<void> {
    return serializedOperation("storage:EXPENSES", async () => {
      const expenses = await this.getAll();

      const filtered = expenses.filter((expense) => expense.id !== id);

      await AsyncStorage.setItem(StorageKeys.EXPENSES, JSON.stringify(filtered));
    });
  }
}
