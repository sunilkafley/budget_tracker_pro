import React, { useCallback, useState } from "react";

import { View, Text, FlatList, Button, Alert, StyleSheet } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { RecurringPayment } from "../domain/models/RecurringPayment";

import { useRepositories } from "../context/RepositoryContext";

export function RecurringPaymentsScreen({ navigation }: any) {
  const {
    getAllRecurringPaymentsUseCase,
    deleteRecurringPaymentUseCase,
    completeRecurringPaymentUseCase,
  } = useRepositories();

  const [payments, setPayments] = useState<RecurringPayment[]>([]);

  const loadPayments = async () => {
    const data = await getAllRecurringPaymentsUseCase.execute();

    setPayments(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, []),
  );

  const handleCompletePayment = (id: string) => {
    Alert.alert("Complete Payment", "Create expense and advance due date?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await completeRecurringPaymentUseCase.execute(id);
            await loadPayments();
            Alert.alert("Success", "Payment completed successfully.");
          } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Unable to complete payment.");
          }
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
            await deleteRecurringPaymentUseCase.execute(id);

            loadPayments();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="Add Recurring Payment"
        onPress={() => navigation.navigate("CreateRecurringPayment")}
      />

      <FlatList
        style={styles.list}
        data={payments}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recurring payments found.</Text>
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
                title="Edit"
                onPress={() =>
                  navigation.navigate("CreateRecurringPayment", {
                    recurringPaymentId: item.id,
                  })
                }
              />

              <Button title="Delete" onPress={() => handleDelete(item.id)} />
              <Button
                title="Complete"
                onPress={() => handleCompletePayment(item.id)}
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
    marginTop: 10,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },
});
