export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export interface Report {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  topCategory: string;
  categoryBreakdown: CategoryBreakdown[];
}
