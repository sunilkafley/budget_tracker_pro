import React, { createContext, useContext } from "react";

import { FakeExpenseRepository } from "../infrastructure/repositories/FakeExpenseRepository";
import { FakeIncomeRepository } from "../infrastructure/repositories/FakeIncomeRepository";
import { FakeBudgetRepository } from "../infrastructure/repositories/FakeBudgetRepository";

import { AddExpenseUseCase } from "../application/useCases/AddExpenseUseCase";
import { AddIncomeUseCase } from "../application/useCases/AddIncomeUseCase";
import { CreateBudgetUseCase } from "../application/useCases/CreateBudgetUseCase";
import { GetDashboardSummaryUseCase } from "../application/useCases/GetDashboardSummaryUseCase";

const expenseRepository = new FakeExpenseRepository();
const incomeRepository = new FakeIncomeRepository();
const budgetRepository = new FakeBudgetRepository();

const repositoryContextValue = {
  expenseRepository,
  incomeRepository,
  budgetRepository,

  addExpenseUseCase: new AddExpenseUseCase(expenseRepository),
  addIncomeUseCase: new AddIncomeUseCase(incomeRepository),

  createBudgetUseCase: new CreateBudgetUseCase(budgetRepository),

  getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(
    incomeRepository,
    expenseRepository,
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
