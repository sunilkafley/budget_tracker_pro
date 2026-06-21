import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

import { Budget } from "../domain/models/Budget";
import { Category } from "../domain/models/Category";

import { CategoryType } from "../domain/enums/CategoryType";
import { Frequency } from "../domain/enums/Frequency";

import { CreateBudgetUseCase } from "../application/useCases/CreateBudgetUseCase";

import { useRepositories } from "../context/RepositoryContext";

export default function CreateBudgetScreen() {
  const { budgetRepository } = useRepositories();

  const [amount, setAmount] = useState("");

  const handleSave = async () => {
    try {
      const category = new Category("grocery", "Grocery", CategoryType.GROCERY);

      const budget = new Budget(
        Date.now().toString(),
        category,
        Number(amount),
        Frequency.MONTHLY,
      );

      const createBudgetUseCase = new CreateBudgetUseCase(budgetRepository);

      await createBudgetUseCase.execute(budget);

      Alert.alert("Success", "Budget created successfully");

      setAmount("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Budget</Text>

      <Text style={styles.label}>Budget Amount</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="500"
      />

      <Button title="Save Budget" onPress={handleSave} />
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
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
});
