# Faith Giving redesign QA

## Single URL follow-up — October 27, 2026

The live frontend now uses one address, `/give/`, for every authentication and
giving screen. The old Angular route tree was removed and replaced by in-page
view state. The initial HTML is dark, production CSS loads before the UI paints,
and the nginx giving location revalidates assets with `Cache-Control: no-cache`.

The production build is `0b2c7f13b352c579` / `main.7763e687741fa25f.js` (1.83 MB
initial bundle). All 35 frontend tests passed with no new lint findings. Local and
production-asset browser smoke checks passed for startup, legacy-link cleanup,
session restoration, OTP sign-in, guest entry, account switching, logout, card
navigation, processing and receipts. Each screen retained the exact `/give/` URL.
Authentication and payment transitions in that smoke use controlled responses;
no real OTP or charge was submitted. Responsive captures cover 320, 390, 768 and
1280 pixels. Evidence is in `output/playwright/*single-url*.log` and the screenshots.

The static frontend was replaced on the live server after saving a recoverable
copy of the prior frontend and nginx configuration. HTTP checks confirm the new
bundle, dark initial HTML, render-blocking styles and cache revalidation headers.
The deployed UI metadata is `1.0.4-build.1793150366`. A fresh anonymous browser
entry also confirmed `/give/` with the black background using the real session
endpoint; capture: `output/playwright/single-url-live-sign-in.png`.

## Primary theme follow-up — October 27, 2026

The dark theme is now unconditional. The presentation flag, Firebase browser
client, deployment configuration generator and legacy templates/styles have been
removed. The checks below describe the original October 20 rollout; current
validation uses [the primary-theme workflow](docs/frontend-validation.md).

Current validation passed:

- 13 frontend suites / 34 tests, including processing DOM preservation, repeat
  payment suppression, Stripe styling/readiness, ZIP handling and profile behavior.
- Production frontend build `f66fb9393e0fbad1`; initial bundle 1.91 MB, below the
  2 MB warning limit. Two existing CSS selector optimization notices remain.
- Controlled Chrome smoke: guest startup without Firebase, invalid guest
  validation, session restoration, OTP sign-in, account switching, logout,
  new-card navigation, simulated saved-card processing, receipt and Done.
- No feature-flag asset or Firebase requests, unexpected API calls, or browser
  runtime errors. Authentication and payments use fixture responses.
- Desktop/mobile captures at 1280, 768, 390 and 320 pixels; no horizontal overflow
  at the mobile/tablet widths. Desktop and 390px guest captures were visually
  inspected. Evidence: `output/playwright/primary-*.png`.
- Lint comparison across all 27 modified frontend TypeScript/template files found
  no new findings; 7 existing errors and 9 existing warnings remain.
- No deployment, Firebase template change, real OTP or live charge occurred.

## Original redesign validation — October 20, 2026

final result: passed

## Source and scope

- Stitch project: https://stitch.withgoogle.com/projects/13478507951163706242
- Reference captures: `docs/stitch-tabernacle-redesign/*-tabernacle-final-desktop.png`.
- Implementation: the existing Angular app on `feature/faith-tabernacle-giving-redesign`.
- All redesigned presentation uses the existing Firebase Boolean `beta_access`.
- No Firebase template, deployment, real OTP, or live payment was changed.

## Visual comparison

The guest desktop reference and implementation were opened together at a nominal 1280px viewport. The final comparison is `docs/stitch-tabernacle-redesign/implementation/giving-desktop-comparison-final.png`. The implementation retains the 600px card, Poppins font, #0b0b0b canvas, #151515 card, #202020 controls, #2a2a2a borders, white pill CTA, and responsive shared header/footer.

The initial spacing and field-density mismatch was fixed and recaptured. The 320px payment label and fee text were adjusted for readability. The returning heading uses the reference's 24px scale. Remaining small differences in badge, icons, text casing, and section spacing are P3 polish. The phone field preserves the existing US phone input behavior. Amounts, categories, donor details, totals, saved cards and receipt lines come from existing application data rather than illustrative source values.

Desktop source/implementation pairs for guest, returning, saved-card, sign-in, processing and receipt screens are saved as `implementation/*-comparison-final.png`. The processing overlay retains the underlying payment DOM and its height to avoid destroying Stripe controls. A standard PrimeIcons spinner replaces the illustrative source icon. Sign-in, verification and profile captures were taken before the flag wrapper; the final gated browser checks cover giving, saved cards, card navigation, processing, receipt, targeting and logout.

Generated PDF actions, unsupported recurring giving, and illustrative provider/security claims were omitted. The existing print receipt action remains available. Stitch mobile generation was quota-blocked; responsive implementation uses the desktop design direction.

## Behavior and rollout evidence

- 62 frontend tests pass, including the actual feature client with a controlled Firebase runtime.
- Ready true enables the redesign. Pending, degraded, false, or unavailable configuration retains the original experience.
- First interaction locks the choice through the gift. Tests preserve payment DOM identity across a flag change and apply the latest choice on Done/exit.
- New-card tests cover the existing Stripe boundary, field readiness, leading-zero ZIP codes, validation and repeat-submit suppression.
- Controlled browser smoke passes for disabled guest startup, beta/regular donors, session restoration, OTP sign-in, logout, account switching, saved-card processing, receipt and Done. No uncaught browser errors or unexpected API calls were observed; external requests outside the controlled fixture were blocked.
- Browser captures at 320, 390, 768 and 1280 pixels show no horizontal overflow. Card navigation was also checked at 390px. Stripe fields are stubbed in the browser harness; their style configuration is asserted at the component boundary. Iframe rendering, deployed font delivery and live charges are not established by this harness.
- Production build passes, with initial bundle and retained legacy component stylesheet size warnings.
- Repository lint remains blocked by 21 existing errors and 26 warnings; no new lint errors remain.
- Earlier full repository tests found 9 existing backend suite failures (7 service suites and 2 API suites). No backend sources were changed.

## Reproduction

Use Node 20 and the repository's installed dependencies:

```sh
NX_DAEMON=false npx nx test faith-giving-ui --runInBand --skip-nx-cache
NX_DAEMON=false npx nx build faith-giving-ui --configuration=production --skip-nx-cache
node tools/serve-feature-flags-smoke.mjs
# In another terminal, with playwright-cli available:
bash tools/run-feature-flags-browser-smoke.sh
```

The production build's initial output is 2.20 MB (2 MB warning, 5 MB error limit).
The retained legacy giving stylesheet is 11.96 kB (8 kB warning, 12 kB error limit).

## Evidence limits

Local browser checks use controlled Firebase, authentication and payment responses. They do not prove deployed Firebase targeting, OTP delivery, Stripe processing or production behavior. Rollout remains subject to the existing Firebase environment configuration and approved template targeting.

## Wordmark follow-up - October 20, 2026

The requested bracketed wordmark follows **Faith Tabernacle - Homepage Hero Redesign**
in the [Faith Tabernacle Stitch project](https://stitch.withgoogle.com/projects/12573781095477606846),
screen `50a96e22be684c9988a61d29dd1bd679`. The header now presents widely spaced
uppercase **Faith Giving** inside a thin square-bracket frame. The small church
association label beside it was removed. This update remains within the existing
`beta_access` presentation gate; the legacy header is unchanged.

The production build passed with the previously documented size warnings. A
targeted browser check with a controlled Firebase response verified the header at
1280, 768, 390 and 320 pixels, including visible brackets, uppercase text, no page
overflow and no overlap with navigation. Captures are saved as
`docs/stitch-tabernacle-redesign/implementation/wordmark-{width}.png`. The broader
smoke run timed out in its mocked session-restoration phase on this follow-up;
it is not reported as a fresh full-flow pass for the wordmark change.
