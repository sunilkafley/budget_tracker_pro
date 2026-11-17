# Reference layout refinement

Date: 18 November 2026 (Pacific/Auckland).
Branch: `polish/reference-layout-details`.
Baseline: `bfd04b3` (`polish/reference-mobile-experience`).

## Changes

This pass refines the existing mobile UI against the supplied transaction,
budget, overview and transaction-sheet screenshots. It uses existing SVG icons,
native navigation and gradient support. No domain/application/persistence logic,
saved categories, financial data, dependency manifests or lockfiles change.

- Shared transaction rows now place category icon, title/subtitle, right-aligned
  signed amount and delete action in one horizontal card. Merchant titles
  truncate first. Amounts stay complete; large text or very large amounts use
  a taller layout. Both Home and Activity use the same component.
- Activity has a shorter merchant/category search field and compact filter
  styling. All/Expenses/Income filtering, repository errors, empty/no-match
  states, deletion confirmation and edit actions retain their existing logic.
- Budget cards place the icon, title/status, spending subtitle and Cap edit
  pill above the progress bar. Delete is an icon in the utilization/remaining
  row. Weekly/yearly periods retain visible date labels; monthly scope is
  stated in the page title and expandable footer details. Mixed frequencies
  use the Category budgets title. Monthly aggregate/duplicate-cap explanations
  remain in the details footer; Create budget remains visible there.
- Home has a compact purple gradient overview, month pill, usage bar and income/
  expense metrics. Scope labels preserve the existing difference between current
  calendar budget usage and through-today income/expenses. Cashflow links to
  Insights, watchlist cards are compact tappable cards, and five recent entries
  appear before the existing upcoming-payments section.
- Headers use tighter spacing and outlined circular refresh/recurring actions;
  the bottom tabs have a pale purple selected-icon background. The floating +
  opens a transaction sheet directly. Holding it retains the existing broader
  quick-add menu. Recurring payments remain reachable from the header.
- Transaction routes use native formSheet presentation with grabber and rounded
  corners, a 92% detent, an in-form heading/close action and a compact editor.
  Expense/Income switching, amount, merchant, categories and date are grouped
  without a second nested card. At ordinary phone widths category tiles form
  four columns; narrow screens/large text reduce columns. Optional notes expand
  from the date-label row; existing notes expand on load and are preserved when
  hidden. Income source and original date hints remain available.
- Text/status colors are darker than some reference pixels for readability;
  green/amber progress fills retain the reference's softer colors. Touch
  actions retain at least 44-point areas (the 40-point switch has hit slop).

## Verification

- `npm.cmd ci --no-audit --no-fund`: passed; 881 packages restored from lockfile.
- `npm.cmd test -- --watch=false --runInBand --silent`: 39 suites / 287 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `npx.cmd expo export --platform ios --output-dir .expo/reference-layout-ios-export`:
  passed; 1,047 modules and Hermes bundle/assets generated in Git-ignored output.
- `git diff --check`: passed.
- No test files were added/changed: this pass changes presentation and navigation
  presentation options, not financial behavior. Existing financial/edit/filter/
  recurrence suites pass. Lint is not configured.
- A separate web-preview server on port 8095 was started. Browser automation
  was unavailable and native app selection timed out waiting for approval.
  No browser screenshot or rendered visual/interaction result is claimed.
  That server was stopped and temporary web-preview packages were removed by
  reinstalling the exact committed lockfile. The existing iPhone server was
  not intentionally stopped.
- The original port 8081 was no longer listening when checked after cleanup;
  started `npm.cmd start -- --go --clear --port 8081` for the iPhone review.
  Its iOS manifest reports SDK 58.0.0 and returns HTTP 200; the iOS development
  bundle also returns HTTP 200. This verifies serving/bundling, not a phone launch.
- No physical iPhone interaction test, signed native build or deployment was
  performed. A successful JavaScript export does not verify native sheet
  behavior, keyboard avoidance, VoiceOver or pixel matching on a device.

## iPhone review and limits

Reload Expo Go from the D-drive checkout (or restart with
`npm.cmd start -- --go --clear`). Review populated and empty Home/Activity/
Budgets screens; confirm amounts sit on the right and titles truncate safely.
Try long titles, very large amounts and larger accessibility text. Exercise
search/type filters, tab selection, refresh, edit/delete confirmations, Cap,
budget details and recurring navigation. Tap + and check close, kind switching,
scrolling with the keyboard, category selection, date validation, notes, source,
save errors and a successful save returning to the originating tab.

The app retains Budget Tracker Pro branding and its supported category enum;
reference-only Food/Shopping/Utilities categories, dark mode and reset are not
introduced. Date entry retains strict YYYY-MM-DD validation rather than adding
a native date-picker dependency. Reference sample balances/merchants are not
inserted into persisted data. Device feedback is needed for final visual tuning.

The PR targets main and depends on the existing reference-mobile-experience PR
and earlier unmerged baselines. Review this incremental change against
`polish/reference-mobile-experience`. User AGENTS.md edits and the parent README
deletion remain excluded. No PR is merged or branch history rewritten.
