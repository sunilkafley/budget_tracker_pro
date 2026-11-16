# Development audit and remaining sprints

Audit date: 16 November 2026.

## Scope and evidence

The feature audit below describes local `expo-upgrade` at `a0f5e48`, not
`main`. Screens, navigation, dependency wiring, models, repository contracts,
use cases, persistence implementations and all 26 test files were inspected.
The existing README's completed-sprint labels are not release verification.
No prototype or separate sprint notes were found in tracked files.

GitHub's default branch is `main` at `bb68ff3`. It is 19 commits behind the
development checkout and contains only the early architecture foundation.
This CI branch starts from that main commit to avoid including those 19
commits in a CI-only PR. Reconcile the development branch in a separate review;
do not reset or overwrite it. The original checkout's modified AGENTS.md and
deleted parent README belong to the user and are excluded from this change.

## Feature audit

| Area | Status | Verified implementation and remaining gaps |
| --- | --- | --- |
| Architecture and wiring | Implemented, needs improvement | App mounts RepositoryProvider and stack navigation; use cases receive repository implementations. Screens do not import AsyncStorage. Screens still read repositories and instantiate some use cases directly. AnalyticsService imports an application DTO into domain, reversing the intended dependency direction. RepositoryProvider.tsx is empty; the active provider is in RepositoryContext.tsx. |
| Income and expense CRUD | Partial | Add/edit forms and dashboard deletion invoke use cases backed by AsyncStorage. Expense entry hardcodes Grocery. Editing income or expense resets its date to now; editing expense also replaces its category and drops notes. Update use cases do not validate amounts. No dedicated searchable/filterable transaction history. |
| Budgets | Partial; calculation defect | Create/edit/delete/list and dashboard usage exist. Category totals include every historical expense and ignore frequency. BudgetService matches category IDs while AnalyticsService matches category types. NaN/infinite limits can bypass the <= 0 guard. Budget edit parameters are absent from RootStackParamList and hidden by any-typed screens. |
| Dashboard | Partial | All-time income/expense/savings, transaction rows, budget usage and three nearest recurring payments are wired. Recent lists are neither sorted nor limited. Monthly summaries are missing; topCategory and upcomingPaymentsCount in the summary are placeholders. Loading/retry/error handling is missing. |
| Recurring payments | Partial; integrity risks | CRUD, due-date display, overdue indicators on dashboard, and completion creating an expense and advancing the due date exist. Month/year advancement uses Date setters, which overflow month-end/leap-day dates. Completion writes expense and schedule separately with no idempotency, concurrency guard, or recovery after the second write fails. Future payments can be completed repeatedly. No payment-occurrence history. Create/update use cases perform no validation; UI permits NaN and invalid dates. ProcessRecurringPaymentsUseCase is wired but not called by screens; do not re-enable it casually because it skips unpaid overdue occurrences. |
| Reports and analytics | Partial | ReportsScreen selects month/year and displays income, expenses, savings rate, top category and breakdown. GetReportUseCase has a month-filter test. GetMonthlyReportUseCase actually sums all dates. No spending-trend visualization; export only serializes JSON and is not exposed in UI. |
| Financial Goals | Missing | No goal model, repository interface/implementation, use cases, tests, screen, storage key, provider wiring or navigation route in this checkout. No earlier goal implementation found in inspected tracked files/history. |
| Categories | Partial | Shared enum and factory exist; category objects/labels/IDs are constructed inconsistently across screens. No category-management flow. INCOME is offered in recurring-payment category cycling even though completion creates expenses. |
| Persistence | Partial; untested failure paths | Four AsyncStorage repositories reconstruct models and transaction/due dates, and return [] for missing keys. JSON and object shapes are not validated. Read-modify-write operations may lose concurrent updates. Updates silently succeed for missing IDs. Tests exercise fakes, not AsyncStorage round trips, corruption or write failures. |
| Financial accuracy | Requires improvement | Amounts are numbers in major units. Totals and savings use raw floating-point addition/subtraction. There is no finite-value, precision or safe-range policy. Define a compatible money policy and explicit storage-version strategy before changing representation; never silently migrate data. |
| UI and navigation | Partial | Eight screens are reachable from the existing stack; some lists have empty states and save handlers show alerts. No shared component/theme system, comprehensive loading/error/retry states, screen interaction tests, or verified accessibility/device responsiveness. Fixed-layout forms need keyboard/small-screen review. |
| CI and release | CI added in this task; release unverified | No prior workflow. npm lockfile and Jest exist; no lint script/configuration or EAS build configuration. App identifiers, signing and Android/iOS builds remain unverified. No cloud/auth/bank integrations are needed for this MVP. |

Implemented building blocks include core entities/contracts, fake repositories,
AsyncStorage adapters, tested summary/category calculations and recurrence
status labels. No end-to-end feature is certified release-complete: automated
tests do not establish mobile usability or storage reliability.

## Verification

Development checkout (`expo-upgrade`):

- `npm.cmd ci --no-audit --no-fund`: passed, 660 packages installed. Initial
  restricted attempt failed on cache permissions; retry with cache/network
  access succeeded.
- `npm.cmd test -- --watch=false --runInBand`: 26 suites / 60 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- No lint configuration; no lint result claimed.
- No emulator/device test, Android/iOS build or hosted Actions result claimed.

CI checkout (`main` baseline):

- `npm.cmd ci --no-audit --no-fund`: passed, 1,255 packages installed.
- `npm.cmd test -- --watch=false --runInBand`: 1 suite / 1 test passed before
  the configuration change.
- Initial `npx.cmd tsc --noEmit`: failed with TS5107 because Expo's inherited
  node10 module resolution is deprecated by TypeScript 6. This task adds
  `ignoreDeprecations: "6.0"`, matching the existing development checkout.
- After that setting, TypeScript exposed ReportService's use of `date` instead
  of the actual `transactionDate` field. Two regression tests failed before
  applying the existing development branch's correction. The tests cover
  month/year exclusion, January boundaries, and empty/nonmatching periods.
- Final `npx.cmd tsc --noEmit`: passed.
- Final `npm.cmd test -- --watch=false --runInBand`: 2 suites / 3 tests passed.
- `git diff --check`: passed. Workflow YAML was parsed with js-yaml and its
  triggers, app working directory, read-only permission and commands checked.
- Initial hosted Validate run passed installation, TypeScript and Jest:
  https://github.com/sunilkafley/budget_tracker_pro/actions/runs/43842467520
  Its action-runtime deprecation warning prompted checkout/setup-node v6,
  whose manifests use Node 24 internally. App validation still uses Node 22.16.0.
- Main still declares Expo 46 alongside React Native 0.85/React 19. The CI
  change does not certify this mobile runtime combination or upgrade it.

## Remaining sprint plan

Each row is a separate focused branch/PR. Use RED -> GREEN -> REFACTOR for
business changes and existing fakes. Require relevant tests, TypeScript and
updated documentation for every sprint. Split rows further if review grows.

| Order | Sprint | Acceptance criteria and main impacted areas |
| --- | --- | --- |
| 0 | CI (this PR) | Root .github/workflows/ci.yml validates PRs/pushes to main using the app subdirectory, locked npm install, compatible Node, TypeScript and Jest. Read-only token; no deployment/secrets. Document branch divergence and truthful validation results. |
| 1 | Reconcile development baseline | Review the 19 existing commits separately against main, confirm Expo/dependency compatibility, preserve all local work, resolve conflicts and get CI passing. Never merge without user approval. |
| 2 | Money and validation | Define currency/precision limits compatible with existing persisted major units; perform accurate supported monetary arithmetic. Reject NaN, infinity, nonpositive/unsupported-precision amounts, invalid dates and inappropriate categories. Add boundary and repository-failure tests across transaction/budget use cases and domain services. No silent migration. |
| 3 | Transaction editing and categories | Preserve date/category/notes during edits, select consistent expense categories, handle missing records and failed reads/writes, type navigation parameters. Cover use cases and add/edit/delete interactions. Add basic history sorting/filtering using existing repositories. |
| 4 | Budget periods | Calculate usage only in the defined current budget interval; test month/year boundaries and category consistency, zero/over-budget states and repository errors. Consolidate existing calculations without duplicating architecture. |
| 5 | Recurring payment reliability | Define month-end/leap-year and local-date behavior; protect each occurrence against duplicate/concurrent completion and partial failures; preserve unpaid overdue items. Test retries, failed writes and persisted schedule/expense linkage. Add pending/error feedback to both completion entry points. |
| 6 | Financial Goals | Add model/contracts, compatible persistence, CRUD/contributions, positive targets and contribution validation, target dates and progress calculation through existing DI/navigation. Test empty/missing/corrupt storage, failures and target boundaries before UI integration. |
| 7 | Dashboard | Provide accurate current-month summary, sorted limited recent transactions, period-aware budget status and nearest unpaid recurring items. Load/retry/error/empty states; tests verify summary and screen refresh after edits/completion. |
| 8 | Reports | Consolidate monthly aggregation semantics, verify cross-year/empty/negative savings cases, add useful category/trend visuals. Make export/share a separate optional task after the MVP; current serializer alone is not an export flow. |
| 9 | Mobile polish and release | Reuse spacing/formatting/components, improve forms/keyboard/navigation, verify accessible labels/touch targets on small phones/tablets. Add critical AsyncStorage round-trip/corruption/concurrency tests and screen tests. Confirm Expo config/assets/identifiers, then actually build and smoke-test Android/iOS; document platform limitations. No automatic store deployment. |

Next application sprint after baseline reconciliation: money/validation,
followed by transaction preservation and budget-period correctness. Goals
comes after existing financial data can be trusted. Cloud sync and
authentication are deferred beyond the stable local MVP.

## CI operation and PR workflow

The workflow lives at the Git repository root, one level above the app.
All shell steps run in BudgetTrackerPro; npm cache keys use its lockfile.
Node 22.16.0 matches the verified development environment and the locked
React Native engine range. No lint step is added because lint is not configured.
There are no release jobs or credentials. The stable job name is `Validate`.

After a successful hosted run, recommend requiring the `Validate` status check
before merging into main if repository branch protection is available. No
branch protection settings were changed or verified in this task.

GitHub CLI was not found on PATH or in the standard installation location.
The official portable CLI was downloaded to the system temporary directory;
`gh auth status` reported no GitHub login. The default branch was verified via
`git ls-remote --symref origin HEAD`. Push/PR/Actions outcomes must be recorded
separately after execution; a local test pass is not a hosted CI pass.

Run validation from the app directory using Node.js 22.16.0:

```sh
npm ci
npx tsc --noEmit
npm test -- --watch=false --runInBand
```

On Windows PowerShell with script execution disabled, use `npm.cmd` and
`npx.cmd`. An unauthenticated CLI requires an interactive `gh auth login`
before `gh pr create` can open the review. No merge is authorized by this task.

PR created using `gh pr create` with the existing Git credential supplied only
to that process: https://github.com/sunilkafley/budget_tracker_pro/pull/1
No additional login or stored CLI credential was needed. The branch is
`chore/ci-setup`; its isolated checkout is in the system temporary directory.
