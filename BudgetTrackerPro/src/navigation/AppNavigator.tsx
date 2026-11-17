import React from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ActivityScreen } from "../screens/ActivityScreen";
import { AddExpenseScreen } from "../screens/AddExpenseScreen";
import { AddIncomeScreen } from "../screens/AddIncomeScreen";
import CreateBudgetScreen from "../screens/CreateBudgetScreen";
import BudgetListScreen from "../screens/BudgetListScreen";
import ReportsScreen from "../screens/ReportsScreen";
import { RecurringPaymentsScreen } from "../screens/RecurringPaymentsScreen";
import CreateRecurringPaymentScreen from "../screens/CreateRecurringPaymentScreen";
import { RootStackParamList, AppTabParamList } from "../types/navigation";
import { Icon, IconName } from "../components/FinanceUI";
import { colors } from "../theme";
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const icons: Record<keyof AppTabParamList, IconName> = {
  Dashboard: "home",
  Activity: "activity",
  BudgetList: "budget",
  Reports: "insights",
};
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
        tabBarIcon: ({ color }) => (
          <Icon name={icons[route.name]} color={color} size={24} />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen
        name="BudgetList"
        component={BudgetListScreen}
        options={{ title: "Budgets" }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: "Insights" }}
      />
    </Tab.Navigator>
  );
}
export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddIncome"
            component={AddIncomeScreen}
            options={{ title: "Income", presentation: "modal" }}
          />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{ title: "Expense", presentation: "modal" }}
          />
          <Stack.Screen
            name="CreateBudget"
            component={CreateBudgetScreen}
            options={{ title: "Budget details", presentation: "modal" }}
          />
          <Stack.Screen
            name="RecurringPayments"
            component={RecurringPaymentsScreen}
            options={{ title: "Recurring payments" }}
          />
          <Stack.Screen
            name="CreateRecurringPayment"
            component={CreateRecurringPaymentScreen}
            options={{ title: "Recurring payment", presentation: "modal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
