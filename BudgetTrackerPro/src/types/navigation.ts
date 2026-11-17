import {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
export type AppTabParamList = {
  Dashboard: undefined;
  Activity: undefined;
  BudgetList: undefined;
  Reports: undefined;
};
export type RootStackParamList = {
  Main: NavigatorScreenParams<AppTabParamList> | undefined;
  AddExpense:
    | {
        expenseId?: string;
      }
    | undefined;
  AddIncome:
    | {
        incomeId?: string;
      }
    | undefined;
  CreateBudget: { budgetId?: string } | undefined;
  RecurringPayments: undefined;
  CreateRecurringPayment: {
    recurringPaymentId?: string;
  };
};
export type AppNavigation = CompositeNavigationProp<
  import("@react-navigation/bottom-tabs").BottomTabNavigationProp<AppTabParamList>,
  import("@react-navigation/native-stack").NativeStackNavigationProp<RootStackParamList>
>;
