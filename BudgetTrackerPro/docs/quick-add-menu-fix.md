# Quick-add menu and transaction-kind switching

Date: 18 November 2026 (Pacific/Auckland).
Branch: `fix/quick-add-menu`. Baseline: `73c2898` (PR #10).

The owner confirmed that + opens the transaction editor after the preceding
fix, but reported that choosing Income appeared to reopen the form. They asked
to restore the earlier four-option quick-add flow.

## Behavior

- A normal + tap now opens Create budget, Add income, Add expense and Recurring
  payment. Selecting a row opens the existing corresponding root-stack screen.
  Long pressing is no longer required to reach the menu.
- On iPhone, the selected action is queued until the React Native Modal's
  onDismiss callback. This avoids presenting a second native modal while the
  quick-add modal is still dismissing. Android dispatches after selection without
  waiting for the iOS-only callback. Cancellation clears queued actions; repeated
  selections during dismissal are ignored and an action is consumed once.
- New-transaction Expense/Income switching now changes local component state
  inside the same native screen instead of calling navigation.replace. Fields
  reset on a deliberate kind change, as they did with the old screen replacement.
  Editing existing records still has no kind switch. The chosen kind determines
  the existing save use case, and closing/saving returns to the originating tab.
- Standard native modal presentation, root-stack dispatch, recent-row editing,
  search, See all, financial calculations and persisted data remain unchanged.
  No dependencies or lockfile changes are required.

## Verification

The UI regression suite was updated and run before implementation: eight tests
failed, covering the requested menu behavior, deferred navigation and inline
kind switching. Tests now verify all four destinations wait for iOS dismissal,
cancel does not navigate, duplicate dismissal/selection cannot dispatch twice,
Android does not wait indefinitely, root fallback works and switching to income
saves through the income use case without replacing the native screen.

- `npm.cmd test -- --watch=false --runInBand --silent`: 40 suites / 307 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `npx.cmd expo export --platform ios --output-dir .expo/quick-add-menu-ios`:
  passed; 1,048 modules and Hermes bundle/assets exported to ignored output.
- `git diff --check`: passed. Lint is not configured.
- No agent-operated phone/simulator check, screenshot or signed native build
  was performed. Native animation/dismissal timing still needs the owner's
  iPhone confirmation; host-mocked UI tests cannot verify UIKit behavior.

## Phone review and next sprint

Fully reload Expo Go. Tap +, cancel once, then open it again and choose each
option. Close/back from each screen and confirm the menu does not reopen.
In a new transaction, switch Expense/Income and confirm the fields change
without another modal entrance. Save one entry of each kind and verify the
correct sign/type in Activity. Recheck recent transaction editing.

Financial Goals remains the next planned feature sprint. This focused PR
targets main and depends on PR #10 and earlier unmerged work. User AGENTS.md
edits and the parent README deletion remain excluded. No PR merge or force
push is authorized/performed.
