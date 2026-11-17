# Financial accuracy and validation sprint

Branch: `fix/financial-accuracy`. Baseline: `ffbdf41` from PR #1.

## Acceptance criteria

- Keep existing JSON amounts in major units and preserve repository contracts.
- Calculate totals, category breakdowns, budget balances and savings in integer
  cents, returning major-unit numbers to existing callers.
- Reject unsupported precision, nonfinite values, nonpositive write amounts,
  invalid dates, invalid recurrence frequencies and inappropriate expense
  categories before a repository write.
- Validate amount text before converting to number, so excess decimal digits
  cannot disappear through numeric conversion.
- Report errors visibly in affected forms and reports/dashboard, without
  silently rounding or changing stored data.
- Verify decimal correctness, boundaries, invalid inputs and repository failures
  using the existing fakes and RED -> GREEN -> REFACTOR.

## Money policy

Amounts retain the existing dollar-style representation: `1.15` means one
dollar and fifteen cents. No currency conversion or new currency metadata is
introduced. Supported monetary values have at most two decimal places and an
absolute value no larger than 1,000,000,000,000 major units. Money.toMinorUnits
parses the decimal representation instead of multiplying a binary float by
100. Integer cents remain well below JavaScript's safe-integer limit.

Money sums check every intermediate result against the same range. Signed
differences are allowed for savings and overspending; writes require positive
amounts. Percentages are dimensionless ratios of integer cents and remain
ordinary numbers, with existing display rounding preserved.

Money.parseInput accepts decimal text such as `0.29`, `.5`, `10.` and `01.20`
with surrounding whitespace. It rejects blank, negative, exponent, hexadecimal,
comma-separated and excess-precision text before numeric conversion. Form
validation errors retain the entered values for correction.

## Changes

Money and FinancialValidation live in the existing domain services directory.
Income/expense create and update, budget create/update, and recurring
create/update/completion invoke validation before writes. Transaction.isValid
now checks the same supported amount policy. Recurring completion validates
both its existing record and its advanced date before creating the expense.

ReportService, AnalyticsService and BudgetService calculate monetary values
through Money. Report, monthly summary, dashboard summary and savings insights
reuse those calculations. Existing month filters and category matching rules
are preserved for the later budget-period and category-consistency sprints.

Forms display validation errors; recurring category selection excludes INCOME.
Reports/dashboard show loading and retryable error states when unsupported
stored amounts prevent calculation. Dashboard transaction rows remain
available for editing when monetary calculation fails. Both recurring
completion entry points catch and display validation errors.

## Persistence compatibility

No storage keys, JSON formats or repository adapters change. Existing valid
amounts are read as before. Unsupported legacy precision (including old binary
calculation artifacts), nonfinite amounts and oversized aggregates cause an
explicit calculation error. They are never silently rounded or migrated.
The user can correct transaction amounts through existing edit forms; there
is no automated repair/migration tool in this sprint.

## Verification

Three new suites cover Money, financial accuracy through real use cases and
services, and validation across eight write paths with existing fake
repositories. They cover one-cent and maximum values, decimal addition and
subtraction, overspending, period exclusion, unsupported stored precision,
invalid dates/categories and failed repository writes. Corrupted recurring
completion is verified to create no expense and perform no schedule update.

- First new regression run: 65 tests failed, exposing the existing defects;
  Money did not exist yet. The corresponding tests pass after implementation.
- Amount-text parsing tests also failed before its implementation.
- `npm.cmd test -- --watch=false --runInBand --silent`: 30 suites / 217 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `git diff --check`: passed.
- No dependencies changed. Lint is not configured.
- Mobile interaction, screen rendering and Android/iOS builds were not run.
  No device-level usability or native build verification is claimed.

## Review and remaining work

PR #1 is still open. This branch builds on its validated application code,
without merging PR #1 into main. A new draft PR targets main as required by
the repository workflow and depends on PR #1. Review this sprint's incremental
changes against chore/ci-setup until PR #1 merges. No force push or merge into
main is authorized or performed.

Next: preserve dates/categories/notes during transaction editing, handle missing
records and category consistency, then implement budget periods. Recurrence
month-end/leap-day rules, duplicate prevention, transactional storage recovery,
strict calendar-date text parsing and general corrupted-storage repair remain
separate work. Date validation here checks Date objects for validity; it cannot
recover the original text after JavaScript has normalized a calendar date.
