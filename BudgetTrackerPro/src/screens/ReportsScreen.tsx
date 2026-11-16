import React, { useCallback, useMemo, useState } from "react";

import { ScrollView, View, Text, StyleSheet, Button } from "react-native";

import { Picker } from "@react-native-picker/picker";

import { useFocusEffect } from "@react-navigation/native";

import { useRepositories } from "../context/RepositoryContext";

import { GetReportUseCase } from "../application/useCases/GetReportUseCase";

import { Report } from "../domain/models/Report";

import { MONTHS, getAvailableYears } from "../constants/DateConstants";

export default function ReportsScreen() {
  const { incomeRepository, expenseRepository } = useRepositories();

  const currentDate = useMemo(() => new Date(), []);

  const years = useMemo(() => getAvailableYears(), []);

  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );

  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const useCase = new GetReportUseCase(incomeRepository, expenseRepository);
      setReport(await useCase.execute(selectedMonth, selectedYear));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load report.");
    } finally {
      setLoading(false);
    }
  }, [incomeRepository, expenseRepository, selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Reports</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filter Report</Text>

        <Picker
          selectedValue={selectedMonth}
          onValueChange={(value) => setSelectedMonth(value)}
        >
          {MONTHS.map((month) => (
            <Picker.Item
              key={month.value}
              label={month.label}
              value={month.value}
            />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedYear}
          onValueChange={(value) => setSelectedYear(value)}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>
      </View>

      {loading && <Text>Loading report...</Text>}
      {error && (
        <View accessibilityLiveRegion="polite">
          <Text>Report unavailable: {error}</Text>
          <Button title="Retry report" onPress={loadReport} />
        </View>
      )}
      {report && !error && !loading && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Summary</Text>

            <Text>Income: ${report.totalIncome.toFixed(2)}</Text>

            <Text>Expenses: ${report.totalExpenses.toFixed(2)}</Text>

            <Text>Savings: ${report.savings.toFixed(2)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Savings Rate</Text>

            <Text>{report.savingsRate.toFixed(0)}%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top Category</Text>

            <Text>{report.topCategory}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Category Breakdown</Text>

            {report.categoryBreakdown.map((item) => (
              <Text key={item.category}>
                {item.category}: ${item.amount.toFixed(2)}
              </Text>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
