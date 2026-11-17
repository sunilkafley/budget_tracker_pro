export type RootStackParamList = {
  Dashboard: undefined;

  AddExpense: {
    expenseId?: string;
  } | undefined;

  AddIncome: {
    incomeId?: string;
  } | undefined;

  CreateBudget: { budgetId?: string } | undefined;

  BudgetList: undefined;

  Reports: undefined;

  RecurringPayments: undefined;

  CreateRecurringPayment: {
    recurringPaymentId?: string;
  };
};
