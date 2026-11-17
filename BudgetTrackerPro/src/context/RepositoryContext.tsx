import { GetInsightsUseCase } from "../application/useCases/GetInsightsUseCase";
import { AsyncRecurringOccurrenceRepository } from "../infrastructure/repositories/AsyncRecurringOccurrenceRepository";
import React, { createContext, useContext } from "react";

import { AsyncExpenseRepository } from "../infrastructure/repositories/AsyncExpenseRepository";
import { AsyncIncomeRepository } from "../infrastructure/repositories/AsyncIncomeRepository";
import { AsyncBudgetRepository } from "../infrastructure/repositories/AsyncBudgetRepository";

import { AddExpenseUseCase } from "../application/useCases/AddExpenseUseCase";
import { AddIncomeUseCase } from "../application/useCases/AddIncomeUseCase";
import { CreateBudgetUseCase } from "../application/useCases/CreateBudgetUseCase";
import { GetDashboardSummaryUseCase } from "../application/useCases/GetDashboardSummaryUseCase";

import { GetAllExpensesUseCase } from "../application/useCases/GetAllExpensesUseCase";
import { GetAllIncomesUseCase } from "../application/useCases/GetAllIncomesUseCase";
import { UpdateIncomeUseCase } from "../application/useCases/UpdateIncomeUseCase";
import { UpdateExpenseUseCase } from "../application/useCases/UpdateExpenseUseCase";
import { DeleteIncomeUseCase } from "../application/useCases/DeleteIncomeUseCase";
import { DeleteExpenseUseCase } from "../application/useCases/DeleteExpenseUseCase";
import { UpdateBudgetUseCase } from "../application/useCases/UpdateBudgetUseCase";
import { DeleteBudgetUseCase } from "../application/useCases/DeleteBudgetUseCase";

import { AsyncRecurringPaymentRepository } from "../infrastructure/repositories/AsyncRecurringPaymentRepository";

import { CreateRecurringPaymentUseCase } from "../application/useCases/CreateRecurringPaymentUseCase";
import { UpdateRecurringPaymentUseCase } from "../application/useCases/UpdateRecurringPaymentUseCase";
import { DeleteRecurringPaymentUseCase } from "../application/useCases/DeleteRecurringPaymentUseCase";
import { GetAllRecurringPaymentsUseCase } from "../application/useCases/GetAllRecurringPaymentsUseCase";
import { GetUpcomingPaymentsUseCase } from "../application/useCases/GetUpcomingPaymentsUseCase";
import { ProcessRecurringPaymentsUseCase } from "../application/useCases/ProcessRecurringPaymentsUseCase";
import { CompleteRecurringPaymentUseCase } from "../application/useCases/CompleteRecurringPaymentUseCase";
import { GetIncomeByIdUseCase } from "../application/useCases/GetIncomeByIdUseCase";
import { GetExpenseByIdUseCase } from "../application/useCases/GetExpenseByIdUseCase";
import { GetDashboardTransactionsUseCase } from "../application/useCases/GetDashboardTransactionsUseCase";
import { GetAllBudgetsUseCase } from "../application/useCases/GetAllBudgetsUseCase";
import { GetBudgetUsageUseCase } from "../application/useCases/GetBudgetUsageUseCase";
import { GetBudgetByIdUseCase } from "../application/useCases/GetBudgetByIdUseCase";

const expenseRepository = new AsyncExpenseRepository();
const incomeRepository = new AsyncIncomeRepository();
const budgetRepository = new AsyncBudgetRepository();
const recurringPaymentRepository = new AsyncRecurringPaymentRepository();

const repositoryContextValue = {
  getInsightsUseCase: new GetInsightsUseCase(incomeRepository, expenseRepository),
  getBudgetUsageUseCase: new GetBudgetUsageUseCase(budgetRepository, expenseRepository),
  getBudgetByIdUseCase: new GetBudgetByIdUseCase(budgetRepository),
  getDashboardTransactionsUseCase: new GetDashboardTransactionsUseCase(incomeRepository, expenseRepository),
  getAllBudgetsUseCase: new GetAllBudgetsUseCase(budgetRepository),
  expenseRepository,
  getIncomeByIdUseCase: new GetIncomeByIdUseCase(incomeRepository),
  getExpenseByIdUseCase: new GetExpenseByIdUseCase(expenseRepository),
  incomeRepository,
  budgetRepository,

  addExpenseUseCase: new AddExpenseUseCase(expenseRepository),
  addIncomeUseCase: new AddIncomeUseCase(incomeRepository),

  createBudgetUseCase: new CreateBudgetUseCase(budgetRepository),

  getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(
    incomeRepository,
    expenseRepository,
  ),

  getAllIncomesUseCase: new GetAllIncomesUseCase(incomeRepository),

  getAllExpensesUseCase: new GetAllExpensesUseCase(expenseRepository),

  updateIncomeUseCase: new UpdateIncomeUseCase(incomeRepository),

  updateExpenseUseCase: new UpdateExpenseUseCase(expenseRepository),

  deleteIncomeUseCase: new DeleteIncomeUseCase(incomeRepository),

  deleteExpenseUseCase: new DeleteExpenseUseCase(expenseRepository),
  updateBudgetUseCase: new UpdateBudgetUseCase(budgetRepository),

  deleteBudgetUseCase: new DeleteBudgetUseCase(budgetRepository),

  recurringPaymentRepository,

  createRecurringPaymentUseCase: new CreateRecurringPaymentUseCase(
    recurringPaymentRepository,
  ),

  updateRecurringPaymentUseCase: new UpdateRecurringPaymentUseCase(
    recurringPaymentRepository,
  ),

  deleteRecurringPaymentUseCase: new DeleteRecurringPaymentUseCase(
    recurringPaymentRepository,
  ),

  getAllRecurringPaymentsUseCase: new GetAllRecurringPaymentsUseCase(
    recurringPaymentRepository,
  ),
  // Dashboard widget use case
  getUpcomingPaymentsUseCase: new GetUpcomingPaymentsUseCase(
    recurringPaymentRepository,
  ),
  processRecurringPaymentsUseCase: new ProcessRecurringPaymentsUseCase(
    recurringPaymentRepository,
  ),

  completeRecurringPaymentUseCase: new CompleteRecurringPaymentUseCase(
    recurringPaymentRepository,
    expenseRepository,
    new AsyncRecurringOccurrenceRepository(),
  ),
};

const RepositoryContext = createContext(repositoryContextValue);

export const RepositoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <RepositoryContext.Provider value={repositoryContextValue}>
    {children}
  </RepositoryContext.Provider>
);

export const useRepositories = () => useContext(RepositoryContext);
