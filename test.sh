#!/bin/sh
# Local checks. Shared logic tests come from WeAdU-ltd/weadu-com-webflow tools/wea-323.
set -eu
cd "$(dirname "$0")"
node build.js
cmp lib/rsa.js test/rsa.js
node --test --test-name-pattern="rsa" test/logic.test.js
node -e "JSON.parse(require(\"fs\").readFileSync(\"manifest.json\"))"
echo "weadu-obsidian-rsa-lint ok"
