#!/usr/bin/env bash
set -euo pipefail
# Set FEATURE_FLAGS_PWCLI to an installed playwright-cli or the Codex wrapper path.
pwcli="${FEATURE_FLAGS_PWCLI:-playwright-cli}"
session="faith-giving-foundation"
trap '"$pwcli" --session "$session" snapshot || true; "$pwcli" --session "$session" close >/dev/null 2>&1 || true' EXIT
"$pwcli" --session "$session" open about:blank --browser chrome
"$pwcli" --session "$session" run-code --filename tools/feature-flags-browser-smoke.js
