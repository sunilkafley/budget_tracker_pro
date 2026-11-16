export type RootStackParamList = {
  Dashboard: undefined;

  AddExpense: {
    expenseId?: string;
  };

  AddIncome: {
    incomeId?: string;
  };

  CreateBudget: undefined;

  BudgetList: undefined;

  Reports: undefined;

  RecurringPayments: undefined;

  CreateRecurringPayment: {
    recurringPaymentId?: string;
  };
};
