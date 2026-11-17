import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppNavigation, RootStackParamList } from "../types/navigation";

/** Forms belong to the stack above MainTabs, rather than the tab navigator. */
export function useRootNavigation(): NativeStackNavigationProp<RootStackParamList> {
  const navigation = useNavigation<AppNavigation>();
  return navigation.getParent<NativeStackNavigationProp<RootStackParamList>>() ?? navigation;
}
