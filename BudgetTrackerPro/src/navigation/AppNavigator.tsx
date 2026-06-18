import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DashboardScreen } from "../screens/DashboardScreen";
import { AddExpenseScreen } from "../screens/AddExpenseScreen";
import { AddIncomeScreen } from "../screens/AddIncomeScreen";

export type RootStackParamList = {
  Dashboard: undefined;

  AddExpense: {
    expenseId?: string;
  };

  AddIncome: {
    incomeId?: string;
  };
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />

        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ title: "Add Expense" }}
        />

        <Stack.Screen
          name="AddIncome"
          component={AddIncomeScreen}
          options={{ title: "Add Income" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
