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

## API migration package validation

`apps/faith-giving-api/package.json` explicitly declares `pg` and `dotenv` as
production dependencies. Nx discovers normal imports, but TypeORM loads the
PostgreSQL driver dynamically and the migration entry point is written after the
build. These runtime requirements must remain in the API manifest so production
installs include them.

Before upload, `tools/verify-api-package.cjs` checks that the generated manifest
and normalized lockfile include PostgreSQL, dotenv and TypeORM as production
dependencies. After the server's production install, it loads those packages from
that installation and constructs the migration data source before migration
execution. Validation does not open a database connection or run migrations.

Run the package regression checks with:

```sh
node --test tools/verify-api-package.test.cjs
```

### Migration-driver repair — October 27, 2026

The original generated API package omitted `pg`. A fresh production API build now
includes `pg` and `dotenv` explicitly, and its normalized lockfile passes the
package guard. A clean production-only install under the server's Node 24.22.1
loaded the packaged migration source successfully without a database connection.

The deployed package's manifests were backed up and the missing driver installed.
A read-only database check confirmed that all nine migrations were already applied.
The original migration command then passed with no pending migrations, and the
halted API deployment was completed by reloading the API and saving its PM2
configuration. The replacement API worker runs Node 24.22.1; the public API returns
HTTP 200. The 14 package/runtime regression tests and pipeline syntax checks pass.
The temporary clean-install directory was removed after validation.

## API deployment runtime

API deployments package `tools/prepare-api-runtime.cjs` and run it on the SSH host
before replacing application files or running migrations. The bootstrap installs
Node **24.22.1** and its bundled npm under
`~/apps/faith-giving-api/shared/runtimes/`, then selects it through the stable
`~/apps/faith-giving-api/shared/runtime` link. It verifies the archive against the
pinned SHA-256 hashes from [Node's official release files](https://nodejs.org/dist/v24.22.1/SHASUMS256.txt).
A healthy matching runtime is reused on subsequent deployments. Downloads and
validation finish before the selected runtime changes; staging files are removed
on failure, and older runtime directories remain available for recovery.

The bootstrap also updates the existing `pm2-<deploy-user>.service` boot service
with a dedicated override that runs all PM2 commands with the selected Node
executable. The PM2 process home and saved application configuration are retained.
It upgrades a running daemon only when its Node version differs, then checks the
API's local `/api` endpoint. This requires passwordless sudo for the boot
service configuration. The system Node installation is left in place.

Before any daemon restart, both its live and saved process lists must contain only
`faith-giving-api`. If another application shares that PM2 home, setup stops before
restarting it. An existing systemd PM2 boot service is required. Private backups of
the saved process list and previous override are stored under
`~/apps/faith-giving-api/shared/pm2-runtime-backup-*`. The setup restores the prior
boot override and restarts the service if activation fails.

The deployment retains its runtime checks before API replacement, dependency
installation and migrations. Keep the shared runtime directory outside
`FAITH_GIVING_SERVICE_DIR`, whose contents are replaced during deployment.

Verify the bootstrap and its failure cases with:

```sh
node --test tools/prepare-api-runtime.test.cjs
```

To update Node, change the pinned version and both architecture checksums in the
bootstrap together, then run its checks and validate the API. PM2's startup
configuration must follow the selected runtime; see the [PM2 startup guidance](https://pm2.keymetrics.io/docs/usage/startup/).

### Server verification — October 27, 2026

The dedicated runtime and PM2 boot override were applied to the production server.
The PM2 daemon and the API worker both use Node 24.22.1. The boot service is enabled
and active. The local and public API each returned HTTP 200 after the restart.
All 18 external imports from the deployed API bundle loaded under the new runtime.
Repeating setup preserved the daemon PID, and the exact archive-based pipeline
preflight passed without replacing application files or running migrations.
The runtime's eight automated tests and the pipeline's YAML/shell checks passed.
Application deployment was not rerun as part of this runtime repair.
