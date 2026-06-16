import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

import { Income } from "../domain/models/Income";
import { useRepositories } from "../context/RepositoryContext";

export function AddIncomeScreen({ navigation }: any) {
  const { addIncomeUseCase } = useRepositories();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");

  const handleSave = async () => {
    try {
      const income = new Income(
        Date.now().toString(),
        title,
        Number(amount),
        new Date(),
        source,
      );

      await addIncomeUseCase.execute(income);

      Alert.alert("Success", "Income saved");

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Unable to save income");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Income</Text>

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

      <Button title="Save Income" onPress={handleSave} />
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
