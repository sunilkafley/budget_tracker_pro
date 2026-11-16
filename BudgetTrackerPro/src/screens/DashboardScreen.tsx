import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";

import { useRepositories } from "../context/RepositoryContext";

import { Income } from "../domain/models/Income";
import { Expense } from "../domain/models/Expense";

import { Budget } from "../domain/models/Budget";

import { GetAllBudgetsUseCase } from "../application/useCases/GetAllBudgetsUseCase";

import { AnalyticsService } from "../domain/services/AnalyticsService";

import { BudgetUsage } from "../application/dto/BudgetUsage";
import { RecurringPayment } from "../domain/models/RecurringPayment";

import { getDaysUntil } from "../utils/dateUtils";
import { getRecurringPaymentStatus } from "../utils/recurringPaymentStatusUtils";

export function DashboardScreen({ navigation }: any) {
  const {
    budgetRepository,
    getDashboardSummaryUseCase,
    getAllIncomesUseCase,
    getAllExpensesUseCase,

    deleteIncomeUseCase,
    deleteExpenseUseCase,
    getUpcomingPaymentsUseCase,
    completeRecurringPaymentUseCase,
  } = useRepositories();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    topCategory: "",
    upcomingPaymentsCount: 0,
  });

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [budgetUsage, setBudgetUsage] = useState<BudgetUsage[]>([]);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // Upcoming recurring payments
  const [upcomingPayments, setUpcomingPayments] = useState<RecurringPayment[]>(
    [],
  );

  const loadDashboard = async () => {
    setLoading(true);
    setDashboardError(null);
    try {
      const incomesResult = await getAllIncomesUseCase.execute();
      const expensesResult = await getAllExpensesUseCase.execute();
      // Keep transactions editable if an unsupported stored amount blocks totals.
      setIncomes(incomesResult);
      setExpenses(expensesResult);
      const budgetsResult = await new GetAllBudgetsUseCase(budgetRepository).execute();
      const summaryResult = await getDashboardSummaryUseCase.execute();
      const usageResult = AnalyticsService.calculateBudgetUsage(budgetsResult, expensesResult);
      setSummary(summaryResult);
      setBudgets(budgetsResult);
      setBudgetUsage(usageResult);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Unable to load dashboard.");
      setBudgetUsage([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingPayments = async () => {
    try {
      const payments = await getUpcomingPaymentsUseCase.execute();
      setUpcomingPayments(payments.slice(0, 3));
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to load payments.");
    }
  };

  const handleDeleteIncome = async (id: string) => {
    Alert.alert("Delete Income", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Delete",

        style: "destructive",

        onPress: async () => {
          await deleteIncomeUseCase.execute(id);

          await loadDashboard();
        },
      },
    ]);
  };

  const handleDeleteExpense = async (id: string) => {
    Alert.alert("Delete Expense", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Delete",

        style: "destructive",

        onPress: async () => {
          await deleteExpenseUseCase.execute(id);

          await loadDashboard();
        },
      },
    ]);
  };

  const handleCompletePayment = (payment: RecurringPayment) => {
    Alert.alert(
      "Complete Payment",
      `${payment.name}\n\nAmount: $${payment.amount.toFixed(
        2,
      )}\n\nThis will create an expense and advance the next due date.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await completeRecurringPaymentUseCase.execute(payment.id);
              await loadDashboard();
              await loadUpcomingPayments();
              Alert.alert("Success", "Payment completed successfully.");
            } catch (error) {
              Alert.alert("Error", error instanceof Error ? error.message : "Unable to complete payment.");
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
      loadUpcomingPayments();
    }, []),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Budget Tracker Pro</Text>

      {loading && <Text>Loading dashboard...</Text>}
      {dashboardError && (
        <View accessibilityLiveRegion="polite">
          <Text>Financial totals unavailable: {dashboardError}</Text>
          <Button title="Retry dashboard" onPress={loadDashboard} />
        </View>
      )}
      {!loading && !dashboardError && (
        <View style={styles.card}>
          <Text>Total Income: ${summary.totalIncome}</Text>
          <Text>Total Expenses: ${summary.totalExpenses}</Text>
          <Text>Savings: ${summary.savings}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Recent Incomes</Text>

      {incomes.map((income) => (
        <View key={`income-${income.id}`} style={styles.row}>
          <Text>
            + {income.title} (${income.amount})
          </Text>

          <View style={styles.actionContainer}>
            <Button
              title="Edit"
              onPress={() =>
                navigation.navigate("AddIncome", {
                  incomeId: income.id,
                })
              }
            />

            <Button
              title="Delete"
              onPress={() => handleDeleteIncome(income.id)}
            />
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Recent Expenses</Text>

      {expenses.map((expense) => (
        <View key={`expense-${expense.id}`} style={styles.row}>
          <Text>
            - {expense.title} (${expense.amount})
          </Text>

          <View style={styles.actionContainer}>
            <Button
              title="Edit"
              onPress={() =>
                navigation.navigate("AddExpense", {
                  expenseId: expense.id,
                })
              }
            />

            <Button
              title="Delete"
              onPress={() => handleDeleteExpense(expense.id)}
            />
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Budget Overview</Text>

      {dashboardError || loading ? (
        <Text>Budget totals unavailable.</Text>
      ) : budgetUsage.length === 0 ? (
        <Text>No budgets created yet</Text>
      ) : (
        budgetUsage.map((budget) => {
          const isOverBudget = AnalyticsService.isOverBudget(
            budget.spentAmount,
            budget.budgetAmount,
          );

          return (
            <View key={budget.budgetId} style={styles.budgetCard}>
              <Text style={styles.budgetTitle}>{budget.category.name}</Text>

              <Text>
                ${budget.spentAmount} / ${budget.budgetAmount}
              </Text>

              <Text>Remaining: ${Math.max(budget.remainingAmount, 0)}</Text>

              <Text>{budget.percentageUsed}% Used</Text>

              {isOverBudget && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>⚠ Over Budget</Text>

                  <Text>Over by ${Math.abs(budget.remainingAmount)}</Text>
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Payments</Text>

        {upcomingPayments.length === 0 ? (
          <Text>No upcoming payments.</Text>
        ) : (
          upcomingPayments.map((payment) => {
            const daysUntil = getDaysUntil(payment.nextDueDate);

            const status = getRecurringPaymentStatus(daysUntil);

            return (
              <View key={payment.id} style={styles.paymentCard}>
                <Text style={styles.paymentName}>{payment.name}</Text>

                <Text>${payment.amount.toFixed(2)}</Text>
                <Text>{payment.category}</Text>

                <Text style={styles.paymentStatus}>
                  {status.indicator} {status.label}
                </Text>
                <Button
                  title="Complete Payment"
                  onPress={() => handleCompletePayment(payment)}
                />
              </View>
            );
          })
        )}
      </View>

      <Button
        title="Add Expense"
        onPress={() => navigation.navigate("AddExpense")}
      />

      <View style={styles.spacer} />

      <Button
        title="Add Income"
        onPress={() => navigation.navigate("AddIncome")}
      />

      <Button
        title="Create Budget"
        onPress={() => navigation.navigate("CreateBudget")}
      />

      <Button
        title="View Budgets"
        onPress={() => navigation.navigate("BudgetList")}
      />

      <Button title="Reports" onPress={() => navigation.navigate("Reports")} />
      <Button
        title="Recurring Payments"
        onPress={() => navigation.navigate("RecurringPayments")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  actionContainer: {
    flexDirection: "row",
  },

  spacer: {
    height: 10,
  },

  budgetCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },

  budgetTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  warningContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
  },

  warningText: {
    color: "red",
    fontWeight: "bold",
  },

  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
  },

  paymentCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  paymentName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentStatus: {
    marginTop: 4,
    fontSize: 14,
  },
});
