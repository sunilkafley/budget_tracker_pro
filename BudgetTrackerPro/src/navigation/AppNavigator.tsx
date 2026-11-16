import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DashboardScreen } from "../screens/DashboardScreen";
import { AddExpenseScreen } from "../screens/AddExpenseScreen";
import { AddIncomeScreen } from "../screens/AddIncomeScreen";
import CreateBudgetScreen from "../screens/CreateBudgetScreen";
import BudgetListScreen from "../screens/BudgetListScreen";
import ReportsScreen from "../screens/ReportsScreen";
import { RecurringPaymentsScreen } from "../screens/RecurringPaymentsScreen";
import CreateRecurringPaymentScreen from "../screens/CreateRecurringPaymentScreen";

import { RootStackParamList } from "../types/navigation";
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />

        <Stack.Screen name="AddIncome" component={AddIncomeScreen} />

        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />

        <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
        <Stack.Screen name="BudgetList" component={BudgetListScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen
          name="RecurringPayments"
          component={RecurringPaymentsScreen}
        />

        <Stack.Screen
          name="CreateRecurringPayment"
          component={CreateRecurringPaymentScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
