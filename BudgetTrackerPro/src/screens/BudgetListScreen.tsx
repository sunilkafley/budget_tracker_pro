import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import {
  FinancePage,
  BudgetCard,
  Progress,
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
    <FinancePage title="Category budgets" onRefresh={() => void load()}>
      <FlatList
        contentContainerStyle={finance.content}
        data={loading || error ? [] : budgets}
        keyExtractor={(item) => item.budgetId}
        refreshing={loading}
        onRefresh={() => void load()}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 20 }}>
            {!loading && !error && monthlyPlan && monthlyPlan.count > 0 && (
              <View style={finance.card}>
                <View style={finance.row}>
                  <View>
                    <Text style={finance.caption}>Total monthly cap</Text>
                    <Text
                      style={{
                        fontSize: 26,
                        fontWeight: "800",
                        color: colors.text,
                        marginTop: 8,
                      }}
                    >
                      {formatMoney(monthlyPlan.limit)}
                    </Text>
                  </View>
                  <View>
                    <Text style={finance.caption}>
                      {monthlyPlan.remaining < 0 ? "Over limit" : "Remaining"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color:
                          monthlyPlan.remaining < 0
                            ? colors.danger
                            : colors.success,
                        marginTop: 8,
                      }}
                    >
                      {formatMoney(Math.abs(monthlyPlan.remaining))}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 22 }}>
                  <Progress
                    percentage={monthlyPlan.percentage}
                    label="Monthly budget usage"
                    color={
                      monthlyPlan.percentage >= 90
                        ? colors.warning
                        : colors.success
                    }
                  />
                </View>
                <Text style={[finance.caption, { marginTop: 10 }]}>
                  Monthly categories only. If a category has several caps, its
                  lowest cap applies to this total.
                </Text>
              </View>
            )}
            <Text style={ui.body}>
              Each cap follows its own calendar period. Weeks start Monday;
              unused amounts do not roll over.
            </Text>
            <ActionButton
              title="+ Create budget"
              onPress={() => navigation.navigate("CreateBudget")}
            />
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
