# Frontend feature flags

Faith Giving has an Angular 15 integration with `@feature-gates/core` and
`@feature-gates/firebase`. It exposes the `betaAccess` decision from the Firebase
Remote Config Boolean parameter `beta_access`. This foundation does not alter the
giving flow, payment methods, or profile UI.

The browser console logs `beta_access is enabled` or `beta_access is disabled`
after the first settled decision and when its enabled state changes. Pending
decisions are not logged; unavailable configuration or Firebase settles to the
disabled fallback. This flag is the first catalog entry, not a limit: additional
independent flags can be registered in `FEATURE_CATALOG` with their own Firebase
parameter names and fallbacks.

## Enable Firebase configuration

### ShipStack deployment settings

Add these project secrets in ShipStack for the branch you deploy (normally
`master`), or use `*` for values shared by every branch:

| Name                                 | Value                                                |
| ------------------------------------ | ---------------------------------------------------- |
| `FAITH_GIVING_FEATURE_FLAGS_ENABLED` | `true` to enable, `false` or unset to disable        |
| `FAITH_GIVING_FIREBASE_API_KEY`      | Firebase **web app** `apiKey`; required when enabled |
| `FAITH_GIVING_FIREBASE_PROJECT_ID`   | Firebase `projectId`; required when enabled          |
| `FAITH_GIVING_FIREBASE_APP_ID`       | Firebase **web app** `appId`; required when enabled  |

The pipeline writes `dist/apps/faith-giving-ui/assets/feature-flags.json` after
the frontend build and before packaging. This also runs when Nx restores cached
build output, so a changed ShipStack setting produces a fresh asset. The committed
source asset stays disabled. Missing/disabled settings produce `{"enabled":false}`;
invalid enabled settings stop the build before packaging. Values are not logged.

ShipStack stores these alongside secrets, but the three Firebase fields become
public browser configuration in the deployed asset. Only these explicitly named
fields are copied; server credentials, private keys and other project secrets
stay out. See [Firebase's API key guidance](https://firebase.google.com/docs/projects/api-keys).

After deployment, `/give/assets/feature-flags.json` should contain the selected
configuration. Serve this stable asset with revalidation/no-cache so browsers do
not retain configuration from a previous deployment. Changing ShipStack settings
requires another frontend build/package/deployment. Changing donor targeting in
Firebase Remote Config does not require rebuilding the app.

### Manual or local configuration

The committed `apps/faith-giving-ui/src/assets/feature-flags.json` is disabled:

```json
{ "enabled": false }
```

For an approved environment, replace it with Firebase's **browser app** configuration:

```json
{
  "enabled": true,
  "firebase": {
    "apiKey": "YOUR_BROWSER_API_KEY",
    "projectId": "YOUR_PROJECT_ID",
    "appId": "YOUR_BROWSER_APP_ID"
  }
}
```

`authDomain` and `messagingSenderId` are optional string fields. These are public
browser configuration values; do not put service-account JSON or private server
credentials into this asset. The frontend resolves the asset against its base URL,
including the production `/give/` path.

ShipStack's generated asset replaces the source configuration in the deployment
package. For a local production preview using environment settings, run
`node tools/write-feature-flags-config.mjs` after building the frontend.

Root startup is non-blocking. Disabled, missing, invalid, or failed configuration,
unsupported browser storage, and unavailable Firebase use the off fallback. Core
settles pending decisions within three seconds of each context change, including
initial configuration loading. A later successful setup or live Firebase update can
recover the decision. Configuration is loaded once; donor changes do not reload it.

## Configure donor targeting in Firebase

In Firebase Console Remote Config:

1. Add the Boolean parameter `beta_access` with default `false`.
2. Add a custom-signal condition for `donor_id` matching your selected donor UUIDs.
   Choose exact matching against multiple values and enter the allowlisted donor
   UUIDs as normalized lowercase values. The equivalent condition expression is
   `app.customSignal['donor_id'].exactlyMatches(['UUID_ONE', 'UUID_TWO'])`,
   replacing the placeholders with real lowercase UUIDs. It matches any listed
   value, case-sensitively. See the [Firebase condition reference](https://firebase.google.com/docs/remote-config/condition-reference).
3. Set the conditional value to `true` and publish the template when approved.

Faith Giving supplies only the authenticated donor UUID as `donor_id`. Guests,
missing/invalid IDs, and successful logout explicitly unset the signal with `null`.
Firebase persists custom signals, so clearing it is part of account isolation.
Login/session restoration remains owned by the existing authentication flow. There
is no beta field, opt-in setting, or membership migration in the API.

Remote Config controls presentation rollout. Client-side donor signals are not
authorization and do not grant access to protected data or payment operations.

## Read a decision in a component

Create the observable once in the component:

```ts
readonly betaAccess$ = this.featureFlags.decision$('betaAccess');

constructor(private readonly featureFlags: FeatureFlagsService) {}
```

Then use the async pipe:

```html
<ng-container *ngIf="betaAccess$ | async as decision">
  <app-future-beta-feature *ngIf="decision.enabled"></app-future-beta-feature>
</ng-container>
```

`app-future-beta-feature` is illustrative, not an existing component. Decisions
include `enabled`, `status`, `source`, and an optional fallback `reason` so callers
can distinguish a pending/off decision from a resolved one. SDK updates emit inside
Angular; unsubscribing removes the listener. The root service starts automatically.

For a future giving/payment feature, select the experience once before starting an
attempt, then hold it through form entry and payment:

```ts
const decision = this.featureFlags.snapshot('betaAccess');
const useBetaExperience = decision.status === 'ready' && decision.enabled;
```

Use the existing experience for pending or degraded decisions. Re-evaluate at the
next attempt, not during the current payment flow. The integration intentionally
adds no feature-gating directives or changes to current giving components.

## Verify an enabled environment

Check an allowlisted donor, a non-allowlisted donor, logout, and account switching
in the same browser. Also check configuration/network failure and live template
updates. Local automated tests validate integration behavior with a controlled SDK
boundary; they do not establish live Firebase evaluation or deployed behavior.

## Reproduce local validation

Use Node 20 for the application. Install from the committed archives and lockfile:

```sh
npm ci --force
NX_DAEMON=false npx nx build faith-giving-ui --configuration=production
NX_DAEMON=false npx nx build faith-giving-api --configuration=production
npx jest --config apps/faith-giving-ui/jest.config.ts --runInBand --runTestsByPath \
  apps/faith-giving-ui/src/app/core/services/feature-flags.config.spec.ts \
  apps/faith-giving-ui/src/app/core/services/feature-flags.provider.spec.ts \
  apps/faith-giving-ui/src/app/core/services/feature-flags.service.spec.ts \
  apps/faith-giving-ui/src/app/app.component.spec.ts
npx jest --config apps/faith-giving-api/jest.config.ts --runInBand --runTestsByPath \
  apps/faith-giving-api/src/app/auth/auth.controller.spec.ts
```

`--force` permits the legacy peer constraints, including the existing Nest
Firebase wrapper's Firebase 9 peer range.
The shared application's Firebase version is pinned to 12.19.0. Verify the generated
`dist/apps/faith-giving-api/package.json` contains that version and no
`@feature-gates/*` runtime dependencies.

Before packaging, the pipeline normalizes Nx's generated API dependency lockfile
with `npm install --package-lock-only --ignore-scripts --force`. This completes
dependency alias entries omitted by the existing Nx version without running
package scripts. The SSH deployment then refreshes API runtime dependencies from
that packaged manifest and lockfile with `npm ci --omit=dev --force` before
migrations and PM2 reload, installing the pinned Firebase 12.19.0 rather than
keeping an older server installation. This requires Node 20 or a compatible
supported Node version and npm on the API server. Local checks do not update the
live server.

Check the public asset generator with:

```sh
node --test tools/write-feature-flags-config.test.mjs
```

For the controlled browser smoke check, install `@playwright/cli` separately and
use Chrome. In one terminal, start the static production preview:

```sh
node tools/serve-feature-flags-smoke.mjs
```

In another terminal, run:

```sh
bash tools/run-feature-flags-browser-smoke.sh
```

Set `FEATURE_FLAGS_PWCLI` to a wrapper or executable path if it is not on your PATH.
The preview uses only `127.0.0.1:48179`; type `stop` in its terminal to shut it down.
The fixture intercepts Firebase, OTP, session, reference, totals and Stripe
responses and blocks other external traffic. It verifies guest startup, session
restoration, card-details navigation, OTP sign-in, logout and account switching.
It never submits a payment. Screenshots are written under `output/playwright/`.

See [vendored package regeneration](../vendor/feature-gates/README.md) for
independent source and compatibility checks with Node 24.
