import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

import { Income } from "../domain/models/Income";
import { Money } from "../domain/services/Money";
import { useRepositories } from "../context/RepositoryContext";

export function AddIncomeScreen({ navigation, route }: any) {
  const { addIncomeUseCase, updateIncomeUseCase, incomeRepository } =
    useRepositories();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const incomeId = route?.params?.incomeId;

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const loadIncome = async () => {
      if (!incomeId) {
        return;
      }

      const income = await incomeRepository.getById(incomeId);

      if (!income) {
        return;
      }

      setTitle(income.title);
      setAmount(income.amount.toString());
      setSource(income.source);

      setIsEditMode(true);
    };

    loadIncome();
  }, [incomeId]);

  const handleSave = async () => {
    try {
      const income = new Income(
        incomeId ?? Date.now().toString(),
        title,
        Money.parseInput(amount),
        new Date(),
        source,
      );

      if (isEditMode) {
        await updateIncomeUseCase.execute(income);

        Alert.alert("Success", "Income updated");
      } else {
        await addIncomeUseCase.execute(income);

        Alert.alert("Success", "Income saved");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save income");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {isEditMode ? "Edit Income" : "Add Income"}
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

      <TextInput
        placeholder="Source"
        value={source}
        onChangeText={setSource}
        style={styles.input}
      />

      <Button
        title={isEditMode ? "Update Income" : "Save Income"}
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
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
});
