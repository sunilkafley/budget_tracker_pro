import { parseRecurringDate, formatRecurringDate } from "../utils/recurringDateInput";
import { RecurringPayment } from "../domain/models/RecurringPayment";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";

import { Frequency } from "../domain/enums/Frequency";
import { Money } from "../domain/services/Money";
import { createRecurringPayment } from "../utils/RecurringPaymentFactory";
import { useRepositories } from "../context/RepositoryContext";
import { CategoryType } from "../domain/enums/CategoryType";

export default function CreateRecurringPaymentScreen({
  navigation,
  route,
}: any) {
  const {
    recurringPaymentRepository,
    createRecurringPaymentUseCase,
    updateRecurringPaymentUseCase,
  } = useRepositories();

  const recurringPaymentId = route?.params?.recurringPaymentId;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [category, setCategory] = useState<CategoryType>(CategoryType.OTHER);

  const [nextDueDate, setNextDueDate] = useState(
    formatRecurringDate(new Date()),
  );

  useEffect(() => {
    const loadPayment = async () => {
      if (!recurringPaymentId) {
        return;
      }

      const payment =
        await recurringPaymentRepository.getById(recurringPaymentId);

      if (!payment) {
        return;
      }

      setName(payment.name);
      setAmount(payment.amount.toString());
      setFrequency(payment.frequency);
      setCategory(payment.category);

      setNextDueDate(formatRecurringDate(payment.nextDueDate));
    };

    loadPayment();
  }, [recurringPaymentId]);

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert("Validation Error", "Please enter a name.");
        return;
      }

      const amountValue = Money.parseInput(amount);

      if (amountValue <= 0) {
        Alert.alert("Validation Error", "Please enter a valid amount.");
        return;
      }

      if (recurringPaymentId) {
        const existingPayment =
          await recurringPaymentRepository.getById(recurringPaymentId);

        if (!existingPayment) {
          return;
        }

        const updated = new RecurringPayment(existingPayment.id, name, amountValue, category, frequency, nextDueDate === formatRecurringDate(existingPayment.nextDueDate) ? new Date(existingPayment.nextDueDate) : parseRecurringDate(nextDueDate));
        await updateRecurringPaymentUseCase.execute(updated);
      } else {
        const payment = createRecurringPayment(
          name,
          amountValue,
          category,
          frequency,
          parseRecurringDate(nextDueDate),
        );

        await createRecurringPaymentUseCase.execute(payment);
      }

      navigation.navigate("RecurringPayments");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save recurring payment.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {recurringPaymentId
          ? "Edit Recurring Payment"
          : "Create Recurring Payment"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Payment Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={nextDueDate}
        onChangeText={setNextDueDate}
      />
      <Text style={styles.label}>Category</Text>

      <Button
        title={`Category: ${category}`}
        onPress={() => {
          const categories: CategoryType[] = Object.values(CategoryType).filter(
            (value) => value !== CategoryType.INCOME,
          );

          const currentIndex = categories.indexOf(category);

          const nextIndex = (currentIndex + 1) % categories.length;

          setCategory(categories[nextIndex]);
        }}
      />

      <View style={styles.spacing} />

      <Text style={styles.label}>Frequency</Text>

      <Button
        title={`Frequency: ${frequency}`}
        onPress={() => {
          const frequencies = Object.values(Frequency);

          const currentIndex = frequencies.indexOf(frequency);

          const nextIndex = (currentIndex + 1) % frequencies.length;

          setFrequency(frequencies[nextIndex]);
        }}
      />

      <View style={styles.spacing} />

      <Button
        title={recurringPaymentId ? "Update Payment" : "Save Payment"}
        onPress={handleSave}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },

  label: {
    marginBottom: 10,
    fontWeight: "bold",
  },

  spacing: {
    height: 20,
  },
});
