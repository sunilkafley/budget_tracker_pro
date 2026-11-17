import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { TransactionEditor } from "../components/TransactionEditor";

type Props = NativeStackScreenProps<RootStackParamList, "AddExpense">;

export function AddExpenseScreen({ navigation, route }: Props) {
  return <TransactionEditor kind="expense" transactionId={route.params?.expenseId} onClose={() => navigation.goBack()} onSwitchKind={()=>navigation.replace("AddIncome")} onSaved={() => navigation.goBack()} />;
}
