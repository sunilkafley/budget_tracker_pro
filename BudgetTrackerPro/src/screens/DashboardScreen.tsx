import React, { useCallback, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useRepositories } from "../context/RepositoryContext";
import { useDashboard } from "../hooks/useDashboard";
import { ActionButton, Card, LoadState, SectionHeading, ui } from "../components/AppUI";
import { colors, radii, spacing } from "../theme";
import { DashboardTransaction } from "../application/useCases/GetDashboardTransactionsUseCase";
import { RecurringPayment } from "../domain/models/RecurringPayment";
import { Money } from "../domain/services/Money";
import { getDaysUntil } from "../utils/dateUtils";
import { getRecurringPaymentStatus } from "../utils/recurringPaymentStatusUtils";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;
function money(amount: number): string {
  try {
    Money.toMinorUnits(amount);
    return `${amount < 0 ? "-" : ""}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch { return "Unavailable"; }
}

export function DashboardScreen({ navigation }: Props) {
  const { summary, transactions, budgets, payments, errors, loading, load, cancel } = useDashboard();
  const { deleteIncomeUseCase, deleteExpenseUseCase, completeRecurringPaymentUseCase } = useRepositories();
  const [showAll, setShowAll] = useState(false);
  const [pending, setPending] = useState(false);
  const mutationPending = useRef(false);

  useFocusEffect(useCallback(() => { void load(); return cancel; }, [load, cancel]));

  const mutate = async (operation: () => Promise<void>, success?: string) => {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setPending(true);
    try {
      await operation();
      await load();
      if (success) Alert.alert("Payment recorded", success);
    } catch (error) {
      Alert.alert("Unable to save change", error instanceof Error ? error.message : "Please try again.");
    } finally { mutationPending.current = false; setPending(false); }
  };

  const remove = (record: DashboardTransaction) => {
    Alert.alert("Delete transaction?", `Remove ${record.transaction.title}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void mutate(() => record.kind === "income"
        ? deleteIncomeUseCase.execute(record.transaction.id) : deleteExpenseUseCase.execute(record.transaction.id)) },
    ]);
  };
  const complete = (payment: RecurringPayment) => {
    Alert.alert("Record payment?", `${payment.name} · ${money(payment.amount)}\nThis creates an expense and advances its due date.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => void mutate(() => completeRecurringPaymentUseCase.execute(payment.id, payment.nextDueDate), "Expense added and next due date updated.") },
    ]);
  };
  const retry = () => { void load(); };
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading && summary !== null} onRefresh={retry} tintColor={colors.primary} />}>
      <View style={styles.brandRow}><Text style={styles.brand}>BUDGET TRACKER PRO</Text><Text style={styles.badge}>Your overview</Text></View>
      <Text accessibilityRole="header" style={styles.heading}>Your money,{"\n"}at a glance.</Text>
      <Text style={styles.subtitle}>A clearer view of the money you track.</Text>

      {errors.summary || !summary ? <LoadState loading={loading} error={errors.summary} empty="Your summary is unavailable." onRetry={retry} /> : (
        <>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Tracked balance</Text>
            <Text style={styles.balance}>{money(summary.savings)}</Text>
            <Text style={styles.balanceHint}>All recorded income minus expenses</Text>
            <View style={styles.balanceRule} />
            <Text style={styles.balanceFootnote}>All time · updated from your entries</Text>
          </View>
          <View style={styles.metrics}>
            <View style={styles.metric}><Text style={styles.metricLabel}>Income · all time</Text><Text style={[styles.metricValue, styles.positive]}>{money(summary.totalIncome)}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Expenses · all time</Text><Text style={styles.metricValue}>{money(summary.totalExpenses)}</Text></View>
          </View>
        </>
      )}

      <View style={styles.quickActions}>
        <View style={styles.flex}><ActionButton title="+ Add income" onPress={() => navigation.navigate("AddIncome")} /></View>
        <View style={styles.flex}><ActionButton title="− Add expense" onPress={() => navigation.navigate("AddExpense")} variant="quiet" /></View>
      </View>

      <SectionHeading title="Recent transactions" action={transactions.length > 5 ? (showAll ? "Show recent" : `Show all (${transactions.length})`) : undefined} onPress={() => setShowAll(!showAll)} />
      {errors.transactions || transactions.length === 0 ? <LoadState loading={loading} error={errors.transactions} empty="No transactions yet. Add your first income or expense above." onRetry={retry} /> :
        visibleTransactions.map((record) => {
          const transaction = record.transaction;
          return <Card key={`${record.kind}-${transaction.id}`}>
            <View style={styles.transactionTop}>
              <View style={[styles.transactionIcon, record.kind === "expense" && styles.expenseIcon]}><Text style={[styles.iconText, record.kind === "expense" && styles.negative]}>{record.kind === "income" ? "+" : "−"}</Text></View>
              <View style={styles.flex}><Text style={styles.title}>{transaction.title}</Text><Text style={styles.caption}>{record.kind === "expense" ? record.transaction.category.name : record.transaction.source || "Income"} · {transaction.transactionDate.toLocaleDateString()}</Text></View>
            </View>
            <Text style={[styles.transactionAmount, record.kind === "income" && styles.positive]}>{record.kind === "income" ? "+" : "−"}{money(transaction.amount)}</Text>
            <View style={styles.actions}>
              <ActionButton title="Edit" label={`Edit ${transaction.title}`} disabled={pending} variant="quiet" onPress={() => record.kind === "income"
                ? navigation.navigate("AddIncome", { incomeId: transaction.id }) : navigation.navigate("AddExpense", { expenseId: transaction.id })} />
              <ActionButton title="Delete" label={`Delete ${transaction.title}`} disabled={pending} variant="danger" onPress={() => remove(record)} />
            </View>
          </Card>;
        })}

      <SectionHeading title="Budget overview" action="Manage" onPress={() => navigation.navigate("BudgetList")} />
      <Text style={styles.sectionNote}>Category spending in each budget's current calendar period. Weeks start Monday.</Text>
      {errors.budgets || budgets.length === 0 ? <LoadState loading={loading} error={errors.budgets} empty="Give your spending a plan. Create a category budget to get started." onRetry={retry} /> : budgets.map((budget) => {
        const over = budget.remainingAmount < 0;
        const progress = Number.isFinite(budget.percentageUsed) ? Math.max(0, Math.min(100, budget.percentageUsed)) : 0;
        return <Card key={budget.budgetId}>
          <View style={styles.spread}><Text style={styles.title}>{budget.category.name}</Text><Text style={[styles.budgetStatus, over && styles.negative]}>{over ? "Over limit" : "Within limit"}</Text></View>
          <Text style={styles.caption}>{budget.frequency} · {budget.periodStart.toLocaleDateString()} to {new Date(budget.periodEnd.getTime() - 1).toLocaleDateString()}</Text>
          <Text style={styles.budgetValue}>{money(budget.spentAmount)} <Text style={styles.caption}>of {money(budget.budgetAmount)}</Text></Text>
          <View accessible accessibilityRole="progressbar" accessibilityLabel={`${budget.category.name} budget usage`} accessibilityValue={{ min: 0, max: 100, now: progress, text: `${budget.percentageUsed}% used` }} style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }, over && styles.overFill]} />
          </View>
          <Text style={[styles.caption, over && styles.negative]}>{over ? `${money(Math.abs(budget.remainingAmount))} over limit` : `${money(budget.remainingAmount)} remaining`} · {budget.percentageUsed}% used</Text>
        </Card>;
      })}
      <ActionButton title="+ Create budget" variant="quiet" onPress={() => navigation.navigate("CreateBudget")} />

      <SectionHeading title="Upcoming payments" action="View all" onPress={() => navigation.navigate("RecurringPayments")} />
      {errors.payments || payments.length === 0 ? <LoadState loading={loading} error={errors.payments} empty="No recurring payments. Add bills or subscriptions to see them here." onRetry={retry} /> : payments.map((payment) => {
        const status = getRecurringPaymentStatus(getDaysUntil(payment.nextDueDate));
        return <Card key={payment.id}>
          <View style={styles.spread}><Text style={styles.title}>{payment.name}</Text><Text style={styles.paymentAmount}>{money(payment.amount)}</Text></View>
          <Text style={[styles.paymentStatus, status.status === "OVERDUE" && styles.negative]}>{status.label}</Text>
          <Text style={styles.caption}>{payment.nextDueDate.toLocaleDateString()} · {payment.frequency.toLowerCase()}</Text>
          <View style={styles.paymentAction}><ActionButton title={pending ? "Please wait..." : "Record payment"} label={`Record payment for ${payment.name}`} disabled={pending} variant="quiet" onPress={() => complete(payment)} /></View>
        </Card>;
      })}

      <SectionHeading title="Explore your finances" />
      <View style={styles.explore}>
        <View style={styles.flex}><ActionButton title="Reports" variant="quiet" onPress={() => navigation.navigate("Reports")} /></View>
        <View style={styles.flex}><ActionButton title="Recurring payments" variant="quiet" onPress={() => navigation.navigate("RecurringPayments")} /></View>
      </View>
      <Text style={styles.footer}>Pull down to refresh your overview.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.large, paddingBottom: 48, width: "100%", maxWidth: 720, alignSelf: "center" },
  brandRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 20 },
  brand: { color: colors.primaryDark, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  badge: { color: colors.muted, fontSize: 12, padding: 8, backgroundColor: colors.surface, borderRadius: 10 },
  heading: { color: colors.text, fontSize: 32, lineHeight: 39, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginBottom: 24 },
  balanceCard: { padding: 24, borderRadius: 24, backgroundColor: colors.hero, marginBottom: 14 },
  balanceLabel: { color: "#C0DAD9", fontSize: 14, marginBottom: 12 },
  balance: { color: colors.surface, fontSize: 36, fontWeight: "700", marginBottom: 12 },
  balanceHint: { color: "#D4E4E6", fontSize: 13, lineHeight: 20 },
  balanceRule: { height: 1, backgroundColor: "#37515C", marginVertical: 18 },
  balanceFootnote: { color: "#C0DAD9", fontSize: 12, lineHeight: 18 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  metric: { flexGrow: 1, flexBasis: 130, backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: 16 },
  metricLabel: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  metricValue: { color: colors.text, fontSize: 22, fontWeight: "700" },
  positive: { color: colors.primaryDark }, negative: { color: colors.danger },
  quickActions: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  flex: { flexGrow: 1, flexShrink: 1, flexBasis: 120 },
  transactionTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  transactionIcon: { width: 44, minHeight: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  expenseIcon: { backgroundColor: colors.dangerSoft }, iconText: { color: colors.primaryDark, fontSize: 25 },
  title: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: "600", flexShrink: 1 },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  transactionAmount: { color: colors.text, fontSize: 21, fontWeight: "600", marginVertical: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionNote: { ...ui.body, marginBottom: 14 },
  spread: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "center" },
  budgetStatus: { color: colors.primaryDark, fontSize: 12, fontWeight: "600" },
  budgetValue: { color: colors.text, fontSize: 21, fontWeight: "600", marginTop: 16, marginBottom: 12 },
  progressTrack: { height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 }, overFill: { backgroundColor: colors.danger },
  paymentAmount: { color: colors.text, fontSize: 18, fontWeight: "600" },
  paymentStatus: { color: colors.primaryDark, fontSize: 14, marginTop: 12, marginBottom: 4 }, paymentAction: { marginTop: 14 },
  explore: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  footer: { color: colors.subtle, textAlign: "center", fontSize: 12, marginTop: 32 },
});
