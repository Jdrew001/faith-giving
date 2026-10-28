# Frontend theme and validation

The Faith Tabernacle dark theme is the primary presentation for every donor and
guest. It applies from the initial document load through sign-in, verification,
gift entry, saved and new cards, processing, receipts, and profile management.
Poppins is served from the application assets, including the Stripe font setup.

The `beta_access` presentation flag, its donor targeting client, disabled asset,
and deployment asset generator have been removed. The frontend no longer reads
Firebase Remote Config or uses the `FAITH_GIVING_FEATURE_FLAGS_ENABLED` and
`FAITH_GIVING_FIREBASE_*` deployment settings. Existing remote parameters and
settings can remain during rollout for older cached clients; they do not affect
this version. The API retains its independent Firebase dependency.

## Local validation

Use Node 20 with the committed lockfile:

```sh
npm ci --force
NX_DAEMON=false npx nx test faith-giving-ui --runInBand --skip-nx-cache
NX_DAEMON=false npx nx build faith-giving-ui --configuration=production --skip-nx-cache
```

`--force` permits the existing legacy peer constraints. API packaging and its
runtime checks remain independent of the frontend theme.

For the controlled browser smoke check, start the production preview:

```sh
node tools/serve-giving-smoke.mjs
```

In another terminal, with `playwright-cli` available:

```sh
bash tools/run-giving-browser-smoke.sh
```

Set `GIVING_PWCLI` to the Codex wrapper path if needed. The preview uses
`127.0.0.1:48179`; type `stop` to shut it down. The fixture intercepts session,
OTP, reference, totals and Stripe responses and blocks external traffic. It checks
guest startup without Firebase, session restoration, account switching, logout,
saved-card processing and receipt, card navigation and responsive layouts at
320, 390, 768 and 1280 pixels. Screenshots are written under `output/playwright/`.
It rejects any feature-flag configuration or Firebase requests.

These checks use simulated authentication and payment responses. They do not
establish OTP delivery, live charges, Stripe iframe rendering or deployment.

## API deployment runtime

The SSH deploy step prepends `~/apps/faith-giving-api/shared/runtime/bin` to
`PATH`. Provision a supported Node LTS release and npm in that dedicated directory
before deploying if the host's default Node is older than 20. Keep the runtime
outside `FAITH_GIVING_SERVICE_DIR`, whose contents are replaced during deployment.
The system Node installation and other applications can retain their own runtimes.

The existing Faith Giving PM2 daemon must also run Node 20 or newer. Its cluster
workers inherit the daemon's Node executable, so changing the deploy shell's
`PATH` or adding an app interpreter does not upgrade an already-running daemon.
The deployment checks both runtimes before replacing API files, installing
dependencies, or running migrations. A stale PM2 PID file without a live daemon
does not prevent deployment; PM2 can start under the selected runtime.

Upgrading a live PM2 daemon restarts its managed processes. Check which applications
it owns and arrange the runtime change separately from the build. After the
upgrade, update any PM2 boot service to use the same runtime and verify the API
process's executable, its saved configuration, and its health. Do not run a shared
daemon upgrade merely to change one application's runtime.

