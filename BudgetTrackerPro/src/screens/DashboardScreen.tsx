import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, Button } from "react-native";

import { useRepositories } from "../context/RepositoryContext";

import { Income } from "../domain/models/Income";
import { Expense } from "../domain/models/Expense";

export function DashboardScreen({ navigation }: any) {
  const {
    getDashboardSummaryUseCase,
    getAllIncomesUseCase,
    getAllExpensesUseCase,
  } = useRepositories();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    topCategory: "",
    upcomingPaymentsCount: 0,
  });

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadDashboard = async () => {
    const summaryResult = await getDashboardSummaryUseCase.execute();

    const incomesResult = await getAllIncomesUseCase.execute();

    const expensesResult = await getAllExpensesUseCase.execute();

    setSummary(summaryResult);
    setIncomes(incomesResult);
    setExpenses(expensesResult);
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Tracker Pro</Text>

      <View style={styles.card}>
        <Text>Total Income: ${summary.totalIncome}</Text>

        <Text>Total Expenses: ${summary.totalExpenses}</Text>

        <Text>Savings: ${summary.savings}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Incomes</Text>

      {incomes.map((income) => (
        <View
          key={income.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text>
            + {income.title} (${income.amount})
          </Text>

          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate("AddIncome", {
                incomeId: income.id,
              })
            }
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Recent Expenses</Text>

      {expenses.map((expense) => (
        <View
          key={expense.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text>
            - {expense.title} (${expense.amount})
          </Text>

          <Button
            title="Edit"
            onPress={() =>
              navigation.navigate("AddExpense", {
                expenseId: expense.id,
              })
            }
          />
        </View>
      ))}

      <Button
        title="Add Expense"
        onPress={() => navigation.navigate("AddExpense")}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Add Income"
        onPress={() => navigation.navigate("AddIncome")}
      />
    </View>
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
});
