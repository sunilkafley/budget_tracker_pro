import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AppNavigation } from "../types/navigation";
import { useDashboard } from "../hooks/useDashboard";
import { useRepositories } from "../context/RepositoryContext";
import {
  FinancePage,
  BudgetCard,
  TransactionRow,
  Icon,
  Progress,
  finance,
  formatMoney,
} from "../components/FinanceUI";
import { LoadState, SectionHeading, ActionButton } from "../components/AppUI";
import { colors } from "../theme";
import { DashboardTransaction } from "../application/useCases/GetDashboardTransactionsUseCase";
import { RecurringPayment } from "../domain/models/RecurringPayment";
import { getDaysUntil } from "../utils/dateUtils";
import { getRecurringPaymentStatus } from "../utils/recurringPaymentStatusUtils";
export function DashboardScreen() {
  const navigation = useNavigation<AppNavigation>();
  const {
    summary,
    monthlyPlan,
    transactions,
    budgets,
    payments,
    errors,
    loading,
    load,
    cancel,
  } = useDashboard();
  const {
    deleteIncomeUseCase,
    deleteExpenseUseCase,
    completeRecurringPaymentUseCase,
  } = useRepositories();
  const [pending, setPending] = useState(false);
  const guard = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void load();
      return cancel;
    }, [load, cancel]),
  );
  const mutate = async (operation: () => Promise<void>) => {
    if (guard.current) return;
    guard.current = true;
    setPending(true);
    try {
      await operation();
      await load();
    } catch (reason) {
      Alert.alert(
        "Unable to save",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    } finally {
      guard.current = false;
      setPending(false);
    }
  };
  const remove = (record: DashboardTransaction) =>
    Alert.alert("Delete transaction?", record.transaction.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          void mutate(() =>
            record.kind === "income"
              ? deleteIncomeUseCase.execute(record.transaction.id)
              : deleteExpenseUseCase.execute(record.transaction.id),
          ),
      },
    ]);
  const complete = (payment: RecurringPayment) =>
    Alert.alert(
      "Record payment?",
      payment.name +
        " · " +
        formatMoney(payment.amount) +
        "\nCreate an expense and advance one occurrence?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () =>
            void mutate(() =>
              completeRecurringPaymentUseCase.execute(
                payment.id,
                payment.nextDueDate,
              ),
            ),
        },
      ],
    );
  const hasPlan = !errors.budgets && monthlyPlan && monthlyPlan.count > 0;
  const report = summary?.report;
  return (
    <FinancePage title="Overview" onRefresh={() => void load()}>
      <ScrollView
        contentContainerStyle={finance.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void load()}
            tintColor={colors.primary}
          />
        }
      >
        {errors.summary || !report || loading ? (
          <LoadState
            loading={loading}
            error={errors.summary}
            empty="Your overview is unavailable."
            onRetry={() => void load()}
          />
        ) : (
          <>
            <LinearGradient
              colors={["#5742DF", "#9144ED", "#7922CD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 28,
                padding: 24,
                marginBottom: 18,
                boxShadow: "0px 9px 22px rgba(99,63,211,0.19)",
              }}
            >
              <Text
                style={{
                  color: "#E3DBFF",
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 1.2,
                }}
              >
                {hasPlan
                  ? "REMAINING MONTHLY BUDGET"
                  : "MONTH-TO-DATE EXPENSES"}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 36,
                  fontWeight: "800",
                  letterSpacing: -1,
                  marginTop: 12,
                }}
              >
                {formatMoney(
                  hasPlan ? monthlyPlan.remaining : report.totalExpenses,
                )}
              </Text>
              <Text
                style={{
                  color: "#E3DBFF",
                  fontSize: 12,
                  marginTop: 8,
                  marginBottom: 22,
                }}
              >
                {new Date().toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
                {hasPlan ? " · budgeted categories" : " · through today"}
              </Text>
              {hasPlan ? (
                <>
                  <View style={finance.row}>
                    <Text style={{ color: "#F0E8FF", fontSize: 12, flex: 1 }}>
                      Spent {formatMoney(monthlyPlan.spent)} of{" "}
                      {formatMoney(monthlyPlan.limit)}
                    </Text>
                    <Text style={{ color: "white", fontWeight: "700" }}>
                      {Math.round(monthlyPlan.percentage)}%
                    </Text>
                  </View>
                  <View style={{ marginTop: 10, marginBottom: 24 }}>
                    <Progress
                      percentage={monthlyPlan.percentage}
                      label="Monthly category budget usage"
                      color="#FFD36A"
                    />
                  </View>
                </>
              ) : (
                <Text
                  style={{ color: "#E3DBFF", fontSize: 13, marginBottom: 20 }}
                >
                  Give your money a plan. Create a monthly budget below.
                </Text>
              )}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 22 }}>
                {[
                  {
                    label: "Income",
                    amount: report.totalIncome,
                    icon: "wallet" as const,
                  },
                  {
                    label: "Expenses",
                    amount: report.totalExpenses,
                    icon: "activity" as const,
                  },
                ].map((item) => (
                  <View
                    key={item.label}
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                      flexGrow: 1,
                    }}
                  >
                    <View
                      style={{
                        padding: 10,
                        backgroundColor: "#FFFFFF20",
                        borderRadius: 14,
                      }}
                    >
                      <Icon name={item.icon} color="#EDE7FF" size={20} />
                    </View>
                    <View>
                      <Text style={{ color: "#D8C9FC", fontSize: 12 }}>
                        {item.label} · to date
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "white",
                          marginTop: 4,
                        }}
                      >
                        {formatMoney(item.amount)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View cashflow insights"
              onPress={() => navigation.navigate("Reports")}
              style={[finance.card, finance.row]}
            >
              <View
                style={{
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: colors.successSoft,
                }}
              >
                <Icon name="insights" color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={finance.caption}>
                  Net cashflow · through today
                </Text>
                <Text
                  style={{
                    color: report.savings >= 0 ? colors.success : colors.danger,
                    fontSize: 20,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  {report.savings >= 0 ? "+" : ""}
                  {formatMoney(report.savings)}
                </Text>
              </View>
              <Icon name="arrow" color={colors.primary} />
            </Pressable>
          </>
        )}
        <SectionHeading
          title="Watchlist budgets"
          action="Manage all"
          onPress={() => navigation.navigate("BudgetList")}
        />
        {errors.budgets || !budgets.length ? (
          <LoadState
            loading={loading}
            error={errors.budgets}
            empty="Set a category limit to start watching your spending."
            onRetry={() => void load()}
          />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {[...budgets]
              .sort((a, b) => b.percentageUsed - a.percentageUsed)
              .slice(0, 2)
              .map((budget) => (
                <BudgetCard
                  key={budget.budgetId}
                  budget={budget}
                  compact
                  onEdit={() =>
                    navigation.navigate("CreateBudget", {
                      budgetId: budget.budgetId,
                    })
                  }
                />
              ))}
          </View>
        )}
        <SectionHeading
          title="Recent activity"
          action={
            "See all" +
            (transactions.length ? " (" + transactions.length + ")" : "")
          }
          onPress={() => navigation.navigate("Activity")}
        />
        {errors.transactions || !transactions.length ? (
          <LoadState
            loading={loading}
            error={errors.transactions}
            empty="No transactions yet. Tap + to make your first entry."
            onRetry={() => void load()}
          />
        ) : (
          transactions
            .slice(0, 3)
            .map((record) => (
              <TransactionRow
                key={record.kind + "-" + record.transaction.id}
                record={record}
                disabled={pending}
                onDelete={() => remove(record)}
                onEdit={() =>
                  record.kind === "income"
                    ? navigation.navigate("AddIncome", {
                        incomeId: record.transaction.id,
                      })
                    : navigation.navigate("AddExpense", {
                        expenseId: record.transaction.id,
                      })
                }
              />
            ))
        )}
        <SectionHeading
          title="Upcoming payments"
          action="View all"
          onPress={() => navigation.navigate("RecurringPayments")}
        />
        {errors.payments || !payments.length ? (
          <LoadState
            loading={loading}
            error={errors.payments}
            empty="Add a recurring bill or subscription to keep its next due date in view."
            onRetry={() => void load()}
          />
        ) : (
          payments.map((payment) => (
            <View style={finance.card} key={payment.id}>
              <View style={finance.row}>
                <Text style={finance.title}>{payment.name}</Text>
                <Text style={finance.title}>{formatMoney(payment.amount)}</Text>
              </View>
              <Text style={[finance.caption, { marginVertical: 10 }]}>
                {
                  getRecurringPaymentStatus(getDaysUntil(payment.nextDueDate))
                    .label
                }{" "}
                · {payment.nextDueDate.toLocaleDateString()}
              </Text>
              <ActionButton
                title="Record payment"
                disabled={pending}
                variant="quiet"
                onPress={() => complete(payment)}
              />
            </View>
          ))
        )}
        <Text style={[finance.caption, { textAlign: "center", marginTop: 12 }]}>
          Your entries. Your money. A clearer picture.
        </Text>
      </ScrollView>
    </FinancePage>
  );
}
