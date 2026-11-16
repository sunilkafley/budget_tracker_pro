import { Report } from "../../domain/models/Report";

export class ExportReportUseCase {
  execute(report: Report): string {
    return JSON.stringify(report, null, 2);
  }

  executeAsObject(report: Report): Report {
    return report;
  }
}
