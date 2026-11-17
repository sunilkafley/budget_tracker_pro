# Quick-add popup animation

Date: 18 November 2026 (Pacific/Auckland).
Branch: `fix/quick-add-popup-animation`. Baseline: `37c8fe8` (PR #11).

The owner reported a full-screen transparent layer appearing before popup
contents. The quick-add Modal used native slide animation, which moves its
entire full-screen container, including the backdrop, rather than just the menu.

The native Modal now appears without a slide transition, using transparent
over-full-screen presentation. Its fixed dimmed backdrop and fully opaque menu
are present together. Only the panel translates 12 points into place over
160 ms, using the native animation driver when onShow fires. Content is never
held at opacity zero while waiting for that callback. The position resets on
every open and animation is stopped on unmount.

The four choices, backdrop/close cancellation, duplicate-selection guard and
iOS dismiss-before-navigation queue are unchanged. No financial logic, stored
data, dependencies or lockfile changes.

Verification:

- Two UI regressions failed before implementation and now pass. They check
  immediate panel content/no full-screen slide and panel-only native animation.
  Existing menu/navigation regressions continue to pass.
- `npm.cmd test -- --watch=false --runInBand --silent`: 40 suites / 309 tests passed.
- `npx.cmd tsc --noEmit` and `git diff --check`: passed.
- `npx.cmd expo export --platform ios --output-dir .expo/quick-add-popup-animation-ios`:
  passed; 1,048 modules and Hermes bundle/assets exported to ignored output.
- Lint is not configured. No phone/simulator animation measurement, screenshot
  or native build was performed. Physical iPhone appearance still needs review.

Reload Expo Go and open + several times. Check the backdrop stays still while
the populated panel settles into place. Try closing via backdrop/X and selecting
each destination to confirm navigation still waits for dismissal on iPhone.

The PR targets main and depends on PR #11 and earlier unmerged baselines. User
AGENTS.md edits and parent README deletion remain excluded. No merge/force push.
