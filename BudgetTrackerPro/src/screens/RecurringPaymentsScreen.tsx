import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import React, { useCallback, useRef, useState } from "react";

import { View, Text, FlatList, Button, Alert, StyleSheet } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { RecurringPayment } from "../domain/models/RecurringPayment";

import { useRepositories } from "../context/RepositoryContext";

export function RecurringPaymentsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "RecurringPayments">) {
  const {
    getAllRecurringPaymentsUseCase,
    deleteRecurringPaymentUseCase,
    completeRecurringPaymentUseCase,
  } = useRepositories();

  const [payments, setPayments] = useState<RecurringPayment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const mutationPending = useRef(false);
  const loadPayments = useCallback(async () => {
    setLoading(true); setError(null);
    try { setPayments(await getAllRecurringPaymentsUseCase.execute()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load payments.'); }
    finally { setLoading(false); }
  }, [getAllRecurringPaymentsUseCase]);
  const mutate = async (operation: () => Promise<void>, success: string) => {
    if (mutationPending.current) return;
    mutationPending.current = true; setPending(true);
    try { await operation(); await loadPayments(); Alert.alert('Saved', success); }
    catch (reason) { Alert.alert('Unable to save', reason instanceof Error ? reason.message : 'Please try again.'); }
    finally { mutationPending.current = false; setPending(false); }
  };

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments]),
  );

  const handleCompletePayment = (payment: RecurringPayment) => {
    Alert.alert("Complete Payment", "Create expense and advance due date?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: async () => {
          await mutate(() => completeRecurringPaymentUseCase.execute(payment.id, payment.nextDueDate), 'Expense recorded and due date updated.');
        },
      },
    ]);
  };
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this recurring payment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await mutate(() => deleteRecurringPaymentUseCase.execute(id), 'Recurring payment deleted.');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Button
        disabled={pending}
        title="Add Recurring Payment"
        onPress={() => navigation.navigate("CreateRecurringPayment", {})}
      />

      {pending && <Text accessibilityLiveRegion="polite">Saving payment…</Text>}
      {error && <View><Text>{error}</Text><Button title="Retry" onPress={() => void loadPayments()} /></View>}
      <FlatList
        style={styles.list}
        data={error ? [] : payments}
        refreshing={loading}
        onRefresh={() => void loadPayments()}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{loading ? "Loading payments…" : error ? "Payments unavailable." : "No recurring payments found."}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>

            <Text>Amount: ${item.amount.toFixed(2)}</Text>

            <Text>Frequency: {item.frequency}</Text>
            <Text>Category: {item.category}</Text>

            <Text>Due: {item.nextDueDate.toLocaleDateString()}</Text>

            <View style={styles.buttonRow}>
              <Button
                disabled={pending}
                title="Edit"
                onPress={() =>
                  navigation.navigate("CreateRecurringPayment", {
                    recurringPaymentId: item.id,
                  })
                }
              />

              <Button disabled={pending} title="Delete" onPress={() => handleDelete(item.id)} />
              <Button
                disabled={pending}
                title="Complete"
                onPress={() => handleCompletePayment(item)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  list: {
    marginTop: 20,
  },

  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 10,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },
});
