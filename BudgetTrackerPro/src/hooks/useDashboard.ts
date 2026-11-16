import { useCallback, useRef, useState } from "react";
import { useRepositories } from "../context/RepositoryContext";
import { DashboardSummary } from "../application/dto/DashboardSummary";
import { DashboardTransaction } from "../application/useCases/GetDashboardTransactionsUseCase";
import { BudgetUsage } from "../application/dto/BudgetUsage";
import { RecurringPayment } from "../domain/models/RecurringPayment";
import { AnalyticsService } from "../domain/services/AnalyticsService";

type Section = "summary" | "transactions" | "budgets" | "payments";
const message = (reason: unknown) => reason instanceof Error ? reason.message : "Unable to load data. Please try again.";

export function useDashboard() {
  const { getDashboardSummaryUseCase, getDashboardTransactionsUseCase, getAllBudgetsUseCase,
    getAllExpensesUseCase, getUpcomingPaymentsUseCase } = useRepositories();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetUsage[]>([]);
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Section, string>>>({});
  const [loading, setLoading] = useState(true);
  const request = useRef(0);

  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setErrors({});
    const loadBudgets = async () => {
      const [allBudgets, expenses] = await Promise.all([getAllBudgetsUseCase.execute(), getAllExpensesUseCase.execute()]);
      return AnalyticsService.calculateBudgetUsage(allBudgets, expenses);
    };
    // Independent sections remain usable when another section cannot be read.
    const [summaryResult, transactionResult, budgetResult, paymentResult] = await Promise.allSettled([
      getDashboardSummaryUseCase.execute(), getDashboardTransactionsUseCase.execute(), loadBudgets(), getUpcomingPaymentsUseCase.execute(),
    ] as const);
    if (current !== request.current) return;
    const failures: Partial<Record<Section, string>> = {};
    if (summaryResult.status === "fulfilled") setSummary(summaryResult.value); else failures.summary = message(summaryResult.reason);
    if (transactionResult.status === "fulfilled") setTransactions(transactionResult.value); else failures.transactions = message(transactionResult.reason);
    if (budgetResult.status === "fulfilled") setBudgets(budgetResult.value); else failures.budgets = message(budgetResult.reason);
    if (paymentResult.status === "fulfilled") setPayments(paymentResult.value.slice(0, 3)); else failures.payments = message(paymentResult.reason);
    setErrors(failures);
    setLoading(false);
  }, [getDashboardSummaryUseCase, getDashboardTransactionsUseCase, getAllBudgetsUseCase, getAllExpensesUseCase, getUpcomingPaymentsUseCase]);

  const cancel = useCallback(() => { request.current++; }, []);
  return { summary, transactions, budgets, payments, errors, loading, load, cancel };
}
