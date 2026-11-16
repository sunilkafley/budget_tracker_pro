import { ExportReportUseCase } from "../../src/application/useCases/ExportReportUseCase";

import { Report } from "../../src/domain/models/Report";

describe("ExportReportUseCase", () => {
  it("should export report as formatted JSON", () => {
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

    const useCase = new ExportReportUseCase();

    const result = useCase.execute(report);

    expect(result).toContain("totalIncome");

    expect(result).toContain("totalExpenses");

    expect(result).toContain("savingsRate");

    expect(result).toContain("Groceries");
  });
});
