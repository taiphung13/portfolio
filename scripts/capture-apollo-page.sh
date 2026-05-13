#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:4174/marketing-data-platform.html}"
OUT="${2:-/tmp/apollo-page.png}"
WIDTH="${3:-1440}"
HEIGHT="${4:-18000}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "Chrome executable not found: $CHROME" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  "--window-size=${WIDTH},${HEIGHT}" \
  "--screenshot=${OUT}" \
  "$URL"

sips -g pixelWidth -g pixelHeight "$OUT"
