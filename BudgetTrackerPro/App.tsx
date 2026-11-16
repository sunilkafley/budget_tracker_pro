import { RepositoryProvider } from "./src/context/RepositoryContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <RepositoryProvider>
      <AppNavigator />
    </RepositoryProvider>
  );
}
