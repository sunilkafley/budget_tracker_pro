import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

import { Budget } from "../domain/models/Budget";
import { Category } from "../domain/models/Category";

import { CategoryType } from "../domain/enums/CategoryType";
import { Frequency } from "../domain/enums/Frequency";

import { useRepositories } from "../context/RepositoryContext";

export default function CreateBudgetScreen({ navigation, route }: any) {
  const { budgetRepository, createBudgetUseCase, updateBudgetUseCase } =
    useRepositories();

  // Budget amount
  const [amount, setAmount] = useState("");

  // Selected budget category
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    CategoryType.GROCERY,
  );

  // Determine if we are editing
  const budgetId = route?.params?.budgetId;

  const isEditMode = !!budgetId;

  /**
   * Load existing budget when editing
   */
  useEffect(() => {
    const loadBudget = async () => {
      if (!budgetId) return;

      const budget = await budgetRepository.getById(budgetId);

      if (budget) {
        setAmount(budget.limitAmount.toString());

        setSelectedCategory(budget.category.type);
      }
    };

    loadBudget();
  }, [budgetId]);

  /**
   * Save budget
   */
  const handleSave = async () => {
    try {
      const category = new Category(
        selectedCategory,
        selectedCategory,
        selectedCategory,
      );

      const budget = new Budget(
        isEditMode ? budgetId : Date.now().toString(),
        category,
        Number(amount),
        Frequency.MONTHLY,
      );

      if (isEditMode) {
        await updateBudgetUseCase.execute(budget);
      } else {
        await createBudgetUseCase.execute(budget);
      }

      Alert.alert(
        "Success",
        isEditMode
          ? "Budget updated successfully"
          : "Budget created successfully",
      );

      navigation.navigate("BudgetList");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEditMode ? "Edit Budget" : "Create Budget"}
      </Text>

      {/* Budget Amount */}
      <Text style={styles.label}>Budget Amount</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="500"
      />

      {/* Category Selection */}
      <Text style={styles.label}>Category</Text>

      <View style={styles.categoryContainer}>
        {[
          CategoryType.GROCERY,
          CategoryType.TRANSPORT,
          CategoryType.HOUSING,
          CategoryType.FITNESS,
          CategoryType.INSURANCE,
          CategoryType.ENTERTAINMENT,
          CategoryType.OTHER,
        ].map((category) => (
          <View key={category} style={styles.categoryButton}>
            <Button
              title={category}
              onPress={() => setSelectedCategory(category)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.selectedCategory}>Selected: {selectedCategory}</Text>

      <Button
        title={isEditMode ? "Update Budget" : "Save Budget"}
        onPress={handleSave}
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
    marginBottom: 24,
  },

  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },

  categoryContainer: {
    marginBottom: 20,
  },

  categoryButton: {
    marginBottom: 8,
  },

  selectedCategory: {
    marginBottom: 20,
    fontWeight: "bold",
  },
});
