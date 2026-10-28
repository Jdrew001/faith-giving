#!/usr/bin/env bash
set -euo pipefail
# Set GIVING_PWCLI to an installed playwright-cli or the Codex wrapper path.
pwcli="${GIVING_PWCLI:-playwright-cli}"
session="faith-giving-redesign"
trap '"$pwcli" --session "$session" snapshot || true; "$pwcli" --session "$session" close >/dev/null 2>&1 || true' EXIT
"$pwcli" --session "$session" open about:blank --browser chrome
"$pwcli" --session "$session" run-code --filename tools/giving-browser-smoke.js
