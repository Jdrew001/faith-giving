# Feature Gates 0.1.1 local distribution

Faith Giving installs the committed core and Firebase archives with `file:` dependencies. No sibling checkout or npm registry publication is needed. These packages are build-only frontend dependencies; Firebase 12.19.0 is shared with the API.

`source/` contains readable source snapshots, package manifests, pinned dependency lockfile, focused core/provider tests and the TypeScript 4.9 consumer check. The testing package is included only to exercise core contracts and is not installed by Faith Giving.

## Verify and regenerate

Use Node 24.12 or later in the Node 24 line for the development toolchain and Firebase 13 compatibility checks. Faith Giving itself remains on Node 20, Angular 15 and TypeScript 4.9.

From this directory:

```sh
shasum -a 256 -c SHA256SUMS
node regenerate.mjs
shasum -a 256 -c SHA256SUMS
```

Regeneration installs the locked source toolchain, builds the packages, checks typed feature names with TypeScript 4.9.5 and exact Firebase 12.19.0, runs focused tests with Firebase 13 and 12.19, packs core and Firebase, then updates checksums. Source maps and readable TypeScript are included in the archives.

After any source or version change, regenerate, refresh the application lockfile and rerun application checks. Review all archive, source and checksum changes together. Do not publish these packages to a registry as part of this foundation.
