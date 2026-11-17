import { IIncomeRepository } from "../../domain/repositories/IIncomeRepository";
import { IExpenseRepository } from "../../domain/repositories/IExpenseRepository";
import { Income } from "../../domain/models/Income";
import { Expense } from "../../domain/models/Expense";

export type DashboardTransaction = { kind: "income"; transaction: Income } | { kind: "expense"; transaction: Expense };

export class GetDashboardTransactionsUseCase {
  constructor(private readonly incomeRepository: IIncomeRepository, private readonly expenseRepository: IExpenseRepository) {}

  async execute(): Promise<DashboardTransaction[]> {
    const [incomes, expenses] = await Promise.all([this.incomeRepository.getAll(), this.expenseRepository.getAll()]);
    const transactions: DashboardTransaction[] = [
      ...incomes.map((transaction) => ({ kind: "income" as const, transaction })),
      ...expenses.map((transaction) => ({ kind: "expense" as const, transaction })),
    ];
    return transactions.sort((first, second) => second.transaction.transactionDate.getTime() - first.transaction.transactionDate.getTime());
  }
}
