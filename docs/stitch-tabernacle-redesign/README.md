# Faith Giving · Faith Tabernacle redesign

Stitch design concepts created on October 20, 2026 using the current Faith Tabernacle black-and-white palette and Poppins typography.

- Stitch project: https://stitch.withgoogle.com/projects/13478507951163706242
- Design brief and exact source tokens: [DESIGN.md](DESIGN.md)
- Screen resource IDs and exported files: [manifest.json](manifest.json)
- Six-screen visual overview: [design-overview.png](design-overview.png)

The six final desktop concepts cover guest giving, returning-donor giving, phone sign-in, saved-card payment, processing, and a receipt. Each final screen has a PNG screenshot and a Stitch HTML export. The Angular implementation is on `feature/faith-tabernacle-giving-redesign`, behind the existing Firebase `beta_access` flag. Production and Firebase configuration have not been changed. The HTML exports remain static design references.

Mobile generation could not be completed because Stitch reported its generation quota was exhausted. The Angular implementation adapts the desktop direction to mobile; see the implementation captures and the repository's `design-qa.md` for responsive verification.

All six final exported HTML files were checked for Poppins, the exact black canvas, the current footer year, and absence of recurring-giving controls. The implementation uses actual gift data and existing payment capabilities, retains the print receipt action, and omits illustrative provider claims and unsupported actions.

`original-stitch-manifest.json` records the pre-existing project and screen resources before this design work.

Implementation evidence is in `implementation/`. The `beta-*` captures come from
the production build with mocked Firebase and API responses. The sign-in,
verification and profile captures document the same redesigned layouts before
the shared flag wrapper was added. `*-comparison-final.png` pairs the desktop
reference with its implementation; fixture amounts and donor names can differ.

The browser harness stubs Stripe Elements, so its new-card captures show the
container layout. Unit tests verify the flag-specific Stripe styles, font
configuration, field readiness and ZIP handling. These checks do not prove live
payment processing or deployed font delivery.
