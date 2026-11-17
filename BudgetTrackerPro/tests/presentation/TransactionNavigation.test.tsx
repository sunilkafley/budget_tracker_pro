import React from "react";
import { Animated, Modal, Platform } from "react-native";
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
  Animated: {
    Value: jest.fn(() => ({ setValue: jest.fn(), stopAnimation: jest.fn() })),
    View: "AnimatedView", timing: jest.fn(() => ({ start: jest.fn() })),
  },
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
  jest.replaceProperty(Platform, "OS", "ios");
  mockTabNavigation.getParent.mockReturnValue(mockRootNavigation);
  mockRepositories.getExpenseByIdUseCase.execute.mockResolvedValue(expense);
  mockRepositories.getIncomeByIdUseCase.execute.mockResolvedValue(income);
});
afterEach(async () => {
  await act(async () => { rendered?.unmount(); });
  rendered = undefined;
});
afterAll(() => { jest.restoreAllMocks(); });

it("opens the four-option menu without navigating when + is tapped", async () => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  expect(root.findByType(Modal).props.visible).toBe(true);
  for (const label of ["Create budget", "Add income", "Add expense", "Recurring payment"]) expect(text(root, label)).toBeDefined();
  expect(mockRootNavigation.navigate).not.toHaveBeenCalled();
  expect(mockTabNavigation.navigate).not.toHaveBeenCalled();
});

it("shows menu content immediately without sliding the full-screen modal", async () => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  expect(root.findByType(Modal).props).toMatchObject({ visible: true, transparent: true, animationType: "none", presentationStyle: "overFullScreen" });
  const panel = root.find((node) => String(node.type) === "AnimatedView");
  expect(text(panel, "Make a new entry")).toBeDefined();
  expect(panel.props.style.opacity).not.toBe(0);
});

it("animates only the menu panel when the native popup is ready", async () => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  act(() => root.findByType(Modal).props.onShow());
  expect(Animated.timing).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ toValue: 0, useNativeDriver: true }));
});

it.each([
  ["Create budget", "CreateBudget"], ["Add income", "AddIncome"],
  ["Add expense", "AddExpense"], ["Recurring payment", "CreateRecurringPayment"],
])("waits for the iPhone menu to dismiss before opening %s", async (label, route) => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  act(() => text(root, label).parent!.props.onPress());
  expect(root.findByType(Modal).props.visible).toBe(false);
  expect(mockRootNavigation.navigate).not.toHaveBeenCalled();
  act(() => root.findByType(Modal).props.onDismiss());
  expect(mockRootNavigation.navigate.mock.calls).toEqual([route === "CreateRecurringPayment" ? [route, {}] : [route]]);
  act(() => root.findByType(Modal).props.onDismiss());
  expect(mockRootNavigation.navigate).toHaveBeenCalledTimes(1);
});

it("closes the menu without navigating when cancelled", async () => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  const close = root.findAll((node) => String(node.type) === "Pressable" && node.props.accessibilityLabel === "Close quick add")[0];
  act(() => close.props.onPress());
  expect(root.findByType(Modal).props.visible).toBe(false);
  act(() => root.findByType(Modal).props.onDismiss());
  expect(mockRootNavigation.navigate).not.toHaveBeenCalled();
});

it("ignores a second selection while the iPhone menu is dismissing", async () => {
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  act(() => text(root, "Add income").parent!.props.onPress());
  act(() => text(root, "Add expense").parent!.props.onPress());
  act(() => root.findByType(Modal).props.onDismiss());
  expect(mockRootNavigation.navigate.mock.calls).toEqual([["AddIncome"]]);
});

it("opens the chosen screen on Android without an iOS dismissal callback", async () => {
  jest.replaceProperty(Platform, "OS", "android");
  const root = await mount(<FinancePage title="Overview" onRefresh={() => {}}>Content</FinancePage>);
  pressLabel(root, "Add transaction or budget");
  act(() => text(root, "Add expense").parent!.props.onPress());
  expect(mockRootNavigation.navigate).toHaveBeenCalledWith("AddExpense");
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
  pressLabel(root, "Add transaction or budget");
  act(() => text(root, "Add expense").parent!.props.onPress());
  act(() => root.findByType(Modal).props.onDismiss());
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

it("switches to income inside the existing form without reopening a native modal", async () => {
  const navigation = { goBack: jest.fn(), replace: jest.fn() };
  const root = await mount(<AddExpenseScreen navigation={navigation as unknown as React.ComponentProps<typeof AddExpenseScreen>["navigation"]}
    route={{ key: "new", name: "AddExpense" }} />);
  expect(text(root, "New transaction")).toBeDefined();
  expect(text(root, "Save Expense")).toBeDefined();
  act(() => text(root, "Income").parent!.props.onPress());
  expect(navigation.replace).not.toHaveBeenCalled();
  expect(text(root, "Save Income")).toBeDefined();
  pressLabel(root, "Close transaction");
  expect(navigation.goBack).toHaveBeenCalled();
});

it("saves to the income use case after switching from an expense form", async () => {
  const navigation = { goBack: jest.fn(), replace: jest.fn() };
  const root = await mount(<AddExpenseScreen navigation={navigation as unknown as React.ComponentProps<typeof AddExpenseScreen>["navigation"]}
    route={{ key: "switch-save", name: "AddExpense" }} />);
  act(() => text(root, "Income").parent!.props.onPress());
  const field = (label: string) => root.find((node) => String(node.type) === "TextInput" && node.props.accessibilityLabel === label);
  act(() => { field("Title").props.onChangeText("Freelance"); field("Amount").props.onChangeText("25.50"); });
  await act(async () => { await text(root, "Save Income").parent!.props.onPress(); });
  expect(mockRepositories.addIncomeUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ title: "Freelance", amount: 25.5 }));
  expect(mockRepositories.addExpenseUseCase.execute).not.toHaveBeenCalled();
  expect(navigation.replace).not.toHaveBeenCalled();
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
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
