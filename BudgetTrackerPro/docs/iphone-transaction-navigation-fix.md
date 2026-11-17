# iPhone transaction navigation fix

Date: 18 November 2026 (Pacific/Auckland).
Branch: `fix/iphone-transaction-navigation`. Baseline: `9ca10c7` (PR #9).

## Report and change

The owner completed the iPhone review and reported that tapping + and recent
activity produced no visible result. Both + and recent-row editing target the
transaction routes that were switched to custom fractional native form sheets
in the preceding layout pass. The separately labelled See all action targets
the Activity tab.

- Restore standard native `modal` presentation for AddExpense/AddIncome and
  remove custom form-sheet detents/grabber/corner options. The existing compact
  editor, explicit close control and keyboard-aware scrolling remain.
- `useRootNavigation` resolves the parent stack from a tab, falling back to the
  current navigation object when already at the root. Shared +/header/quick-add
  actions and transaction-row actions use that stack explicitly. Tab actions
  such as See all continue to use the tab navigator.
- Give the floating + an explicit zIndex so the scrolling content cannot cover
  its touch area. Existing floating-button size/position are unchanged.
- No transaction calculations, validation rules, use cases or persisted data
  change. No Financial Goals implementation is included in this focused fix.

These changes remove two potential failure points. The exact native cause was
not reproduced in an iOS simulator/device by the agent, and the owner must
confirm the corrected behavior after a full Expo Go reload. Navigation actions
can normally bubble between navigators; explicit parent dispatch here makes
the intended route owner unambiguous rather than claiming all bubbling fails.

## Regression coverage and verification

The UI suite runs the production components and React hooks with native hosts,
navigation objects and repository-boundary readers mocked. It presses the +,
Home and Activity income/expense rows, and See all; verifies the registered
modal presentation; checks new/edit form content, close/kind-switch callbacks,
and a retry state for a missing transaction. Root-level fallback is covered.
It does not simulate UIKit presentation, hit testing or native gestures.

The first eight tests ran before implementation: four failed for explicit
root-stack dispatch and the registered custom form-sheet options. After the
fix and four additional cases, all twelve pass. The separate See all action
already passed and is retained.

Added dev-only react-test-renderer 19.3.0 (matching React) and its 19.1.0
TypeScript types to mount the actual components without adding a production UI
library or changing the existing Jest configuration. The renderer's deprecation
notice is filtered only in this suite; other console errors remain visible.

- `npm.cmd test -- --watch=false --runInBand --silent`: 40 suites / 299 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `npx.cmd expo export --platform ios --output-dir .expo/iphone-navigation-fix-ios`:
  passed; 1,048 modules and Hermes bundle/assets exported into ignored output.
- `git diff --check`: passed.
- Lint is not configured. No new native dependencies or native build.
- Physical-device confirmation is outstanding until the owner retries the
  reported taps. No agent-operated iPhone/simulator test or screenshot is claimed.

## iPhone recheck and next sprint

The owner confirmed + opens the editor, then requested the earlier four-option
menu and reported a second modal entrance when switching to Income. The
[quick-add follow-up](quick-add-menu-fix.md) restores that menu, waits for its
iOS dismissal before navigation, and switches transaction kind within one form.

Fully reload Expo Go so its navigation tree is recreated. From Home, tap + and
confirm New transaction is visible. Close it, tap one recent expense/income and
confirm Edit transaction loads the right amount/title. From See all, verify
Activity opens and its rows also edit. Switch Expense/Income while creating a
record; close/save should return to the originating tab. Test once from another
tab to confirm the shared + works throughout the app.

The next planned feature sprint remains Financial Goals after these fixes are
confirmed on the phone. This PR targets main and depends on PR #9 and earlier
unmerged baselines. Original AGENTS.md edits and parent README deletion remain
excluded. No PR merge or force push is performed.
