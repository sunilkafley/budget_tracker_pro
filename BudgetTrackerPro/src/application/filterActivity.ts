import { DashboardTransaction } from "./useCases/GetDashboardTransactionsUseCase";
export type ActivityFilter = "all" | "expense" | "income";
export function filterActivity(
  records: readonly DashboardTransaction[],
  query: string,
  kind: ActivityFilter,
): DashboardTransaction[] {
  const search = query.trim().toLocaleLowerCase();
  return records.filter(
    (record) =>
      (kind === "all" || record.kind === kind) &&
      [
        record.transaction.title,
        record.kind === "expense"
          ? record.transaction.category.name
          : record.transaction.source,
        record.kind === "income" ? "Income" : "",
      ].some((value) => value.toLocaleLowerCase().includes(search)),
  );
}
