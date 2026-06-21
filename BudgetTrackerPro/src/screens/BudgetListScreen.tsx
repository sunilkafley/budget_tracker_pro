import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { Budget } from "../domain/models/Budget";

import { useRepositories } from "../context/RepositoryContext";

import { GetAllBudgetsUseCase } from "../application/useCases/GetAllBudgetsUseCase";

export default function BudgetListScreen({ navigation }: any) {
  const { budgetRepository, deleteBudgetUseCase } = useRepositories();

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const loadBudgets = async () => {
    const useCase = new GetAllBudgetsUseCase(budgetRepository);

    const data = await useCase.execute();

    setBudgets(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, []),
  );

  const handleDeleteBudget = (id: string) => {
    Alert.alert("Delete Budget", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Delete",
        style: "destructive",

        onPress: async () => {
          await deleteBudgetUseCase.execute(id);

          await loadBudgets();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budgets</Text>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Budget category */}
            <Text style={styles.category}>{item.category.name}</Text>

            {/* Budget limit */}
            <Text>Limit: ${item.limitAmount}</Text>

            {/* Budget frequency */}
            <Text>{item.frequency}</Text>

            {/* Budget actions */}
            <View style={styles.buttonRow}>
              <Button
                title="Edit"
                onPress={() =>
                  navigation.navigate("CreateBudget", {
                    budgetId: item.id,
                  })
                }
              />

              <Button
                title="Delete"
                onPress={() => handleDeleteBudget(item.id)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No budgets created yet</Text>}
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
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },

  category: {
    fontSize: 18,
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
