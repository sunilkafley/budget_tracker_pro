import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DashboardScreen } from "../screens/DashboardScreen";
import { AddExpenseScreen } from "../screens/AddExpenseScreen";
import { AddIncomeScreen } from "../screens/AddIncomeScreen";
import CreateBudgetScreen from "../screens/CreateBudgetScreen";

export type RootStackParamList = {
  Dashboard: undefined;

  AddExpense: {
    expenseId?: string;
  };

  AddIncome: {
    incomeId?: string;
  };

  CreateBudget: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />

        <Stack.Screen name="AddIncome" component={AddIncomeScreen} />

        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />

        <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
