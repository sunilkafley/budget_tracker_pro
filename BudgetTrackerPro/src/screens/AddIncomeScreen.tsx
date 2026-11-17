import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { TransactionEditor } from "../components/TransactionEditor";

type Props = NativeStackScreenProps<RootStackParamList, "AddIncome">;

export function AddIncomeScreen({ navigation, route }: Props) {
  return <TransactionEditor kind="income" transactionId={route.params?.incomeId} onSwitchKind={()=>navigation.replace("AddExpense")} onSaved={() => navigation.goBack()} />;
}
