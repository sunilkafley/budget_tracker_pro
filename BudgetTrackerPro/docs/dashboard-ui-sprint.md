# Dashboard UI and shared styling

Branch: polish/dashboard-ui. Baseline: be01dc7 (transaction-editing PR #4).

## Completed scope

- A dark teal tracked-balance card, separate income/expense totals, quick
  add actions and a responsive card layout replace the plain dashboard.
- The balance is explicitly all recorded income minus expenses. Income and
  expenses say all time. No bank balance or current-month total is implied.
- Budget cards show lifetime category spending against limits, clamped visual
  progress, exact monetary remaining/over-limit values and textual status.
  Existing financial calculation and period semantics are preserved.
- Upcoming cards retain overdue/due-today labels and payment confirmation,
  with clear due date, amount and record-payment action.
- Recent transactions combine incomes and expenses newest first. Five show
  initially; Show all retains access to every older transaction. Same IDs
  across income/expense records have distinct render keys. Every edit/delete
  action and all existing dashboard navigation destinations remain reachable.
- Shared theme colors, spacing and radii connect the dashboard, transaction
  editor and navigation headers. AppUI provides reusable cards, buttons,
  section headings and load/error/empty states. No UI library is added.
- Touch controls are at least 48 points; category/editor controls retain
  their existing sizes. Text scales, action rows wrap, and content has a
  maximum width on larger devices. Progress has an accessibility value and
  status is communicated in text as well as color.

## Architecture and behavior

GetDashboardTransactionsUseCase reads through the existing repository
interfaces and sorts new view records without mutating repository arrays.
Its provider wiring and the existing GetAllBudgetsUseCase are exposed through
RepositoryContext; the dashboard does not access repositories directly.

useDashboard orchestrates summary, transactions, budgets and payments with
independent Promise.allSettled results. Each section has explicit loading,
error/retry and empty feedback. Failed sections do not hide transaction edits
or masquerade as empty data. Failed refreshes hide stale section data behind
an error; pending refreshes show the refresh indicator. Request sequencing and
focus cleanup ignore outdated results. Pull-to-refresh and focus refresh use
the same load path.

Delete/payment writes retain confirmation dialogs, report write failures and
refresh data after success. A synchronous guard and disabled controls prevent
repeated mutation taps during an active write. This is a UI guard, not persisted
recurring-occurrence idempotency or atomic storage recovery.

Money formatting validates the supported amount representation before showing
two decimal places; unsupported values display Unavailable rather than being
silently rounded. Financial totals, storage formats and repository contracts
are unchanged. Placeholder summary fields are not presented as real metrics.

## Validation

- New use-case tests were written and failed before implementation.
- Three tests cover mixed transaction sorting/IDs, no repository-order mutation,
  retention of older records, empty data and failures from either repository.
- npm.cmd test -- --watch=false --runInBand --silent: 32 suites / 226 tests pass.
- npx.cmd tsc --noEmit: passes.
- npx.cmd expo install --check: dependencies up to date.
- npx.cmd expo export --platform ios --output-dir <temporary-directory>:
  passes, 911 modules and Hermes bundle/assets exported.
- git diff --check: passes.
- No new dependencies; package.json and lockfile are unchanged.
- No physical-device layout/interaction test, automated screen interaction
  tests, screen screenshots or native builds were performed. These are code
  and bundling checks, not a claim of rendered-device verification.

## iPhone review

Reload Expo Go from the same temporary checkout. If its server is stopped:

```powershell
cd "$env:TEMP\budget-tracker-pro-ci-20261116\BudgetTrackerPro"
npm.cmd start -- --go --clear
```

Review the balance/quick actions, scroll through all sections, and test all
navigation destinations. With more than five transactions, Show all must
expose older edits/deletes. Add income/expense, return and confirm totals
refresh. Cancel and confirm deletion/payment actions. Pull down to refresh.
Check both empty and populated records, long titles and large amounts.
Test larger accessibility text, VoiceOver labels/selection and small-screen
wrapping, including the bottom actions. Screen rendering and spacing still
need owner feedback from the physical iPhone.

## Remaining work and PR dependency

Budget-period calculations remain the next correctness sprint, followed by
recurring-payment reliability. Full history filtering and broader styling of
budget/report/recurring screens remain separate tasks. This sprint redesigns
the home screen and shares styling foundations; it does not claim those other
screens have been redesigned.

This draft PR targets main and builds on pending PR #4 and its earlier
dependencies. Review the incremental UI diff against fix/transaction-editing
until those baselines merge. No PR merge, force push or original-checkout
modification is authorized or performed.
