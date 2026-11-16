# Expo SDK 58 upgrade

Date: 17 November 2026 (Pacific/Auckland).
Branch: `chore/expo-sdk-58`.
Baseline: `272da68` on `fix/financial-accuracy` (PR #2).

## Problem and scope

The iPhone's installed Expo Go supports SDK 58, while the app declared SDK 56.
That mismatch prevents Expo Go from opening the project before app code runs.
This change upgrades the existing application; it does not recreate it.

Acceptance criteria:

- Expo reports SDK 58 and all managed packages match its compatibility map.
- Preserve the 217 existing tests and pass TypeScript.
- Produce an iOS JavaScript/asset export and serve an iOS development bundle.
- Verify the development manifest advertises `sdkVersion: "58.0.0"`.
- Preserve business logic, repository contracts, storage keys and JSON formats.
- Document how to start the upgraded checkout and the remaining phone checks.

## Upgrade path

Followed [Expo's incremental upgrade guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
and reviewed the [SDK 57](https://expo.dev/changelog/sdk-57) and
[SDK 58](https://expo.dev/changelog/sdk-58) release notes and versioned docs.

First upgraded to Expo 57.0.33 with React Native 0.86.3. The initial install
exposed the old @react-native/jest-preset peer requirement; aligning it to
0.86.3 and installing the SDK 57 Babel preset resolved the conflict. At that
intermediate point TypeScript, all 217 tests and Expo dependency checks passed.

Then installed SDK 58 packages using the published compatibility map from
expo@58.0.25 and ran `expo install --fix`. Expo also required Jest 30 and its
types. Babel-Jest was aligned with Jest 30. No --force or --legacy-peer-deps
installation was used. npm install displayed transitional peer warnings while
replacing the old dependency tree; a final clean lockfile install passed.

| Package | Previous baseline | SDK 58 version |
| --- | --- | --- |
| expo | 56.0.12 | 58.0.25 |
| react | 19.2.3 | 19.3.0 |
| react-native | 0.85.3 | 0.88.1 |
| expo-status-bar | 56.0.4 | 58.0.5 |
| react-native-screens | 4.25.2 | 4.30.1 |
| react-native-safe-area-context | 5.7.0 | 5.11.1 |
| babel-preset-expo | 56.0.15 | 58.0.25 |
| @react-native/jest-preset | 0.85.3 | 0.88.1 |
| jest / babel-jest | 29.7.0 | 30.5.2 |
| @types/jest | 29.5.14 | 30.0.0 |
| @types/react | 19.2.2 | 19.3.0 |

AsyncStorage remains 2.2.0 and Picker remains 2.11.4, as recommended by the
SDK 58 compatibility map. Navigation packages keep their existing version
ranges; the lockfile captures the resolved tree. TypeScript stays 6.0.3.
Node 22.16.0 is used locally and in CI and satisfies SDK 58's engine range.

There are no generated native ios/android folders to migrate. app.json does
not override sdkVersion, so Expo derives it from the installed SDK. App
identity, assets and native app configuration are preserved. No domain,
application, screen, persistence or test source files changed in this upgrade.

## Verification

Final checks after the SDK 58 clean install:

- `npm.cmd ci --no-audit --no-fund`: passed, 865 packages installed.
- `npx.cmd expo install --check`: dependencies up to date.
- `npx.cmd expo-doctor@latest`: 20/20 checks passed (expo-doctor 1.21.8).
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd test -- --watch=false --runInBand --silent`: 30 suites / 217 tests passed.
- `npx.cmd expo export --platform ios --output-dir <temporary-directory>`:
  passed, 904 modules bundled and a Hermes bundle plus assets exported.
- Temporary server: `expo start --go --offline --port 8093`. An iOS protocol
  request returned HTTP 200 and sdkVersion 58.0.0; its launch asset returned
  HTTP 200 with a 4,808,211-byte development bundle (1,021 modules).
- The temporary verification server was stopped. Existing user servers were
  not stopped. Offline manifest requests logged asset-resolution timeout
  warnings; app icons/launch visuals still require device verification.
- `git diff --check`: passed.

CI now checks the Expo dependency map and exports an iOS JavaScript bundle,
in addition to lockfile installation, TypeScript and Jest. The export goes
to the runner's temporary directory and is not committed or published.
These checks validate dependency and bundling compatibility, not a signed
native application or physical-device launch. Lint is not configured. No
new tests were added because this task changes dependency/configuration and
documentation rather than business rules.

## Test on the iPhone

Use the app directory on the `chore/expo-sdk-58` branch. In this session, the
upgraded checkout is at:

```powershell
cd "$env:TEMP\budget-tracker-pro-ci-20261116\BudgetTrackerPro"
git branch --show-current
npm.cmd start -- --clear
```

Stop the previous Expo terminal with Ctrl+C before starting this command.
Scan the new QR code with iPhone Camera and open it in the SDK 58 Expo Go
already installed on the phone. Keep both devices on the same network and
allow Expo Go local-network access. For network problems, `npm.cmd start --
--tunnel` is an optional fallback. If Expo asks for sign-in, use the same
Expo account in the CLI and Expo Go.

The original D-drive checkout remains on expo-upgrade/SDK 56 with its local
AGENTS.md modification and parent README deletion preserved. Starting Expo
there still serves SDK 56. Neither original local change is in this PR.

Verify dashboard navigation, add/edit/delete income and expenses, exact
0.10 + 0.20 totals, budgets, reports and recurring-payment completion. Restart
Expo Go and confirm saved data remains. These phone interactions were not
executed by the agent. No iOS/Android native build, signing, deployment or
store release was performed, and no paid service was configured.

## PR dependency

PRs #1 and #2 were still open when this branch started. The SDK upgrade is
one focused commit above PR #2. Its draft PR targets main as required by
the project workflow and therefore includes those pending baselines until
they merge. Review the incremental SDK diff against fix/financial-accuracy.
No PR is merged and no branch history is rewritten by this task.
