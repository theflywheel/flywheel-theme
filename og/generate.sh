#!/usr/bin/env bash
# Render an OG image (1200x630 PNG) in the theme's language. No dependencies
# beyond Chrome/Chromium: the template is plain HTML, rendered headless.
#
#   og/generate.sh "Title of the page" "eyebrow · label" "One-line description" "yourdomain.in" out.png
#
# Override the browser with CHROME=/path/to/chrome.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
TITLE="${1:?usage: generate.sh TITLE [EYEBROW] [SUB] [FOOTER] [OUT]}"
EYEBROW="${2:-}"; SUB="${3:-}"; FOOTER="${4:-}"; OUT="${5:-og.png}"

TMP="$(mktemp -t og-XXXXXX).html"
python3 - "$DIR/template.html" "$TMP" "$TITLE" "$EYEBROW" "$SUB" "$FOOTER" <<'PYEOF'
import sys, html
tpl = open(sys.argv[1]).read()
for key, val in zip(("{{TITLE}}", "{{EYEBROW}}", "{{SUB}}", "{{FOOTER}}"), sys.argv[3:7]):
    tpl = tpl.replace(key, html.escape(val))
open(sys.argv[2], "w").write(tpl)
PYEOF

CHROME="${CHROME:-}"
if [ -z "$CHROME" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" google-chrome chromium chromium-browser; do
    if [ -x "$c" ] || command -v "$c" >/dev/null 2>&1; then CHROME="$c"; break; fi
  done
fi
[ -n "$CHROME" ] || { echo "no Chrome/Chromium found; set CHROME=/path/to/chrome" >&2; exit 1; }

"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --screenshot="$OUT" --window-size=1200,630 "file://$TMP" 2>/dev/null
rm -f "$TMP"
echo "wrote $OUT (1200x630)"
