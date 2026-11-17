import { Report } from "../../src/domain/models/Report";

describe("Report", () => {
  it("should create a report object", () => {
    const report: Report = {
      totalIncome: 5000,
      totalExpenses: 3000,
      savings: 2000,
      savingsRate: 40,
      topCategory: "Groceries",
      categoryBreakdown: [
        {
          category: "Groceries",
          amount: 300,
        },
      ],
    };

    expect(report.totalIncome).toBe(5000);
    expect(report.totalExpenses).toBe(3000);
    expect(report.savings).toBe(2000);
    expect(report.savingsRate).toBe(40);
    expect(report.topCategory).toBe("Groceries");
    expect(report.categoryBreakdown.length).toBe(1);
  });
});
