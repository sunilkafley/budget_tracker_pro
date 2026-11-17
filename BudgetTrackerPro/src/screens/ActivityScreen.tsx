import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigation } from "../types/navigation";
import { useRepositories } from "../context/RepositoryContext";
import { useFocusedResource } from "../hooks/useFocusedResource";
import { ActivityFilter, filterActivity } from "../application/filterActivity";
import { DashboardTransaction } from "../application/useCases/GetDashboardTransactionsUseCase";
import {
  FinancePage,
  TransactionRow,
  Icon,
  finance,
} from "../components/FinanceUI";
import { LoadState } from "../components/AppUI";
import { colors } from "../theme";
export function ActivityScreen() {
  const navigation = useNavigation<AppNavigation>();
  const {
    getDashboardTransactionsUseCase,
    deleteExpenseUseCase,
    deleteIncomeUseCase,
  } = useRepositories();
  const read = useCallback(
    () => getDashboardTransactionsUseCase.execute(),
    [getDashboardTransactionsUseCase],
  );
  const { data, loading, error, load } = useFocusedResource(read);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [pending, setPending] = useState(false);
  const guard = useRef(false);
  const records = useMemo(
    () => filterActivity(data ?? [], query, filter),
    [data, query, filter],
  );
  const remove = (record: DashboardTransaction) =>
    Alert.alert("Delete transaction?", record.transaction.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (guard.current) return;
          guard.current = true;
          setPending(true);
          try {
            await (record.kind === "income"
              ? deleteIncomeUseCase.execute(record.transaction.id)
              : deleteExpenseUseCase.execute(record.transaction.id));
            await load();
          } catch (reason) {
            Alert.alert(
              "Unable to delete",
              reason instanceof Error ? reason.message : "Please try again.",
            );
          } finally {
            guard.current = false;
            setPending(false);
          }
        },
      },
    ]);
  return (
    <FinancePage title="Transactions" onRefresh={() => void load()}>
      <FlatList
        data={loading || error ? [] : records}
        keyExtractor={(item) => item.kind + "-" + item.transaction.id}
        contentContainerStyle={finance.content}
        refreshing={loading}
        onRefresh={() => void load()}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                borderRadius: 18,
                paddingHorizontal: 14,
                marginBottom: 18,
              }}
            >
              <Icon name="search" />
              <TextInput
                accessibilityLabel="Search transactions by title, category or source"
                placeholder="Search title or category…"
                placeholderTextColor={colors.subtle}
                value={query}
                onChangeText={setQuery}
                style={{
                  flex: 1,
                  minHeight: 52,
                  color: colors.text,
                  fontSize: 15,
                }}
                clearButtonMode="while-editing"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {(["all", "expense", "income"] as const).map((kind) => (
                <Pressable
                  key={kind}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === kind }}
                  onPress={() => setFilter(kind)}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 18,
                    justifyContent: "center",
                    borderRadius: 16,
                    backgroundColor:
                      filter === kind ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      filter === kind ? colors.primary : colors.inputBorder,
                  }}
                >
                  <Text
                    style={{
                      color: filter === kind ? "white" : colors.muted,
                      fontWeight: "600",
                    }}
                  >
                    {kind === "all"
                      ? "All"
                      : kind === "expense"
                        ? "Expenses"
                        : "Income"}
                  </Text>
                </Pressable>
              ))}
            </View>
            {!loading && !error && (
              <Text style={[finance.caption, { marginBottom: 12 }]}>
                {records.length}{" "}
                {records.length === 1 ? "transaction" : "transactions"} · newest
                first
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <LoadState
            loading={loading}
            error={error}
            empty={
              data?.length
                ? "No matching transactions. Try another search or filter."
                : "Your activity starts here. Tap + to add your first entry."
            }
            onRetry={() => void load()}
          />
        }
        renderItem={({ item }) => (
          <TransactionRow
            record={item}
            disabled={pending}
            onDelete={() => remove(item)}
            onEdit={() =>
              item.kind === "income"
                ? navigation.navigate("AddIncome", {
                    incomeId: item.transaction.id,
                  })
                : navigation.navigate("AddExpense", {
                    expenseId: item.transaction.id,
                  })
            }
          />
        )}
      />
    </FinancePage>
  );
}
