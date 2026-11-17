import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Report } from "../domain/models/Report";
import { summarizeMonthlyBudgets } from "../domain/services/MonthlyBudgetSummary";
import { formatMoney, Icon, Progress } from "./FinanceUI";

type Props = {
  report: Report;
  monthlyPlan: ReturnType<typeof summarizeMonthlyBudgets> | null;
};

export function OverviewCard({ report, monthlyPlan }: Props) {
  const hasPlan = monthlyPlan !== null && monthlyPlan.count > 0;
  return <LinearGradient colors={["#5343E9", "#7945EE", "#7924CD"]}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
    <Text style={styles.eyebrow}>{hasPlan ? "REMAINING MONTHLY BUDGET" : "MONTH-TO-DATE EXPENSES"}</Text>
    <View style={styles.balanceRow}>
      <Text style={styles.balance}>{formatMoney(hasPlan ? monthlyPlan.remaining : report.totalExpenses)}</Text>
      <View style={styles.monthPill}><Text style={styles.month}>{new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" })}</Text></View>
    </View>
    {hasPlan ? <>
      <View style={styles.usageRow}>
        <Text style={styles.spent}>Spent {formatMoney(monthlyPlan.spent)} of {formatMoney(monthlyPlan.limit)}</Text>
        <Text style={styles.percentage}>{Math.round(monthlyPlan.percentage)}%</Text>
      </View>
      <Progress percentage={monthlyPlan.percentage} label="Monthly budgeted category spending" color="#E6E75A" />
      <Text style={styles.scope}>Budgeted categories · current calendar month</Text>
    </> : <Text style={styles.noPlan}>Create a monthly category budget to start a spending plan.</Text>}
    <View style={styles.metrics}>
      {([{ label: "Income", amount: report.totalIncome, icon: "wallet" },
        { label: "Expenses", amount: report.totalExpenses, icon: "activity" }] as const).map((item) =>
        <View key={item.label} style={styles.metric}>
          <View style={styles.metricIcon}><Icon name={item.icon} color="#E8DBFF" size={18} /></View>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.metricLabel}>{item.label} · to date</Text>
            <Text style={styles.metricValue}>{formatMoney(item.amount)}</Text>
          </View>
        </View>)}
    </View>
  </LinearGradient>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 22, marginBottom: 22, boxShadow: "0px 12px 22px rgba(90,62,210,0.19)" },
  eyebrow: { color: "#E5DFFF", fontSize: 11, fontWeight: "700", letterSpacing: 0.9 },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 7, marginBottom: 22 },
  balance: { color: "white", fontSize: 34, fontWeight: "800", letterSpacing: -0.8, flexShrink: 1 },
  monthPill: { backgroundColor: "#FFFFFF24", borderRadius: 18, paddingVertical: 6, paddingHorizontal: 10 },
  month: { color: "white", fontSize: 11, fontWeight: "700" },
  usageRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 },
  spent: { color: "#E5DFFF", fontSize: 12, fontWeight: "600", flex: 1 },
  percentage: { color: "white", fontSize: 12, fontWeight: "700" },
  scope: { color: "#E5DFFF", fontSize: 10, marginTop: 6 },
  noPlan: { color: "#E5DFFF", fontSize: 12, lineHeight: 18, marginBottom: 8 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 22 },
  metric: { flexDirection: "row", alignItems: "center", gap: 9, flex: 1, minWidth: 125 },
  metricIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: "#FFFFFF22", alignItems: "center", justifyContent: "center" },
  metricLabel: { color: "#E5DFFF", fontSize: 11, marginBottom: 4 },
  metricValue: { color: "white", fontSize: 16, fontWeight: "700" },
});
