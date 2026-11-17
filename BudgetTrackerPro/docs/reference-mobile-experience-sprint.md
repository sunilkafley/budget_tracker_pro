# Reference-inspired mobile experience

Date: 18 November 2026 (Pacific/Auckland).
Branch: `polish/reference-mobile-experience`.
Baseline: `7624d4c` (`fix/recurring-payment-reliability`, PR #7).

## Implemented scope

The seven supplied phone screenshots guide the purple gradient, pale background,
rounded cards, colored category icons, persistent navigation, quick-add entry,
transaction search, budget progress and interactive reports. This updates the
existing application and its dependency wiring, retaining saved financial data.

- Home, Activity, Budgets and Insights are bottom tabs. A floating + opens a
  dismissible sheet for expense, income, budget and recurring-payment entry.
  Header actions refresh the active screen and open recurring payments. No
  decorative control is presented as a working reset or theme toggle.
- Home shows remaining monthly category budget (or month-to-date expenses when
  no monthly cap exists), monthly income/expenses, cashflow, the two budgets
  with highest utilization, three recent transactions, and upcoming bills.
  All older transactions remain available in Activity with edit/delete actions.
- Activity searches titles, category labels and income sources, with All,
  Expenses and Income filters. Results are newest first with stable kind+ID keys.
  Failed reads remain explicit errors; no matches and no entries are distinct.
- Budgets retains weekly/monthly/yearly CRUD and period labels, adds progress
  bars and near/over-limit status, and summarizes monthly caps separately.
- Insights retains month selection and monthly cashflow, adding elapsed-day
  average spend, seven recent daily bars or seven-day grouped bars, and a donut
  whose slices and legend rows highlight a category and update its center total.
- The existing shared transaction editor adds colored category tiles, bordered
  amount entry, an income/expense switch for new records, and strict local date
  entry. An unchanged edit date preserves its original timestamp; choosing a
  new valid date deliberately changes it. Notes, source and category ID
  preservation still use the existing use cases. Forms remain keyboard-aware.

## Calculation and compatibility rules

Money continues to use the existing major-unit storage policy and integer-cent
calculations. No keys or persisted models change in this sprint.

Current-month Home/Insights values include dates through today, excluding future
calendar days. Past-month reports include the whole month; future months have
zero elapsed days and empty charts. Daily bars cover up to seven elapsed days;
weekly bars are seven-day groups ending on the last elapsed date, with a shorter
first group when necessary. They are explicitly labelled, not Monday-based weeks.
Average spending divides total cents by elapsed calendar days, rounds the display
to a cent, and is marked approximate. Savings can be negative; zero income yields
0% with a 'No income recorded' label rather than an undefined percentage.

Monthly cap summaries include monthly budgets only and count each category's
spending once. If several caps exist for a category, the strictest (lowest) cap
is used for the combined summary; every original budget remains individually
editable. The budget screen explains that rule. Weekly/yearly limits are never
added to a monthly total. Existing budget period logic still counts any recorded
expense in that calendar interval, including future dates within it; the Home
budget card therefore says budgeted categories and the income/expense labels say
to date. Unbudgeted spending remains visible in monthly expense/cashflow totals.

Navigation moves the four main screens into a typed nested tab navigator.
RootStackParamList retains form/recurring routes and adds Main; AppNavigation
combines tab and stack actions. Budget save explicitly returns to Main/BudgetList.
Transaction modals return to the originating tab. No navigation call should rely
on a removed top-level Dashboard/BudgetList/Reports route.

Dependencies added with Expo compatibility: @react-navigation/bottom-tabs for
native navigation and safe-area behavior, expo-linear-gradient for the hero,
and react-native-svg for scalable icons and interactive charts. No general UI
or chart framework was added. Temporary uncommitted web-preview dependencies
were removed by restoring the committed lockfile install.

## Verification and limits

New regression tests were written and failed before the new use cases/helpers
existed. They exercise exact month/year filtering, future-date exclusion, leap
February, empty/future periods, repository failures, corrupt dates/precision,
negative savings, zero buckets, search/type filters, and duplicate category caps.
Final command results are appended after verification.

Browser visual testing could not proceed: the in-app browser was unavailable,
then native Chrome automation stopped because its safeguard could not confidently
identify the current browser URL. No browser screenshot, rendered layout,
interaction success, physical-device test or signed native build is claimed.
The automation guard was not bypassed. Preview server was stopped.

This pass preserves existing categories (Housing, Groceries, Transport, Fitness,
Insurance, Entertainment, Other, Income). Reference-only Food/Shopping/Utilities,
custom-category management, dark mode and data reset are not implemented here.
Financial Goals remains a later feature sprint. No existing data is replaced
with the reference's sample merchants or balances.

## iPhone acceptance review

The follow-up [reference layout refinement](reference-layout-details.md) tightens
row/card geometry, the overview and the transaction sheet against the supplied
screenshots. It supersedes this document's three-entry Home preview and + menu
default: Home now shows five entries and + opens the transaction sheet directly.
Hold + for the broader quick-add menu. See that note for verification limits.

Start this checkout with `npm.cmd start -- --go --clear` and reopen it in SDK 58
Expo Go. Check the four tabs, quick-add dismissal, modal Back and save, and that
adding/editing an entry refreshes the originating tab. Confirm budget save returns
to Budgets and recurring payments are reachable from every header. Search by
merchant/category/source and toggle filters, including no matches.

Try a month with no income/expenses, several category caps, an overspent budget,
and long merchant names/large amounts. Verify daily/weekly chart switching,
category/slice selection and clearing, month navigation and error/retry states.
Check the amount keypad, scrolling while the keyboard is open, notes/date
preservation, VoiceOver labels, large text, narrow screens and bottom safe areas.
These are outstanding device acceptance checks, not completed checks.

The draft PR targets main and depends on PR #7 and earlier unmerged branches.
Review its incremental diff against fix/recurring-payment-reliability until the
baselines merge. Existing user AGENTS.md edits and the parent README deletion are
excluded. No branch is force-pushed and no PR is merged.

Final local verification:

- `npm.cmd ci --no-audit --no-fund`: passed; 881 packages installed from lockfile.
- `npm.cmd test -- --watch=false --runInBand --silent` with `TZ=Pacific/Auckland`:
  39 suites / 287 tests passed (baseline: 38 suites / 278 tests).
- `npx.cmd tsc --noEmit`: passed.
- Online `npx.cmd expo install --check`: dependencies up to date.
- `npx.cmd expo export --platform ios --output-dir .expo/reference-ui-ios-export`:
  passed; 1,046 modules and Hermes bundle/assets exported to Git-ignored output.
- `git diff --check`: passed. Lint is not configured.
- One regression initially exposed a 299.99999999999994% result for 30 cents
  spent against a 10-cent cap. The combined summary now divides integer cents
  before calculating its display percentage, and the regression passes.
