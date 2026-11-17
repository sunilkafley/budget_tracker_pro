import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { TransactionEditor } from "../components/TransactionEditor";

type Props = NativeStackScreenProps<RootStackParamList, "AddIncome">;

export function AddIncomeScreen({ navigation, route }: Props) {
  const [kind, setKind] = React.useState<"expense" | "income">("income");
  return <TransactionEditor key={kind} kind={kind} transactionId={route.params?.incomeId}
    onClose={() => navigation.goBack()} onSwitchKind={() => setKind((current) => current === "expense" ? "income" : "expense")}
    onSaved={() => navigation.goBack()} />;
}
