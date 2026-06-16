import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, Button } from "react-native";

import { useRepositories } from "../context/RepositoryContext";

export function DashboardScreen({ navigation }: any) {
  const { getDashboardSummaryUseCase } = useRepositories();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    topCategory: "",
    upcomingPaymentsCount: 0,
  });

  const loadDashboard = async () => {
    const result = await getDashboardSummaryUseCase.execute();

    setSummary(result);
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
});
