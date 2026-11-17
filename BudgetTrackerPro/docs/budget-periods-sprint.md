# Budget calendar periods

Date: 18 November 2026 (Pacific/Auckland).
Branch: `fix/budget-periods`. Baseline: `ee5e427` (`polish/dashboard-ui`).

## Behavior and acceptance criteria

- Weekly budgets use Monday 00:00 through the following Monday 00:00;
  monthly budgets use the first of the month through the next first;
  yearly budgets use 1 January through the following 1 January.
- Start boundaries are inclusive and end boundaries exclusive. All boundaries
  use the device's current local calendar/time zone, including daylight saving.
  Weeks can cross years. Budgets have no persisted start date, so these are
  calendar periods rather than intervals anchored to creation. No rollover.
- All recorded expenses dated inside that interval count, including entries
  dated later within the current interval. Entries in prior/future intervals
  do not count. Changing device time zone can change boundary membership.
- Match categories by the existing CategoryType enum, consistently across both
  calculation paths. Legacy category IDs/labels remain stored unchanged.
  This app has enum categories; independently managed custom categories are
  not introduced. Editing without changing category preserves its ID/name.
- BudgetService owns period selection and exact Money-based calculations.
  AnalyticsService delegates to it and preserves its rounded display percentage.
  The application BudgetUsage DTO re-exports the domain result, removing the
  previous domain dependency on an application DTO.
- GetBudgetUsageUseCase loads through existing repository contracts; the
  dashboard and budget list use the same wired use case. Read/calculation
  failures produce retry states rather than zero spending or empty data.
- Dashboard and budget list display frequency and inclusive date labels.
  Budget list supports pull/focus refresh and shows remaining/over-limit amounts.
- Budget editor selects weekly/monthly/yearly and preserves persisted frequency
  when changing only the limit. Reads use GetBudgetByIdUseCase. Missing reads
  and missing-record updates fail explicitly; load errors cannot become creates.
  Inputs survive save errors, save/delete guards prevent repeated UI writes,
  and navigation params are typed. Shared UI and keyboard-aware scrolling are reused.
- Historical zero limits produce a finite 0% value and still report overspending.
  New/updated budgets continue to require positive limits. Invalid limits,
  frequencies, reference dates and relevant expense dates fail explicitly.

## Tests and verification

New regression suites were run before implementation and failed on lifetime
totals/category mismatch and missing use cases. Three new suites cover local
period boundaries, week/year rollover, leap February, daylight-saving calendar
dates, exact decimal arithmetic, empty/exactly-spent/over-budget/zero-limit cases,
invalid data, non-mutating reads, missing budgets and repository failures.
FinancialAccuracy tests now provide their January fixture date explicitly;
FinancialValidation seeds an existing budget before testing updates.

- `npm.cmd test -- --watch=false --runInBand --silent`: 35 suites / 244 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `npx.cmd expo export --platform ios --output-dir .expo/budget-periods-ios-export`:
  passed; 914 modules and a Hermes bundle/assets exported. Output is Git-ignored.
- `git diff --check`: passed.
- No package/lockfile changes; lint is not configured.
- No physical-device rendering, screen interaction tests, native build, signing
  or deployment was performed. The iOS export verifies bundling only.

## iPhone smoke test

From the D-drive app checkout, restart Expo with `npm.cmd start -- --go --clear`
and scan the new QR code. This branch includes SDK 58, transaction editing and
dashboard polish. Create budgets with each frequency, edit only the amount and
confirm frequency persists. Compare list/dashboard amounts and date ranges,
add a category expense and confirm totals refresh when returning. Check empty
data, a fully spent budget and an overspent budget, then test deleting a budget
leaves its expenses intact. Verify keyboard scrolling, large text and selection
announcements on the phone. Older periods must not inflate current spending.

## Review and next sprint

This branch builds on existing unmerged dashboard/transaction/SDK/accuracy/CI
work. Its PR targets the default branch `main`; review the incremental budget
change against `polish/dashboard-ui` until those baselines merge. No PR is
merged and no existing branch history is rewritten. Local user AGENTS.md edits
and the parent README deletion remain outside the sprint commit.

Next: recurring-payment reliability (month-end/leap-year rules, duplicate
occurrences, concurrent completion and recovery from partial persistence).
Repository writes still use existing non-atomic interfaces. General corrupted
storage repair, custom category management, history filtering and monthly
dashboard summary semantics remain separate work. Periods refresh on focus or
manual refresh; there is no midnight background timer.
