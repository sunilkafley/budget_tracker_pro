# Recurring-payment reliability

Date: 18 November 2026 (Pacific/Auckland).
Branch: `fix/recurring-payment-reliability`. Baseline: `fix/budget-periods`.

## Implemented behavior

- Completion identifies an occurrence by payment ID and exact persisted due-date
  timestamp. Both screens pass the displayed due date, so stale confirmations
  retry the original occurrence rather than paying the next overdue bill.
  The optional date argument retains compatibility for older application callers;
  new callers must supply it to obtain idempotent retries across schedule changes.
- Monthly/yearly advancement clamps to the target month's last day. An optional
  recurrenceAnchorDate retains the original day/month: January 31 -> February
  28/29 -> March 31; February 29 returns in the next leap year. Weekly advancement
  adds seven local calendar days. Time of day is retained, subject to JavaScript's
  local daylight-saving adjustment when a wall-clock time does not exist.
- Amount-only edits preserve the anchor; changing frequency or due date resets
  it. Date entry strictly accepts real YYYY-MM-DD local dates. Editing an unchanged
  displayed date preserves its original timestamp, including legacy UTC dates.
- Future calendar-day occurrences are rejected. Payments due today can be
  recorded at any time today. Overdue completion advances exactly one occurrence;
  remaining unpaid occurrences stay overdue. The legacy Process use case is now
  read-only and cannot silently skip unpaid bills.
- A repository contract and injected AsyncStorage implementation persist the
  occurrence's expense snapshot and next date before financial writes. A stable
  expense ID links it to that occurrence. After an interruption, retry checks the
  expense and schedule before writing, preventing duplicates and double advances.
  Completed records remain available for idempotent retries even if their expense
  is later deliberately edited/deleted; retry does not recreate it.
- Completion instances, recurring edits and deletes share an application queue.
  Expense and schedule repositories serialize collection writes across instances,
  so unrelated in-process writes do not overwrite one another. Existing read
  failures propagate; failed writes do not mutate the original payment object.
- The recurring list now has loading/error/retry/refresh/empty feedback and guards
  completion/deletion with disabled controls and a synchronous pending guard.
  Dashboard retains its existing feedback and guard and passes occurrence identity.

## Storage compatibility and recovery

Existing keys and monetary representations remain unchanged. Legacy payments
need no migration: their current due date becomes the anchor on first completion.
New writes can include the optional anchor date. Recovery records use a separate
`RECURRING_OCCURRENCE_V1:` key per occurrence; no existing data is silently migrated.
Recovery data is checked and damaged records fail explicitly before financial writes.

A failure can temporarily leave an expense saved while the old schedule remains
visible. Retry Complete on that same due date to finish the schedule update; do
not enter another manual expense. Recovery uses the original amount/name/category
snapshot. If the schedule or frequency has been manually changed during a failed
operation, recovery stops explicitly rather than overwriting that change; restore
its original due date/frequency before retrying. General storage repair and a
recovery-history UI remain separate work. Records are retained without pruning.

Queues coordinate one app JavaScript runtime, not multiple processes/devices.
This is recoverable local persistence, not a multi-key atomic storage transaction.
No automatic expense creation, cloud synchronization or background processing
is enabled. Legacy storage that has already lost a pre-February anchor cannot
reconstruct that historical day automatically.

## Verification

- New recurrence/retry tests were introduced before implementation and initially
  failed because the new repository/date helpers did not exist.
- Added suites cover month ends, leap years, strict calendar dates, local DST
  advancement, future/today/stale occurrences, concurrent instances, repository
  errors, preserved/reset anchors and partial-save recovery.
- AsyncStorage tests inject failures before/after expense and schedule writes,
  restart repository instances, check concurrent unrelated writes, retained
  linkage, corrupted journals and deliberate expense deletion.
- Final commands/results are recorded below after the final verification run.
- Lint is not configured; Expo was patched to ~58.0.26 with a matching lockfile after hosted compatibility validation required it; no new direct dependency was introduced.
- No physical-device rendering/interaction, native build, signing or deployment
  was performed. An iOS export verifies JavaScript/assets only.

## iPhone review and next sprint

Start this checkout with `npm.cmd start -- --go --clear`. On the phone, record a
bill due today, confirm only one expense appears, and verify future bills cannot
be completed. For overdue bills, each intentional completion should advance one
period. Check January 31 and February 29 recurrence, restart Expo Go to verify
persistence, and review list/dashboard refresh, cancellation, errors, large text
and button wrapping. No automated screen interaction verification is claimed.

The PR targets main and builds on the unmerged budget/dashboard/transaction/SDK/
accuracy/CI branches. Review incremental changes against `fix/budget-periods`.
Existing user AGENTS.md changes and the parent README deletion are excluded.
No merge or force push is performed. Next planned feature sprint: Financial Goals,
after device review and review of these reliability changes.

Final verification:

- `npm.cmd test -- --watch=false --runInBand --silent` with `TZ=Pacific/Auckland`:
  38 suites / 278 tests passed (baseline 35 suites / 244 tests).
- `npx.cmd tsc --noEmit`: passed.
- `npx.cmd expo export --platform ios --output-dir .expo/recurring-reliability-ios-export`:
  passed; 917 modules and Hermes bundle/assets exported into Git-ignored output.
- `git diff --check`: passed before commit.

Hosted CI initially stopped before TypeScript/Jest at the Expo compatibility check:
58.0.25 was superseded by the required 58.0.26 patch. Updated Expo/lockfile and
reran the 278 tests, TypeScript and iOS export successfully. Online
`npx.cmd expo install --check` passes; the earlier local check used an offline map.
