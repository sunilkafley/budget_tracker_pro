import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import {
  FinancePage,
  BudgetCard,
  formatMoney,
  finance,
} from "../components/FinanceUI";
import { AppNavigation } from "../types/navigation";
import { BudgetUsage } from "../application/dto/BudgetUsage";
import { useRepositories } from "../context/RepositoryContext";
import { ActionButton, LoadState, ui } from "../components/AppUI";
import { colors } from "../theme";

export default function BudgetListScreen() {
  const navigation = useNavigation<AppNavigation>();
  const { getBudgetUsageUseCase, deleteBudgetUseCase } = useRepositories();
  const [monthlyPlan, setMonthlyPlan] =
    useState<
      Awaited<
        ReturnType<typeof getBudgetUsageUseCase.executeOverview>
      >["monthlyPlan"]
    >();
  const [budgets, setBudgets] = useState<BudgetUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [showDetails, setShowDetails] = useState(false);
  const [pending, setPending] = useState(false);
  const mutationPending = useRef(false);
  const request = useRef(0);

  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError(undefined);
    try {
      const overview = await getBudgetUsageUseCase.executeOverview();
      if (current === request.current) {
        setBudgets(overview.budgets);
        setMonthlyPlan(overview.monthlyPlan);
      }
    } catch (reason) {
      if (current === request.current)
        setError(
          reason instanceof Error ? reason.message : "Unable to load budgets.",
        );
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [getBudgetUsageUseCase]);
  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {
        request.current++;
      };
    }, [load]),
  );

  const remove = (id: string) =>
    Alert.alert("Delete budget?", "Your recorded expenses will be kept.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (mutationPending.current) return;
          mutationPending.current = true;
          setPending(true);
          void deleteBudgetUseCase
            .execute(id)
            .then(load)
            .catch((reason: unknown) => {
              Alert.alert(
                "Unable to delete budget",
                reason instanceof Error ? reason.message : "Please try again.",
              );
            })
            .finally(() => {
              mutationPending.current = false;
              setPending(false);
            });
        },
      },
    ]);

  return (
    <FinancePage title={budgets.some((budget) => budget.frequency !== "MONTHLY") ? "Category budgets" : "Monthly budgets"} onRefresh={() => void load()}>
      <FlatList
        contentContainerStyle={finance.content}
        data={loading || error ? [] : budgets}
        keyExtractor={(item) => item.budgetId}
        refreshing={loading}
        onRefresh={() => void load()}
        ListFooterComponent={
          <View style={{ gap: 8, marginTop: 6 }}>
            <ActionButton title="+ Create budget" variant="quiet" onPress={() => navigation.navigate("CreateBudget")} />
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: showDetails }}
              onPress={() => setShowDetails(!showDetails)} style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{showDetails ? "Hide period details" : "About budget periods"}</Text>
            </Pressable>
            {showDetails && <View style={finance.card}>
              <Text style={ui.body}>Each cap follows its own calendar period. Weeks start Monday; unused amounts do not roll over. Monthly cards cover the current calendar month.</Text>
              {!loading && !error && monthlyPlan && monthlyPlan.count > 0 && <Text style={[ui.body, { marginTop: 10 }]}>
                Monthly caps: {formatMoney(monthlyPlan.limit)}. {formatMoney(Math.abs(monthlyPlan.remaining))} {monthlyPlan.remaining < 0 ? "over limit" : "remaining"}. If a category has several caps, its lowest cap applies to this combined total.
              </Text>}
            </View>}
          </View>
        }
        ListEmptyComponent={
          <LoadState
            loading={loading}
            error={error}
            empty="No budgets yet. Give your spending a little direction."
            onRetry={() => void load()}
          />
        }
        renderItem={({ item }) => (
          <BudgetCard
            budget={item}
            disabled={pending}
            onEdit={() =>
              navigation.navigate("CreateBudget", { budgetId: item.budgetId })
            }
            onDelete={() => remove(item.budgetId)}
          />
        )}
      />
    </FinancePage>
  );
}
