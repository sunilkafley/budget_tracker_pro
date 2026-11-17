import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { TransactionEditor } from "../components/TransactionEditor";

type Props = NativeStackScreenProps<RootStackParamList, "AddExpense">;

export function AddExpenseScreen({ navigation, route }: Props) {
  const [kind, setKind] = React.useState<"expense" | "income">("expense");
  return <TransactionEditor key={kind} kind={kind} transactionId={route.params?.expenseId}
    onClose={() => navigation.goBack()} onSwitchKind={() => setKind((current) => current === "expense" ? "income" : "expense")}
    onSaved={() => navigation.goBack()} />;
}
