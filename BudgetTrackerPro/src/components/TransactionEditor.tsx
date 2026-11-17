import { CategoryBadge } from "./FinanceUI";
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
  View,
} from "react-native";
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
};

export function TransactionEditor({
  kind,
  transactionId,
  onSaved,
  onSwitchKind,
}: Props) {
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
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.eyebrow}>
          {kind === "income" ? "MONEY IN" : "MONEY OUT"}
        </Text>
        <Text style={styles.heading}>
          {editing ? "Edit" : "Add"} {kind}
        </Text>
        <Text style={styles.subtitle}>
          {editing
            ? "Update the details. Make every detail count."
            : "A small entry. A clearer picture of your money."}
        </Text>
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
                    accessibilityRole="button"
                    accessibilityState={{ selected: kind === value }}
                    onPress={() => {
                      if (kind !== value) onSwitchKind();
                    }}
                    style={[styles.kind, kind === value && styles.activeKind]}
                  >
                    <Text
                      style={{
                        color: kind === value ? colors.primary : colors.muted,
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
                autoFocus={!editing}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#8795A8"
                style={styles.amount}
                editable={!saving}
              />
            </View>
            <Text style={styles.label}>Title</Text>
            <TextInput
              accessibilityLabel="Title"
              value={title}
              onChangeText={setTitle}
              placeholder={
                kind === "income"
                  ? "e.g. Monthly salary"
                  : "e.g. Weekly groceries"
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
            <Text style={styles.label}>Date</Text>
            <TextInput
              accessibilityLabel="Transaction date, YYYY-MM-DD"
              value={dateText}
              onChangeText={setDateText}
              placeholder="YYYY-MM-DD"
              style={styles.input}
              editable={!saving}
              autoCapitalize="none"
            />
            <Text style={styles.label}>
              Notes <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              accessibilityLabel="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything you want to remember"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.notes]}
              editable={!saving}
            />
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
                    : `Add ${kind}`}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 24,
    paddingBottom: 48,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  heading: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kindRow: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 5,
    marginBottom: 24,
  },
  kind: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  activeKind: { backgroundColor: colors.primarySoft },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.input,
    marginBottom: 24,
  },
  currency: { fontSize: 30, color: colors.primary, marginRight: 8 },
  amount: {
    flex: 1,
    fontSize: 36,
    color: colors.text,
    fontWeight: "600",
    minHeight: 64,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 22,
    minHeight: 50,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  category: {
    minHeight: 92,
    width: "30%",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 5,
    paddingVertical: 12,
  },
  selectedCategory: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  categoryText: { color: colors.muted, fontSize: 11, textAlign: "center" },
  selectedText: { color: colors.primaryDark, fontWeight: "600" },
  optional: { color: colors.subtle, fontWeight: "400" },
  notes: { minHeight: 96 },
  hint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
