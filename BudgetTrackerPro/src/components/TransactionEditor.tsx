import { CategoryBadge, Icon, IconButton } from "./FinanceUI";
import {
  formatRecurringDate,
  parseRecurringDate,
} from "../utils/recurringDateInput";
import { colors } from "../theme";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRepositories } from "../context/RepositoryContext";
import { Income } from "../domain/models/Income";
import { Expense } from "../domain/models/Expense";
import { Category } from "../domain/models/Category";
import { CategoryType } from "../domain/enums/CategoryType";
import { Money } from "../domain/services/Money";

const labels: Record<CategoryType, string> = {
  HOUSING: "Housing",
  GROCERY: "Groceries",
  TRANSPORT: "Transport",
  FITNESS: "Fitness",
  INSURANCE: "Insurance",
  ENTERTAINMENT: "Entertainment",
  INCOME: "Income",
  OTHER: "Other",
};
const expenseCategories = Object.values(CategoryType).filter(
  (value) => value !== CategoryType.INCOME,
);
type Props = {
  kind: "income" | "expense";
  transactionId?: string;
  onSaved: () => void;
  onSwitchKind?: () => void;
  onClose: () => void;
};

export function TransactionEditor({
  kind,
  transactionId,
  onSaved,
  onSwitchKind,
  onClose,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const categoryWidth = fontScale > 1.3 ? "47%" : width < 350 ? "30%" : "23%";
  const {
    getIncomeByIdUseCase,
    getExpenseByIdUseCase,
    addIncomeUseCase,
    addExpenseUseCase,
    updateIncomeUseCase,
    updateExpenseUseCase,
  } = useRepositories();
  const editing = transactionId !== undefined;
  const [loaded, setLoaded] = useState<Income | Expense | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dateText, setDateText] = useState(() =>
    formatRecurringDate(new Date()),
  );
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [category, setCategory] = useState<CategoryType>(CategoryType.GROCERY);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const saveInProgress = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(null);
    setLoadError(null);
    setSaveError(null);
    setTitle("");
    setAmount("");
    setSource("");
    setNotes("");
    setShowNotes(false);
    setCategory(CategoryType.GROCERY);
    if (transactionId === undefined) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const load = async () => {
      try {
        const record =
          kind === "income"
            ? await getIncomeByIdUseCase.execute(transactionId)
            : await getExpenseByIdUseCase.execute(transactionId);
        if (cancelled) return;
        setDateText(formatRecurringDate(record.transactionDate));
        setLoaded(record);
        setTitle(record.title);
        setAmount(String(record.amount));
        setNotes(record.notes ?? "");
        setShowNotes(Boolean(record.notes));
        if (record instanceof Income) setSource(record.source);
        if (record instanceof Expense) setCategory(record.category.type);
      } catch (error) {
        if (!cancelled)
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load transaction.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    transactionId,
    kind,
    loadVersion,
    getIncomeByIdUseCase,
    getExpenseByIdUseCase,
  ]);

  const save = async () => {
    if (saveInProgress.current || loading || loadError || (editing && !loaded))
      return;
    saveInProgress.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      if (!title.trim()) throw new Error("Please enter a transaction title.");
      const value = Money.parseInput(amount);
      const id = transactionId ?? Date.now().toString();
      const date =
        loaded && dateText === formatRecurringDate(loaded.transactionDate)
          ? loaded.transactionDate
          : parseRecurringDate(dateText);
      if (kind === "income") {
        const income = new Income(
          id,
          title.trim(),
          value,
          date,
          source.trim(),
          notes,
        );
        await (editing
          ? updateIncomeUseCase.execute(income)
          : addIncomeUseCase.execute(income));
      } else {
        // Keep legacy/custom category IDs unless the user changes category type.
        const selected =
          loaded instanceof Expense && loaded.category.type === category
            ? loaded.category
            : new Category(category, labels[category], category);
        const expense = new Expense(
          id,
          title.trim(),
          value,
          date,
          selected,
          notes,
        );
        await (editing
          ? updateExpenseUseCase.execute(expense)
          : addExpenseUseCase.execute(expense));
      }
      onSaved();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save transaction.",
      );
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom) }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.heading}>{editing ? "Edit transaction" : "New transaction"}</Text>
          <IconButton name="close" label="Close transaction" disabled={saving} onPress={onClose} />
        </View>
        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator accessibilityLabel="Loading transaction" />
            <Text style={styles.hint}>Loading your transaction...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <Text style={styles.error}>{loadError}</Text>
            <Text style={styles.hint}>
              Go back or try loading again. Your transaction has not been
              changed.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={() => setLoadVersion((version) => version + 1)}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            {!editing && onSwitchKind && (
              <View style={styles.kindRow}>
                {(["expense", "income"] as const).map((value) => (
                  <Pressable
                    key={value}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityState={{ selected: kind === value, disabled: saving }}
                    disabled={saving}
                    onPress={() => {
                      if (kind !== value) onSwitchKind();
                    }}
                    style={[styles.kind, kind === value && { backgroundColor: kind === "expense" ? "#DF4D65" : colors.success }]}
                  >
                    <Text
                      style={{
                        color: kind === value ? "white" : "#526075",
                        fontWeight: "600",
                      }}
                    >
                      {value === "expense" ? "Expense" : "Income"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                accessibilityLabel="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#8795A8"
                style={styles.amount}
                editable={!saving}
              />
            </View>
            <Text style={styles.label}>Title / Merchant</Text>
            <TextInput
              accessibilityLabel="Title"
              value={title}
              onChangeText={setTitle}
              placeholder={
                kind === "income"
                  ? "e.g. Monthly salary"
                  : "e.g. Blue Bottle Coffee, Whole Foods"
              }
              style={styles.input}
              editable={!saving}
            />
            {kind === "income" ? (
              <>
                <Text style={styles.label}>Source</Text>
                <TextInput
                  accessibilityLabel="Income source"
                  value={source}
                  onChangeText={setSource}
                  placeholder="e.g. Employer or freelance work"
                  style={styles.input}
                  editable={!saving}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categories}>
                  {expenseCategories.map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityLabel={labels[value]}
                      accessibilityState={{
                        selected: category === value,
                        disabled: saving,
                      }}
                      disabled={saving}
                      onPress={() => setCategory(value)}
                      style={[
                        styles.category,
                        { width: categoryWidth },
                        category === value && styles.selectedCategory,
                      ]}
                    >
                      <CategoryBadge category={value} size={38} />
                      <Text
                        style={[
                          styles.categoryText,
                          category === value && styles.selectedText,
                        ]}
                      >
                        {labels[value]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            <View style={styles.dateLabelRow}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Date</Text>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: showNotes }} onPress={() => setShowNotes(!showNotes)} style={styles.notesToggle}>
                <Text style={styles.hint}>{showNotes ? "Hide note" : "+ Add note"}</Text>
              </Pressable>
            </View>
            <View style={styles.dateRow}>
              <Icon name="calendar" size={18} color={colors.subtle} />
              <TextInput
                accessibilityLabel="Transaction date, YYYY-MM-DD"
                value={dateText}
                onChangeText={setDateText}
                placeholder="YYYY-MM-DD"
                style={styles.dateInput}
                editable={!saving}
                autoCapitalize="none"
              />
            </View>
            {showNotes && <TextInput
              accessibilityLabel="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything you want to remember"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.notes, { marginTop: 12 }]}
              editable={!saving}
            />}
            {loaded && (
              <Text style={styles.hint}>
                Originally recorded{" "}
                {loaded.transactionDate.toLocaleDateString()}. Keep the date or
                choose another.
              </Text>
            )}
            {saveError && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {saveError}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={save}
              style={[styles.button, saving && styles.disabled]}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : `Save ${kind === "income" ? "Income" : "Expense"}`}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 22, paddingTop: 12, width: "100%", maxWidth: 600, alignSelf: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 },
  heading: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5, flex: 1 },
  card: { backgroundColor: colors.surface },
  kindRow: { flexDirection: "row", gap: 4, backgroundColor: "#F1F4F8", borderRadius: 16, padding: 4, marginBottom: 20 },
  kind: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: 13 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600", marginBottom: 7 },
  amountRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 18, paddingHorizontal: 16, backgroundColor: colors.input, marginBottom: 18 },
  currency: { fontSize: 26, color: colors.subtle, marginRight: 8, fontWeight: "700" },
  amount: { flex: 1, fontSize: 30, color: colors.text, fontWeight: "700", minHeight: 64, paddingVertical: 10 },
  input: { borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.input, borderRadius: 16, padding: 14, fontSize: 14, color: colors.text, marginBottom: 18, minHeight: 50 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  category: { minHeight: 78, minWidth: 60, alignItems: "center", gap: 6, justifyContent: "center", borderRadius: 17, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.input, paddingHorizontal: 3, paddingVertical: 9 },
  selectedCategory: { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 2 },
  categoryText: { color: colors.text, fontSize: 11, textAlign: "center" },
  selectedText: { color: colors.text },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.input, borderRadius: 16, paddingHorizontal: 14, minHeight: 50 },
  dateInput: { flex: 1, minHeight: 50, color: colors.text, fontSize: 14, paddingVertical: 12 },
  notesToggle: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  dateLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notes: { minHeight: 80 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  button: { minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: colors.primaryDark, marginTop: 16, boxShadow: "0px 6px 12px rgba(99,74,224,0.22)" },
  buttonText: { color: colors.surface, fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.6 },
});
