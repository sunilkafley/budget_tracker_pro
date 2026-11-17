import React, { useEffect, useRef, useState } from "react";
import {
  DimensionValue,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRootNavigation } from "../hooks/useRootNavigation";
import { colors } from "../theme";
import { CategoryType } from "../domain/enums/CategoryType";
import { Money } from "../domain/services/Money";
import { BudgetUsage } from "../domain/services/BudgetService";
import { DashboardTransaction } from "../application/useCases/GetDashboardTransactionsUseCase";

export type IconName =
  | "home"
  | "activity"
  | "budget"
  | "insights"
  | "plus"
  | "close"
  | "refresh"
  | "search"
  | "trash"
  | "edit"
  | "arrow"
  | "wallet"
  | "cart"
  | "car"
  | "building"
  | "film"
  | "shield"
  | "fitness"
  | "other"
  | "calendar";
const paths: Record<IconName, string> = {
  home: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
  activity: "M6 3h12v18l-3-2-3 2-3-2-3 2ZM9 7h6M9 11h6M9 15h4",
  budget:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 3v4m-2-2h4",
  insights: "M10 3a9 9 0 1 0 11 11H10Zm4-1v8h8a9 9 0 0 0-8-8Z",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  refresh: "M4 9a8 8 0 1 1 1 9M4 3v6h6",
  search: "M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm5.5 13 5 5",
  trash: "M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7",
  edit: "m4 16 12-12 4 4L8 20H4Zm10-10 4 4",
  arrow: "m9 5 7 7-7 7",
  wallet: "M3 7V4h15v3M3 7h18v14H3Zm12 5h6v5h-6Z",
  cart: "M2 3h3l3 13h11l3-10H6M9 21h.01M18 21h.01",
  car: "m4 10 2-6h12l2 6M3 10h18v8H3Zm3 8v3m12-3v3M6 13h2m8 0h2",
  building:
    "M4 21V7h8v14m0-18h8v18M2 21h20M7 10h2m-2 4h2m-2 4h2m6-12h2m-2 4h2m-2 4h2",
  film: "M4 3h16v18H4Zm4 0v18M16 3v18M4 8h4m-4 8h4m8-8h4m-4 8h4",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6ZM8 12l3 3 5-6",
  fitness: "M3 8v8m4-11v14M7 12h10m0-7v14m4-11v8",
  other: "M4 4h16v16H4Zm4 8h.01m4 0h.01m4 0h.01",
  calendar: "M4 5h16v16H4ZM8 2v6m8-6v6M4 10h16",
};
export function Icon({
  name,
  size = 23,
  color = colors.muted,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={paths[name]} />
    </Svg>
  );
}
export const categoryStyle: Record<
  CategoryType,
  { label: string; icon: IconName; color: string; background: string }
> = {
  HOUSING: {
    label: "Housing",
    icon: "building",
    color: "#8855DB",
    background: "#EEE7FC",
  },
  GROCERY: {
    label: "Groceries",
    icon: "cart",
    color: "#15966D",
    background: "#D9F8EB",
  },
  TRANSPORT: {
    label: "Transport",
    icon: "car",
    color: "#3878D8",
    background: "#E0ECFF",
  },
  FITNESS: {
    label: "Fitness",
    icon: "fitness",
    color: "#CF7D17",
    background: "#FFF0D9",
  },
  INSURANCE: {
    label: "Insurance",
    icon: "shield",
    color: "#1598AD",
    background: "#DBF5FA",
  },
  ENTERTAINMENT: {
    label: "Entertainment",
    icon: "film",
    color: "#D13C8E",
    background: "#FCE6F2",
  },
  INCOME: {
    label: "Income",
    icon: "wallet",
    color: "#15966D",
    background: "#DCF9E9",
  },
  OTHER: {
    label: "Other",
    icon: "other",
    color: "#B67B14",
    background: "#FFF3D6",
  },
};
export function CategoryBadge({
  category,
  size = 48,
}: {
  category: CategoryType;
  size?: number;
}) {
  const item = categoryStyle[category] ?? categoryStyle.OTHER;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size < 40 ? 12 : 16,
        backgroundColor: item.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={item.icon} color={item.color} size={size * 0.5} />
    </View>
  );
}
export function formatMoney(value: number): string {
  try {
    Money.toMinorUnits(value);
    return (
      (value < 0 ? "-" : "") +
      "$" +
      Math.abs(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } catch {
    return "Unavailable";
  }
}
export function IconButton({
  name,
  label,
  onPress,
  disabled = false,
  outlined = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  outlined?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        finance.iconButton,
        outlined && finance.outlinedIconButton,
        (pressed || disabled) && { opacity: 0.45 },
      ]}
    >
      <Icon name={name} size={outlined ? 19 : 18} color={outlined ? colors.muted : colors.subtle} />
    </Pressable>
  );
}
export function FinancePage({
  title,
  onRefresh,
  children,
}: {
  title: string;
  onRefresh: () => void;
  children: React.ReactNode;
}) {
  const navigation = useRootNavigation();
  const [adding, setAdding] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);
  useEffect(() => () => { pendingAction.current = null; }, []);
  const finishQuickAdd = () => {
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  };
  const closeQuickAdd = () => {
    pendingAction.current = null;
    setAdding(false);
  };
  const go = (action: () => void) => {
    if (pendingAction.current) return;
    pendingAction.current = action;
    setAdding(false);
    // UIKit cannot present the destination while this native Modal is closing.
    // onDismiss is iOS-only, so Android dispatches without waiting for it.
    if (Platform.OS !== "ios") finishQuickAdd();
  };
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={finance.page}>
      <View style={finance.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
            <Text style={finance.brand}>BUDGET TRACKER PRO</Text>
          </View>
          <Text accessibilityRole="header" style={finance.heading}>
            {title}
          </Text>
        </View>
        <IconButton
          name="refresh"
          outlined
          label="Refresh this screen"
          onPress={onRefresh}
        />
        <IconButton
          name="calendar"
          outlined
          label="Recurring payments"
          onPress={() => navigation.navigate("RecurringPayments")}
        />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction or budget"
        accessibilityHint="Choose a budget, income, expense or recurring payment."
        onPress={() => { if (!pendingAction.current) setAdding(true); }}
        style={({ pressed }) => [finance.fab, pressed && { opacity: 0.8 }]}
      >
        <Icon name="plus" size={32} color="white" />
      </Pressable>
      <Modal
        visible={adding}
        transparent
        animationType="slide"
        onRequestClose={closeQuickAdd}
        onDismiss={finishQuickAdd}
      >
        <Pressable
          accessibilityLabel="Close quick add"
          style={finance.backdrop}
          onPress={closeQuickAdd}
        />
        <SafeAreaView edges={["bottom"]} style={finance.sheet}>
          <View style={finance.row}>
            <Text style={finance.section}>Make a new entry</Text>
            <IconButton
              name="close"
              label="Close quick add"
              onPress={closeQuickAdd}
            />
          </View>
          {(
            [
              {
                label: "Create budget",
                icon: "budget",
                action: () => navigation.navigate("CreateBudget"),
              },
              {
                label: "Add income",
                icon: "wallet",
                action: () => navigation.navigate("AddIncome"),
              },
              {
                label: "Add expense",
                icon: "activity",
                action: () => navigation.navigate("AddExpense"),
              },
              {
                label: "Recurring payment",
                icon: "calendar",
                action: () => navigation.navigate("CreateRecurringPayment", {}),
              },
            ] as const
          ).map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.label}
              style={finance.sheetAction}
              onPress={() => go(item.action)}
            >
              <Icon name={item.icon} color={colors.primary} />
              <Text style={finance.title}>{item.label}</Text>
              <Icon name="arrow" />
            </Pressable>
          ))}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
export function Progress({
  percentage,
  label,
  color = colors.successFill,
}: {
  percentage: number;
  label: string;
  color?: string;
}) {
  const value = Math.max(
    0,
    Math.min(100, Number.isFinite(percentage) ? percentage : 0),
  );
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: value,
        text: Math.round(percentage) + "% used",
      }}
      style={finance.progress}
    >
      <View
        style={{
          height: "100%",
          width: (value + "%") as DimensionValue,
          borderRadius: 8,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
export function BudgetCard({
  budget, compact = false, onEdit, onDelete, disabled = false,
}: {
  budget: BudgetUsage; compact?: boolean; onEdit: () => void;
  onDelete?: () => void; disabled?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  const status = budget.isOverBudget ? "Over limit" : budget.percentageUsed >= 90 ? "Near limit" : "";
  const tone = budget.isOverBudget ? colors.danger : status ? colors.warning : colors.success;
  const fill = budget.isOverBudget ? colors.danger : status ? colors.warningFill : colors.successFill;
  const periodLabel = `${budget.frequency.toLowerCase()} · ${budget.periodStart.toLocaleDateString()} to ${new Date(budget.periodEnd.getTime() - 1).toLocaleDateString()}`;
  if (compact) {
    return <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${budget.category.name} budget. ${periodLabel}. ${formatMoney(budget.spentAmount)} spent of ${formatMoney(budget.budgetAmount)}.`}
      disabled={disabled} onPress={onEdit} style={({ pressed }) => [finance.card, finance.watchCard, (pressed || disabled) && { opacity: 0.65 }]}>
      <View style={finance.row}>
        <CategoryBadge category={budget.category.type} size={34} />
        <Text style={{ color: tone, fontSize: 13, fontWeight: "700" }}>{Math.round(budget.percentageUsed)}%</Text>
      </View>
      <Text style={finance.watchTitle}>{budget.category.name}</Text>
      <Text style={[finance.caption, { marginBottom: 9 }]}>{formatMoney(budget.spentAmount)} / {formatMoney(budget.budgetAmount)}</Text>
      <Progress percentage={budget.percentageUsed} label={budget.category.name + " spending"} color={fill} />
      {budget.frequency !== "MONTHLY" && <Text style={[finance.caption, { marginTop: 6 }]}>{budget.frequency.toLowerCase()}</Text>}
    </Pressable>;
  }
  return <View style={[finance.card, finance.budgetCard, !!status && { borderColor: budget.isOverBudget ? "#F4BFC9" : "#F2D76D", backgroundColor: budget.isOverBudget ? "#FFFCFD" : "#FFFEF9" }]}>
    <View style={[finance.row, fontScale > 1.3 && { flexWrap: "wrap" }]}>
      <CategoryBadge category={budget.category.type} size={44} />
      <View style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <Text style={finance.title}>{budget.category.name}</Text>
          {!!status && <Text style={[finance.statusBadge, { color: tone, backgroundColor: budget.isOverBudget ? colors.dangerSoft : "#FCEDD0" }]}>{status}</Text>}
        </View>
        <Text style={[finance.caption, { marginTop: 3 }]}>{formatMoney(budget.spentAmount)} spent of {formatMoney(budget.budgetAmount)}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={"Edit " + budget.category.name + " budget cap"}
        disabled={disabled} onPress={onEdit} style={finance.capTouch}>
        <View style={finance.capPill}><Icon name="edit" size={13} color={colors.muted} /><Text style={finance.capText}>Cap</Text></View>
      </Pressable>
    </View>
    <View style={{ marginTop: 14 }}><Progress percentage={budget.percentageUsed} label={budget.category.name + " spending"} color={fill} /></View>
    <View style={[finance.row, { minHeight: onDelete ? 40 : 24, marginTop: 4, flexWrap: "wrap" }]}>
      <Text style={{ color: tone, fontSize: 12 }}>{Math.round(budget.percentageUsed)}% utilized</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Text style={finance.caption}>{formatMoney(Math.abs(budget.remainingAmount))} {budget.isOverBudget ? "over" : "left"}</Text>
        {onDelete && <IconButton name="trash" label={"Delete " + budget.category.name + " budget"} disabled={disabled} onPress={onDelete} />}
      </View>
    </View>
    {budget.frequency !== "MONTHLY" && <Text style={finance.caption}>{periodLabel}</Text>}
  </View>;
}

export function TransactionRow({ record, onEdit, onDelete, disabled = false }: {
  record: DashboardTransaction; onEdit: () => void; onDelete: () => void; disabled?: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const amount = `${record.kind === "income" ? "+" : "−"}${formatMoney(record.transaction.amount)}`;
  // Keep full amounts readable instead of clipping them at large text sizes.
  const stacked = fontScale > 1.3 || (width < 380 && amount.length > 10) || amount.length > 15;
  return <View style={[finance.card, finance.transaction]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${record.transaction.title}, ${amount}`}
      accessibilityState={{ disabled }} disabled={disabled} onPress={onEdit} style={finance.transactionBody}>
      <CategoryBadge category={record.kind === "income" ? CategoryType.INCOME : record.transaction.category.type} size={44} />
      <View style={finance.transactionCopy}>
        <Text numberOfLines={stacked ? undefined : 1} style={finance.transactionTitle}>{record.transaction.title}</Text>
        <Text numberOfLines={stacked ? undefined : 1} style={finance.caption}>
          {record.kind === "income" ? "Income" : record.transaction.category.name} · {record.transaction.transactionDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </Text>
        {stacked && <Text style={[finance.transactionAmount, { color: record.kind === "income" ? colors.success : colors.text, marginTop: 5 }]}>{amount}</Text>}
      </View>
      {!stacked && <Text style={[finance.transactionAmount, { color: record.kind === "income" ? colors.success : colors.text }]}>{amount}</Text>}
    </Pressable>
    <IconButton name="trash" label={"Delete " + record.transaction.title} disabled={disabled} onPress={onDelete} />
  </View>;
}
export const finance = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  brand: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: colors.text,
  },
  section: { fontSize: 19, fontWeight: "700", color: colors.text },
  title: { fontSize: 15, fontWeight: "700", color: colors.text },
  caption: { fontSize: 12, color: colors.muted, lineHeight: 19 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 96,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    boxShadow: "0px 2px 3px rgba(21,28,52,0.025)",
  },
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 4,
    borderRadius: 20,
    minHeight: 74,
    marginBottom: 12,
  },
  transactionBody: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  transactionCopy: { flex: 1, minWidth: 0, gap: 3 },
  transactionTitle: { fontSize: 15, fontWeight: "500", color: colors.text },
  transactionAmount: { fontSize: 14, fontWeight: "700", flexShrink: 0 },
  budgetCard: { borderRadius: 26, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 9 },
  watchCard: { flex: 1, minWidth: 140, padding: 16, borderRadius: 20, marginBottom: 0 },
  watchTitle: { fontSize: 14, color: colors.text, marginTop: 10, marginBottom: 3 },
  statusBadge: { fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  capTouch: { minWidth: 64, minHeight: 44, justifyContent: "center", alignItems: "center" },
  capPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#F1F4F8", borderRadius: 18 },
  capText: { fontSize: 12, color: "#526075" },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  outlinedIconButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  fab: {
    position: "absolute",
    zIndex: 10,
    bottom: 12,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 7px 18px rgba(101,84,223,0.3)",
  },
  progress: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#F0F2F8",
    overflow: "hidden",
  },
  backdrop: { flex: 1, backgroundColor: "#171C2D66" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 64,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
});
