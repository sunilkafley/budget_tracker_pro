import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Budget } from "../domain/models/Budget";
import { Category } from "../domain/models/Category";
import { CategoryType } from "../domain/enums/CategoryType";
import { Frequency } from "../domain/enums/Frequency";
import { Money } from "../domain/services/Money";
import { useRepositories } from "../context/RepositoryContext";
import { ActionButton, Card, LoadState, ui } from "../components/AppUI";
import { colors, radii } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CreateBudget">;
const frequencyLabels: Record<Frequency, string> = { WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" };

export default function CreateBudgetScreen({ navigation, route }: Props) {
  const { getBudgetByIdUseCase, createBudgetUseCase, updateBudgetUseCase } = useRepositories();
  const budgetId = route.params?.budgetId;
  const editing = budgetId !== undefined;
  const [loaded, setLoaded] = useState<Budget | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CategoryType.GROCERY);
  const [frequency, setFrequency] = useState(Frequency.MONTHLY);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const pending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(null); setLoadError(undefined); setSaveError(undefined);
    setAmount(""); setCategory(CategoryType.GROCERY); setFrequency(Frequency.MONTHLY);
    if (budgetId === undefined) { setLoading(false); return; }
    setLoading(true);
    void getBudgetByIdUseCase.execute(budgetId).then((budget) => {
      if (cancelled) return;
      setLoaded(budget); setAmount(String(budget.limitAmount));
      setCategory(budget.category.type); setFrequency(budget.frequency);
    }).catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : "Unable to load budget.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [budgetId, getBudgetByIdUseCase, retry]);

  const save = async () => {
    if (pending.current || loading || (editing && !loaded)) return;
    pending.current = true; setSaving(true); setSaveError(undefined);
    try {
      const selectedCategory = loaded?.category.type === category ? loaded.category
        : new Category(category, category.charAt(0) + category.slice(1).toLowerCase(), category);
      const budget = new Budget(budgetId ?? String(Date.now()), selectedCategory, Money.parseInput(amount), frequency);
      if (editing) await updateBudgetUseCase.execute(budget); else await createBudgetUseCase.execute(budget);
      navigation.popTo("Main", { screen: "BudgetList" });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save budget. Please try again.");
    } finally { pending.current = false; setSaving(false); }
  };

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={styles.heading}>{editing ? "Edit budget" : "Create budget"}</Text>
      {loading || loadError ? <LoadState loading={loading} error={loadError} onRetry={() => setRetry(retry + 1)} /> : <Card>
        <Text style={styles.label}>Budget limit</Text>
        <TextInput accessibilityLabel="Budget limit" style={styles.input} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} editable={!saving} placeholder="500.00" />
        <Text style={styles.label}>Category</Text>
        <View style={styles.choices}>{Object.values(CategoryType).filter((value) => value !== CategoryType.INCOME).map((value) =>
          <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: category === value, disabled: saving }} disabled={saving}
            onPress={() => setCategory(value)} style={[styles.choice, category === value && styles.selected]}>
            <Text style={styles.choiceText}>{value.charAt(0) + value.slice(1).toLowerCase()}</Text>
          </Pressable>)}</View>
        <Text style={styles.label}>Budget period</Text>
        <View style={styles.choices}>{Object.values(Frequency).map((value) =>
          <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: frequency === value, disabled: saving }} disabled={saving}
            onPress={() => setFrequency(value)} style={[styles.choice, frequency === value && styles.selected]}>
            <Text style={styles.choiceText}>{frequencyLabels[value]}</Text>
          </Pressable>)}</View>
        <Text style={ui.body}>Weekly budgets run Monday to Sunday. Monthly and yearly budgets follow the calendar in your device's local time. Unspent amounts do not roll over.</Text>
        {saveError && <Text accessibilityLiveRegion="polite" style={ui.error}>{saveError}</Text>}
        <View style={styles.save}><ActionButton title={saving ? "Saving..." : editing ? "Update budget" : "Save budget"} disabled={saving} onPress={() => void save()} /></View>
      </Card>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, width: "100%", maxWidth: 720, alignSelf: "center" },
  heading: { fontSize: 28, fontWeight: "700", color: colors.text, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 10 },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radii.control, padding: 12, fontSize: 22, color: colors.text, marginBottom: 20 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  choice: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radii.control, justifyContent: "center" },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14 }, save: { marginTop: 20 },
});
