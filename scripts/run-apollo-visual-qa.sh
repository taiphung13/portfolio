#!/usr/bin/env bash
set -euo pipefail

SECTION="${1:?Usage: scripts/run-apollo-visual-qa.sh SECTION_SLUG}"
MANIFEST="${APOLLO_QA_MANIFEST:-docs/apollo-strict-qa-targets.json}"
ROOT="scratch/apollo-visual-qa/${SECTION}/$(date +%Y%m%d-%H%M%S)"

mkdir -p "${ROOT}"
echo "Artifacts: ${ROOT}"

load_config() {
  local breakpoint="$1"
  python3 - "${MANIFEST}" "${SECTION}" "${breakpoint}" <<'PY'
import json
import shlex
import sys

manifest_path, section_slug, breakpoint = sys.argv[1:4]
with open(manifest_path, "r", encoding="utf-8") as handle:
    manifest = json.load(handle)

section = manifest["sections"][section_slug]
breakpoint_defaults = manifest["breakpoints"][breakpoint]
breakpoint_config = section["breakpoints"][breakpoint]
box = breakpoint_config["expectedBox"]

values = {
    "URL": manifest["url"],
    "SELECTOR": section["selector"],
    "WIDTH": breakpoint_defaults["width"],
    "HEIGHT": breakpoint_defaults["height"],
    "SOURCE": breakpoint_config["source"],
    "TOLERANCE_PX": manifest["tolerancePx"],
    "THRESHOLD": manifest["changedRatioThreshold"],
    "EXPECTED_X": box["x"],
    "EXPECTED_Y": box["y"],
    "EXPECTED_WIDTH": box["width"],
    "EXPECTED_HEIGHT": box["height"],
}

for key, value in values.items():
    print(f"{key}={shlex.quote(str(value))}")
PY
}

check_geometry() {
  local metrics_json="$1"
  python3 - "${metrics_json}" "${TOLERANCE_PX}" "${EXPECTED_X}" "${EXPECTED_Y}" "${EXPECTED_WIDTH}" "${EXPECTED_HEIGHT}" <<'PY'
import json
import sys

metrics_path, tolerance, expected_x, expected_y, expected_width, expected_height = sys.argv[1:7]
tolerance = float(tolerance)
expected = {
    "x": float(expected_x),
    "y": float(expected_y),
    "width": float(expected_width),
    "height": float(expected_height),
}

with open(metrics_path, "r", encoding="utf-8") as handle:
    metrics = json.load(handle)

actual = metrics["box"]
failures = []
for key, expected_value in expected.items():
    delta = abs(float(actual[key]) - expected_value)
    if delta > tolerance:
        failures.append(f"{key}: actual={actual[key]} expected={expected_value} delta={delta}")

if failures:
    print("Geometry gate failed")
    for failure in failures:
        print(failure)
    raise SystemExit(1)

print("Geometry gate passed")
PY
}

run_one() {
  local breakpoint="$1"
  eval "$(load_config "${breakpoint}")"

  local local_png="${ROOT}/${breakpoint}-local.png"
  local metrics_json="${ROOT}/${breakpoint}-metrics.json"
  local diff_png="${ROOT}/${breakpoint}-diff.png"
  local diff_json="${ROOT}/${breakpoint}-diff.json"

  node scripts/apollo-section-capture.js \
    --url "${URL}" \
    --selector "${SELECTOR}" \
    --width "${WIDTH}" \
    --height "${HEIGHT}" \
    --out "${local_png}" \
    --metrics "${metrics_json}"

  if ! check_geometry "${metrics_json}"; then
    return 1
  fi

  if ! python3 scripts/apollo-visual-diff.py \
    --source "${SOURCE}" \
    --local "${local_png}" \
    --diff "${diff_png}" \
    --json "${diff_json}" \
    --threshold "${THRESHOLD}"; then
    return 1
  fi
}

status=0
for breakpoint in desktop tablet mobile; do
  echo "Running ${SECTION} ${breakpoint}"
  if ! run_one "${breakpoint}"; then
    status=1
  fi
done

if [ "${status}" -ne 0 ]; then
  echo "Apollo visual QA failed for ${SECTION}"
  echo "Artifacts: ${ROOT}"
  exit "${status}"
fi

echo "Apollo visual QA passed for ${SECTION}"
echo "Artifacts: ${ROOT}"
