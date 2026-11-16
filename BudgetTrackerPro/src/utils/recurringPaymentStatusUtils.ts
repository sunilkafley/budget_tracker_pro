export type RecurringPaymentStatus = "OVERDUE" | "DUE_TODAY" | "UPCOMING";

export interface RecurringPaymentStatusInfo {
  status: RecurringPaymentStatus;
  label: string;
  indicator: string;
}

export const getRecurringPaymentStatus = (
  daysUntilDue: number,
): RecurringPaymentStatusInfo => {
  if (daysUntilDue < 0) {
    return {
      status: "OVERDUE",
      label: `Overdue by ${Math.abs(daysUntilDue)} day${
        Math.abs(daysUntilDue) === 1 ? "" : "s"
      }`,
      indicator: "🔴",
    };
  }

  if (daysUntilDue === 0) {
    return {
      status: "DUE_TODAY",
      label: "Due today",
      indicator: "🟡",
    };
  }

  return {
    status: "UPCOMING",
    label: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`,
    indicator: "🟢",
  };
};
