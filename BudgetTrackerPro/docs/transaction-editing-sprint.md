# Transaction editing and form improvements

Baseline: SDK 58 branch at 0bf677f. Branch: fix/transaction-editing.

## Acceptance criteria and implementation

- Editing income/expenses preserves the persisted transaction date. Update
  use cases reload the record and apply editable fields to a new model.
- Omitted notes retain the stored value; an explicit empty string clears them.
- Expense forms load the original category. Keeping its type preserves its
  original category ID/name; intentionally selecting another type creates
  a category with that type's canonical ID and display label. No stored
  categories are migrated. Date editing is deliberately not offered here.
- Missing records fail with Income/Expense not found, including deletion after
  the editor loaded. A failed load cannot fall through into creating a record.
  Read and write failures propagate and the form retains input after save errors.
- New GetIncomeByIdUseCase/GetExpenseByIdUseCase instances are supplied by the
  existing RepositoryContext. The new forms do not read repositories directly.
- AddIncome/AddExpense navigation props are typed and accept omitted params
  for creation. Existing edit IDs/routes are preserved.

## Visible improvements in this sprint

The two screens share TransactionEditor, with a soft background, white card,
teal accents, larger amount input, visible labels, wrapping category chips,
notes, inline errors and a prominent save button. Inputs are keyboard-aware
and scroll on small displays, content width is constrained on tablets, and
buttons have accessible labels/selection state and minimum touch sizes.

Loading, missing/error/retry and saving states are explicit. A synchronous
save guard blocks repeated taps while a write is pending. Inputs/category
selection are disabled during a save. Async loads ignore stale responses when
the record changes or the screen unmounts. Existing stored dates remain visible.

No UI library or other dependency was added. Income/expense form layout was
consolidated; dashboard, budget, report and recurring-payment layouts were
not redesigned. Their existing functionality is retained.

## Validation

New TransactionEditing tests first failed because read use cases did not
exist. After adding the readers, all six regressions still failed on existing
update behavior (date/notes loss, missing-record success and read failures).
They pass with the fixes. Existing FinancialValidation update tests now seed
existing records before asserting validation and write-failure behavior.

- npm.cmd test -- --watch=false --runInBand --silent: 31 suites / 223 tests pass.
- npx.cmd tsc --noEmit: passes.
- npx.cmd expo export --platform ios --output-dir <temporary-directory>:
  passes, 907 modules and the Hermes bundle/assets exported.
- git diff --check: passes.
- No native build, physical-device interaction test or screen screenshot was
  performed. An export verifies bundling, not rendered layout or keyboard UX.
  Hosted CI is checked separately after pushing the PR.

## iPhone smoke test

Restart/reload the app from this session's existing temporary checkout. Open
Add Income/Add Expense to inspect the new forms. Add an expense in Transport
with notes, edit only its amount, and confirm the category, notes and recorded
date survive. Change category intentionally and clear notes, then reopen to
confirm those changes persist. Try invalid amounts and blank titles, and
confirm input remains visible for correction. Test saving with the keyboard
open and with larger accessibility text. Check a missing record cannot save.

## Next visual sprint and remaining work

The requested visual improvements now start in the transaction forms. Bring
the dashboard and shared app styling forward as the next focused sprint:
clear balance cards, readable recent transactions, consistent actions,
spacing, colors and loading/empty/error presentation. Use the existing data
contracts and label period semantics truthfully. A complete app-wide redesign
is not claimed by this sprint. Budget-period calculations, recurring-payment
reliability and the rest of the functional roadmap remain separate work after
that visual pass. History search/filtering is also deferred; this sprint
focuses on reliable editing and category entry.

Update reads and writes still use the existing repository interface and are
not atomic across concurrent external writers. General storage concurrency
and corrupted-data recovery require the later persistence sprint.

The PR targets main as required and builds on pending PR #3 (which depends on
#2 and #1); review the incremental diff against chore/expo-sdk-58 until those
baselines merge. No PR merge or history rewrite is authorized. The original
D-drive checkout and its uncommitted files remain untouched.
