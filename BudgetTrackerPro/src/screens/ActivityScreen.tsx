import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRootNavigation } from "../hooks/useRootNavigation";
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
  const navigation = useRootNavigation();
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
                marginBottom: 12,
              }}
            >
              <Icon name="search" size={18} color={colors.subtle} />
              <TextInput
                accessibilityLabel="Search transactions by title, category or source"
                placeholder="Search merchant or category..."
                placeholderTextColor={colors.subtle}
                value={query}
                onChangeText={setQuery}
                style={{
                  flex: 1,
                  minHeight: 46,
                  color: colors.text,
                  fontSize: 14,
                }}
                clearButtonMode="while-editing"
              />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {(["all", "expense", "income"] as const).map((kind) => (
                <Pressable
                  key={kind}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === kind }}
                  onPress={() => setFilter(kind)}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 16,
                    justifyContent: "center",
                    borderRadius: 14,
                    backgroundColor:
                      filter === kind ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      filter === kind ? colors.primary : colors.inputBorder,
                  }}
                >
                  <Text
                    style={{
                      color: filter === kind ? "white" : "#526075",
                      fontWeight: filter === kind ? "600" : "400",
                      fontSize: 13,
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
