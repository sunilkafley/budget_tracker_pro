import React from "react";
import { act, create, ReactTestInstance, ReactTestRenderer } from "react-test-renderer";
import { FinancePage } from "../../src/components/FinanceUI";
import { DashboardScreen } from "../../src/screens/DashboardScreen";
import { ActivityScreen } from "../../src/screens/ActivityScreen";
import { AppNavigator } from "../../src/navigation/AppNavigator";
import { AddExpenseScreen } from "../../src/screens/AddExpenseScreen";
import { AddIncomeScreen } from "../../src/screens/AddIncomeScreen";
import { Expense } from "../../src/domain/models/Expense";
import { Income } from "../../src/domain/models/Income";
import { Category } from "../../src/domain/models/Category";
import { CategoryType } from "../../src/domain/enums/CategoryType";

// Mock native hosts only: the production components/hooks and their callbacks run.
jest.mock("react-native", () => ({
  View: "View", Text: "Text", Pressable: "Pressable", Modal: "Modal",
  ScrollView: "ScrollView", TextInput: "TextInput",
  FlatList: ({ data, renderItem, ListHeaderComponent, ListEmptyComponent }: {
    data: unknown[]; renderItem: (info: { item: unknown }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode; ListEmptyComponent?: React.ReactNode;
  }) => {
    const react = require("react") as typeof React;
    return react.createElement("FlatList", null, ListHeaderComponent,
      data.length ? data.map((item, index) => react.createElement(react.Fragment, { key: index }, renderItem({ item }))) : ListEmptyComponent);
  },
  KeyboardAvoidingView: "KeyboardAvoidingView", ActivityIndicator: "ActivityIndicator",
  RefreshControl: "RefreshControl", Button: "Button", Alert: { alert: jest.fn() },
  Platform: { OS: "ios" }, StyleSheet: { create: (styles: unknown) => styles },
  useWindowDimensions: () => ({ width: 390, height: 844, fontScale: 1 }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView", SafeAreaProvider: "SafeAreaProvider",
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));
jest.mock("react-native-svg", () => ({ __esModule: true, default: "Svg", Path: "Path", Circle: "Circle", Rect: "Rect", G: "G" }));
jest.mock("expo-linear-gradient", () => ({ LinearGradient: "LinearGradient" }));
jest.mock("expo-status-bar", () => ({ StatusBar: "StatusBar" }));
jest.mock("@react-native-picker/picker", () => ({ Picker: "Picker" }));
jest.mock("@react-navigation/native-stack", () => ({ createNativeStackNavigator: () => ({ Navigator: "StackNavigator", Screen: "StackScreen" }) }));
jest.mock("@react-navigation/bottom-tabs", () => ({ createBottomTabNavigator: () => ({ Navigator: "TabNavigator", Screen: "TabScreen" }) }));
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: "NavigationContainer", DefaultTheme: { colors: {} },
  useNavigation: () => mockTabNavigation, useFocusEffect: jest.fn(),
}));
jest.mock("../../src/context/RepositoryContext", () => ({ useRepositories: () => mockRepositories }));
jest.mock("../../src/hooks/useDashboard", () => ({ useDashboard: () => mockDashboard }));
jest.mock("../../src/hooks/useFocusedResource", () => ({ useFocusedResource: () => ({ data: mockDashboard.transactions, loading: false, error: undefined, load: jest.fn() }) }));

const mockRootNavigation = { navigate: jest.fn() };
const mockTabNavigation = { navigate: jest.fn(), getParent: jest.fn((): typeof mockRootNavigation | undefined => mockRootNavigation) };
const mockRepositories = {
  getExpenseByIdUseCase: { execute: jest.fn() }, getIncomeByIdUseCase: { execute: jest.fn() },
  addExpenseUseCase: { execute: jest.fn() }, addIncomeUseCase: { execute: jest.fn() },
  updateExpenseUseCase: { execute: jest.fn() }, updateIncomeUseCase: { execute: jest.fn() },
};
const expense = new Expense("expense-1", "Groceries", 5, new Date(2026, 10, 18), new Category("grocery", "Groceries", CategoryType.GROCERY));
const income = new Income("income-1", "Salary", 10, new Date(2026, 10, 18), "Employer");
const mockDashboard = {
  summary: null, monthlyPlan: null, budgets: [], payments: [], errors: {}, loading: false,
  load: jest.fn(), cancel: jest.fn(), transactions: [
    { kind: "expense", transaction: expense }, { kind: "income", transaction: income },
  ],
};

let rendered: ReactTestRenderer | undefined;
async function mount(element: React.ReactElement) {
  await act(async () => { rendered = create(element); });
  return rendered!.root;
}
function pressLabel(root: ReactTestInstance, label: string) {
  const button = root.find((node) => String(node.type) === "Pressable" && node.props.accessibilityLabel === label);
  act(() => button.props.onPress());
}
function text(root: ReactTestInstance, value: string) {
  return root.find((node) => String(node.type) === "Text" && node.children.join("") === value);
}

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const originalError = console.error;
  jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    if (String(args[0]).includes("react-test-renderer is deprecated")) return;
    originalError(...args);
  });
});
beforeEach(() => {
  jest.clearAllMocks();
  mockTabNavigation.getParent.mockReturnValue(mockRootNavigation);
  mockRepositories.getExpenseByIdUseCase.execute.mockResolvedValue(expense);
  mockRepositories.getIncomeByIdUseCase.execute.mockResolvedValue(income);
});
afterEach(async () => {
  await act(async () => { rendered?.unmount(); });
  rendered = undefined;
});
afterAll(() => { jest.restoreAllMocks(); });

it("opens a new expense on the root stack when + is tapped inside a tab", async () => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "New transaction");
  expect(mockRootNavigation.navigate).toHaveBeenCalledWith("AddExpense");
  expect(mockTabNavigation.navigate).not.toHaveBeenCalled();
});

it.each(["expense", "income"])("opens the correct recent %s record on the root stack", async (kind) => {
  const root = await mount(<DashboardScreen />);
  pressLabel(root, kind === "expense" ? "Edit Groceries, −$5.00" : "Edit Salary, +$10.00");
  expect(mockRootNavigation.navigate).toHaveBeenCalledWith(kind === "expense" ? "AddExpense" : "AddIncome",
    kind === "expense" ? { expenseId: "expense-1" } : { incomeId: "income-1" });
});

it("opens the Activity tab from See all", async () => {
  const root = await mount(<DashboardScreen />);
  act(() => text(root, "See all (2)").parent!.props.onPress());
  expect(mockTabNavigation.navigate).toHaveBeenCalledWith("Activity");
});

it.each(["expense", "income"])("opens an Activity %s row on the root stack", async (kind) => {
  const root = await mount(<ActivityScreen />);
  pressLabel(root, kind === "expense" ? "Edit Groceries, −$5.00" : "Edit Salary, +$10.00");
  expect(mockRootNavigation.navigate).toHaveBeenCalledWith(kind === "expense" ? "AddExpense" : "AddIncome",
    kind === "expense" ? { expenseId: "expense-1" } : { incomeId: "income-1" });
});

it("can open a transaction when already rendered at the root", async () => {
  mockTabNavigation.getParent.mockReturnValue(undefined);
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "New transaction");
  expect(mockTabNavigation.navigate).toHaveBeenCalledWith("AddExpense");
});

it("registers both transaction editors as standard native modals", async () => {
  const root = await mount(<AppNavigator />);
  for (const name of ["AddExpense", "AddIncome"]) {
    const screen = root.find((node) => String(node.type) === "StackScreen" && node.props.name === name);
    expect(screen.props.options).toMatchObject({ presentation: "modal", headerShown: false });
    expect(screen.props.options.sheetAllowedDetents).toBeUndefined();
  }
});

it("renders a new transaction and supports closing and switching to income", async () => {
  const navigation = { goBack: jest.fn(), replace: jest.fn() };
  const root = await mount(<AddExpenseScreen navigation={navigation as unknown as React.ComponentProps<typeof AddExpenseScreen>["navigation"]}
    route={{ key: "new", name: "AddExpense" }} />);
  expect(text(root, "New transaction")).toBeDefined();
  expect(text(root, "Save Expense")).toBeDefined();
  act(() => text(root, "Income").parent!.props.onPress());
  expect(navigation.replace).toHaveBeenCalledWith("AddIncome");
  pressLabel(root, "Close transaction");
  expect(navigation.goBack).toHaveBeenCalled();
});

it("loads a tapped expense into its edit form", async () => {
  const root = await mount(<AddExpenseScreen navigation={{} as React.ComponentProps<typeof AddExpenseScreen>["navigation"]}
    route={{ key: "edit", name: "AddExpense", params: { expenseId: expense.id } }} />);
  expect(mockRepositories.getExpenseByIdUseCase.execute).toHaveBeenCalledWith(expense.id);
  expect(text(root, "Edit transaction")).toBeDefined();
  expect(root.find((node) => String(node.type) === "TextInput" && node.props.accessibilityLabel === "Title").props.value).toBe("Groceries");
});

it("loads a tapped income into its edit form", async () => {
  const root = await mount(<AddIncomeScreen navigation={{} as React.ComponentProps<typeof AddIncomeScreen>["navigation"]}
    route={{ key: "edit", name: "AddIncome", params: { incomeId: income.id } }} />);
  expect(mockRepositories.getIncomeByIdUseCase.execute).toHaveBeenCalledWith(income.id);
  expect(root.find((node) => String(node.type) === "TextInput" && node.props.accessibilityLabel === "Income source").props.value).toBe("Employer");
});

it("shows a retry state when a tapped transaction cannot load", async () => {
  mockRepositories.getExpenseByIdUseCase.execute.mockRejectedValue(new Error("Expense not found"));
  const root = await mount(<AddExpenseScreen navigation={{} as React.ComponentProps<typeof AddExpenseScreen>["navigation"]}
    route={{ key: "missing", name: "AddExpense", params: { expenseId: "deleted" } }} />);
  expect(text(root, "Expense not found")).toBeDefined();
  expect(text(root, "Try again")).toBeDefined();
  expect(root.findAll((node) => String(node.type) === "Text" && node.children.join("") === "Save changes")).toHaveLength(0);
});
