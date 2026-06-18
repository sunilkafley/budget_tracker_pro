import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

import { Expense } from "../domain/models/Expense";
import { Category } from "../domain/models/Category";
import { CategoryType } from "../domain/enums/CategoryType";

import { useRepositories } from "../context/RepositoryContext";

export function AddExpenseScreen({ navigation, route }: any) {
  const { addExpenseUseCase, updateExpenseUseCase, expenseRepository } =
    useRepositories();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const expenseId = route?.params?.expenseId;

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const loadExpense = async () => {
      if (!expenseId) {
        return;
      }

      const expense = await expenseRepository.getById(expenseId);

      if (!expense) {
        return;
      }

      setTitle(expense.title);
      setAmount(expense.amount.toString());

      setIsEditMode(true);
    };

    loadExpense();
  }, [expenseId]);

  const handleSave = async () => {
    try {
      const category = new Category(
        "grocery",
        "Groceries",
        CategoryType.GROCERY,
      );

      const expense = new Expense(
        expenseId ?? Date.now().toString(),
        title,
        Number(amount),
        new Date(),
        category,
      );

      if (isEditMode) {
        await updateExpenseUseCase.execute(expense);

        Alert.alert("Success", "Expense updated");
      } else {
        await addExpenseUseCase.execute(expense);

        Alert.alert("Success", "Expense saved");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Unable to save expense");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {isEditMode ? "Edit Expense" : "Add Expense"}
      </Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <Button
        title={isEditMode ? "Update Expense" : "Save Expense"}
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

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});
