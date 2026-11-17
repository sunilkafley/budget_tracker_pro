import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { BudgetUsage } from "../application/dto/BudgetUsage";
import { useRepositories } from "../context/RepositoryContext";
import { ActionButton, Card, LoadState, ui } from "../components/AppUI";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "BudgetList">;

export default function BudgetListScreen({ navigation }: Props) {
  const { getBudgetUsageUseCase, deleteBudgetUseCase } = useRepositories();
  const [budgets, setBudgets] = useState<BudgetUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const mutationPending = useRef(false);
  const request = useRef(0);

  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true); setError(undefined);
    try {
      const usage = await getBudgetUsageUseCase.execute();
      if (current === request.current) setBudgets(usage);
    } catch (reason) {
      if (current === request.current) setError(reason instanceof Error ? reason.message : "Unable to load budgets.");
    } finally { if (current === request.current) setLoading(false); }
  }, [getBudgetUsageUseCase]);
  useFocusEffect(useCallback(() => { void load(); return () => { request.current++; }; }, [load]));

  const remove = (id: string) => Alert.alert("Delete budget?", "Your recorded expenses will be kept.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => {
      if (mutationPending.current) return;
      mutationPending.current = true; setPending(true);
      void deleteBudgetUseCase.execute(id).then(load).catch((reason: unknown) => {
        Alert.alert("Unable to delete budget", reason instanceof Error ? reason.message : "Please try again.");
      }).finally(() => { mutationPending.current = false; setPending(false); });
    } },
  ]);

  return <View style={styles.screen}>
    <FlatList contentContainerStyle={styles.content} data={loading || error ? [] : budgets} keyExtractor={(item) => item.budgetId}
      refreshing={loading} onRefresh={() => void load()}
      ListHeaderComponent={<View style={styles.header}><Text accessibilityRole="header" style={styles.heading}>Budgets</Text>
        <Text style={ui.body}>Spending in the current calendar period. Weeks start Monday; amounts do not roll over.</Text>
        <ActionButton title="+ Create budget" onPress={() => navigation.navigate("CreateBudget")} />
      </View>}
      ListEmptyComponent={<LoadState loading={loading} error={error} empty="No budgets yet. Create one to plan your category spending." onRetry={() => void load()} />}
      renderItem={({ item }) => <Card>
        <Text style={styles.title}>{item.category.name}</Text>
        <Text style={ui.body}>{item.frequency} · {item.periodStart.toLocaleDateString()} to {new Date(item.periodEnd.getTime() - 1).toLocaleDateString()}</Text>
        <Text style={styles.amount}>${item.spentAmount.toFixed(2)} of ${item.budgetAmount.toFixed(2)}</Text>
        <Text style={[ui.body, item.isOverBudget && styles.over]}>{item.isOverBudget ? `$${Math.abs(item.remainingAmount).toFixed(2)} over limit` : `$${item.remainingAmount.toFixed(2)} remaining`} · {item.percentageUsed}% used</Text>
        <View style={styles.actions}>
          <ActionButton title="Edit" label={`Edit ${item.category.name} budget`} disabled={pending} variant="quiet" onPress={() => navigation.navigate("CreateBudget", { budgetId: item.budgetId })} />
          <ActionButton title="Delete" label={`Delete ${item.category.name} budget`} disabled={pending} variant="danger" onPress={() => remove(item.budgetId)} />
        </View>
      </Card>} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, width: "100%", maxWidth: 720, alignSelf: "center" },
  header: { gap: 16, marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: "700", color: colors.text },
  title: { fontSize: 18, fontWeight: "600", color: colors.text },
  amount: { fontSize: 22, fontWeight: "700", color: colors.text, marginVertical: 12 },
  over: { color: colors.danger }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
});
