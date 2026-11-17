import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRepositories } from "../context/RepositoryContext";
import { useFocusedResource } from "../hooks/useFocusedResource";
import { FinancePage, finance, formatMoney } from "../components/FinanceUI";
import { ExpenseDonut, SpendingBars } from "../components/SpendingCharts";
import { LoadState } from "../components/AppUI";
import { colors } from "../theme";
export default function ReportsScreen() {
  const { getInsightsUseCase } = useRepositories();
  const [period, setPeriod] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const read = useCallback(
    () =>
      getInsightsUseCase.execute(period.getMonth() + 1, period.getFullYear()),
    [getInsightsUseCase, period],
  );
  const { data, loading, error, load } = useFocusedResource(read);
  const shift = (offset: number) =>
    setPeriod(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  return (
    <FinancePage title="Insights" onRefresh={() => void load()}>
      <ScrollView
        contentContainerStyle={finance.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void load()} />
        }
      >
        <View style={[finance.card, finance.row, { padding: 6 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => shift(-1)}
            style={{ padding: 12, minWidth: 48 }}
          >
            <Text style={{ fontSize: 24, color: colors.primary }}>‹</Text>
          </Pressable>
          <Text style={finance.title}>
            {period.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => shift(1)}
            style={{ padding: 12, minWidth: 48 }}
          >
            <Text style={{ fontSize: 24, color: colors.primary }}>›</Text>
          </Pressable>
        </View>
        {loading || error || !data ? (
          <LoadState
            loading={loading}
            error={error}
            empty="No insights available."
            onRetry={() => void load()}
          />
        ) : (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <View style={[finance.card, { flex: 1, minWidth: 140 }]}>
                <Text style={finance.caption}>Savings rate</Text>
                <Text
                  style={{
                    fontSize: 27,
                    fontWeight: "700",
                    color:
                      data.report.savings >= 0 ? colors.success : colors.danger,
                    marginTop: 10,
                  }}
                >
                  {Math.round(data.report.savingsRate)}%
                </Text>
                <Text style={finance.caption}>
                  {data.report.totalIncome
                    ? "of recorded income"
                    : "No income recorded"}
                </Text>
              </View>
              <View style={[finance.card, { flex: 1, minWidth: 140 }]}>
                <Text style={finance.caption}>Avg. daily spend</Text>
                <Text
                  style={{
                    fontSize: 23,
                    fontWeight: "700",
                    color: colors.text,
                    marginTop: 10,
                  }}
                >
                  ≈ {formatMoney(data.averageDailySpend)}
                </Text>
                <Text style={finance.caption}>
                  {data.daysInPeriod} calendar days · / day
                </Text>
              </View>
            </View>
            <View style={finance.card}>
              <View style={[finance.row, { flexWrap: "wrap" }]}>
                <Text style={finance.section}>Spending trend</Text>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: colors.background,
                    borderRadius: 14,
                    padding: 3,
                  }}
                >
                  {(["daily", "weekly"] as const).map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: frequency === value }}
                      onPress={() => setFrequency(value)}
                      style={{
                        minHeight: 44,
                        paddingHorizontal: 12,
                        justifyContent: "center",
                        backgroundColor:
                          frequency === value ? colors.surface : "transparent",
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            frequency === value ? colors.text : colors.muted,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {value === "daily" ? "Daily" : "Weekly"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <SpendingBars
                key={frequency + period.toISOString()}
                points={frequency === "daily" ? data.daily : data.weekly}
              />
              <Text style={[finance.caption, { marginTop: 16 }]}>
                {frequency === "daily"
                  ? "Last seven elapsed days in this month."
                  : "Seven-day groups ending at the latest elapsed day."}{" "}
                Tap a bar for its amount.
              </Text>
            </View>
            <View style={finance.card}>
              <Text style={finance.section}>Expense breakdown</Text>
              <Text style={[finance.caption, { marginTop: 6 }]}>
                Tap a slice or category to highlight
              </Text>
              <ExpenseDonut
                key={period.toISOString()}
                categories={data.report.categoryBreakdown}
                total={data.report.totalExpenses}
              />
            </View>
            <View style={finance.card}>
              <Text style={finance.section}>Monthly cashflow</Text>
              {[
                { label: "Income", value: data.report.totalIncome },
                { label: "Expenses", value: data.report.totalExpenses },
                { label: "Net savings", value: data.report.savings },
              ].map((item) => (
                <View key={item.label} style={[finance.row, { marginTop: 16 }]}>
                  <Text style={finance.caption}>{item.label}</Text>
                  <Text style={finance.title}>{formatMoney(item.value)}</Text>
                </View>
              ))}
            </View>
            <Text style={finance.caption}>
              Current-month insights include entries through today. Future-dated
              entries are excluded. Average daily spending is rounded to the
              nearest cent.
            </Text>
          </>
        )}
      </ScrollView>
    </FinancePage>
  );
}
