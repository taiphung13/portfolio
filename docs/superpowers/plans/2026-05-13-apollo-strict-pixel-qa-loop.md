# Apollo Strict Pixel QA Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable strict pixel QA loop that compares Apollo section position, size, and crop appearance against Figma across Desktop, Tablet, and Mobile before a section is marked complete.

**Architecture:** Keep the tooling small and script-based. A target manifest stores Figma source images and expected page geometry; a Node CDP helper measures a selector and captures the matching local crop; a Python PIL helper compares local crops to Figma source images and writes diff artifacts; a runner enforces geometry first, then visual crop diff.

**Tech Stack:** Bash, Node.js built-in `WebSocket`, Google Chrome headless/CDP, Python 3, Pillow/PIL, existing static HTML/CSS files.

---

## File Structure

- Create: `docs/apollo-strict-qa-targets.json`
  - Responsibility: store source images, expected Figma page geometry, local selectors, and viewport sizes for each section.
- Create: `scripts/apollo-section-capture.js`
  - Responsibility: open the Apollo page in headless Chrome, measure a section selector, and save a PNG screenshot clipped to that selector.
- Create: `scripts/apollo-visual-diff.py`
  - Responsibility: compare one Figma source image to one local crop, write a red overlay diff image, and emit JSON metrics.
- Create: `scripts/run-apollo-visual-qa.sh`
  - Responsibility: run strict QA for one Apollo section across Desktop, Tablet, and Mobile.
- Modify: `docs/apollo-design-source-map.md`
  - Responsibility: record strict QA evidence paths for the first section verified with the new loop.
- Modify: `docs/apollo-design-qc-checklist.md`
  - Responsibility: record pass/fail status from the new strict QA loop.
- Modify: `http/CONTINUITY.md`
  - Responsibility: record which section was tested, artifacts produced, and remaining next step.

## Review Corrections

The first draft of this plan was not strict enough. It compared local section crops with Figma crops, but a crop can match while the section is still hundreds of pixels too high or too low in the full page. That is exactly the kind of drift the user is reporting.

The implementation must use these gates, in this order:

1. **Top-down gate:** run strict QA from the top of the page downward. Do not mark a lower section complete if any earlier section still causes vertical drift.
2. **Geometry gate:** compare local selector `x`, `y`, `width`, and `height` against the Figma page coordinates for the same breakpoint. Fail if any key value differs by more than `2px`.
3. **Visual crop gate:** compare the local crop against the Figma source crop. Fail if there are large red diff regions or the changed-pixel ratio exceeds the strict threshold.
4. **Asset gate:** verify every source image used by the section returns HTTP `200` locally and has the expected natural size.
5. **Evidence gate:** write metrics JSON, diff PNG, local crop PNG, and final status into the source map/checklist before moving on.

For lower-page sections such as `MY OTHER WORKS`, a visual crop pass alone is not enough. If the absolute `y` coordinate is wrong, the workflow must report upstream vertical drift instead of treating the section as complete.

## Task 0: Add Strict QA Target Manifest

**Files:**
- Create: `docs/apollo-strict-qa-targets.json`

- [ ] **Step 1: Create the initial target manifest**

Add this file:

```json
{
  "page": "marketing-data-platform.html",
  "url": "http://localhost:4174/marketing-data-platform.html",
  "tolerancePx": 2,
  "changedRatioThreshold": 0.01,
  "breakpoints": {
    "desktop": { "width": 1440, "height": 900 },
    "tablet": { "width": 820, "height": 1180 },
    "mobile": { "width": 390, "height": 844 }
  },
  "sections": {
    "other-work": {
      "name": "My Other Works",
      "selector": ".apl-other-work",
      "order": 999,
      "breakpoints": {
        "desktop": {
          "source": "assets/images/apollo/other-work-cards-desktop.png",
          "expectedBox": { "x": 80, "y": 16751, "width": 1280, "height": 504 }
        },
        "tablet": {
          "source": "assets/images/apollo/other-work-cards-tablet.png",
          "expectedBox": { "x": 40, "y": 17012, "width": 740, "height": 967 }
        },
        "mobile": {
          "source": "assets/images/apollo/other-work-cards-mobile.png",
          "expectedBox": { "x": 16, "y": 14167, "width": 358, "height": 482 }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Validate the manifest JSON**

Run:

```bash
python3 -m json.tool docs/apollo-strict-qa-targets.json >/tmp/apollo-strict-qa-targets.pretty.json
```

Expected: exit code `0`.

- [ ] **Step 3: Commit the manifest**

Run:

```bash
git add docs/apollo-strict-qa-targets.json
git commit -m "docs: add Apollo strict QA target manifest" -- docs/apollo-strict-qa-targets.json
```

## Task 1: Add Local Section Capture Helper

**Files:**
- Create: `scripts/apollo-section-capture.js`

- [ ] **Step 1: Create the capture helper**

Add this file:

```javascript
#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key || !key.startsWith("--") || value === undefined) {
      throw new Error("Usage: node scripts/apollo-section-capture.js --url URL --selector SELECTOR --width WIDTH --height HEIGHT --out OUT_PNG --metrics METRICS_JSON");
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.json();
}

async function findWebSocketUrl(port) {
  for (let i = 0; i < 50; i += 1) {
    try {
      const pages = await getJson(`http://127.0.0.1:${port}/json`);
      const page = pages.find((entry) => entry.type === "page");
      if (page && page.webSocketDebuggerUrl) {
        return page.webSocketDebuggerUrl;
      }
    } catch (_) {
      await wait(100);
    }
  }
  throw new Error("Chrome CDP endpoint did not become available");
}

async function createCdpClient(wsUrl) {
  let id = 0;
  const pending = new Map();
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(JSON.stringify(message.error)));
      } else {
        resolve(message.result);
      }
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  return {
    send(method, params = {}) {
      const messageId = ++id;
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const url = args.url;
  const selector = args.selector;
  const width = Number(args.width);
  const height = Number(args.height || 18000);
  const outPath = args.out;
  const metricsPath = args.metrics;

  if (!url || !selector || !width || !outPath || !metricsPath) {
    throw new Error("Missing required arguments");
  }
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.mkdirSync(path.dirname(metricsPath), { recursive: true });

  const port = 9300 + Math.floor(Math.random() * 500);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "apollo-cdp-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    url,
  ], { stdio: "ignore" });

  let client;
  try {
    client = await createCdpClient(await findWebSocketUrl(port));
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send("Page.navigate", { url });

    for (let i = 0; i < 80; i += 1) {
      const ready = await client.send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      if (ready.result.value === "complete") {
        break;
      }
      await wait(100);
    }

    await client.send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: "Promise.all([...document.images].map((img) => img.complete ? true : new Promise((resolve) => { img.onload = img.onerror = () => resolve(true); })))",
    });

    await client.send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: "document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true",
    });

    const metricsResult = await client.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        if (!node) return { ok: false, error: "Selector not found", selector: ${JSON.stringify(selector)} };
        const rect = node.getBoundingClientRect();
        const round = (value) => Math.round(value * 100) / 100;
        return {
          ok: true,
          selector: ${JSON.stringify(selector)},
          viewport: { width: ${width}, height: ${height} },
          clip: {
            x: Math.max(0, Math.floor(rect.x)),
            y: Math.max(0, Math.floor(rect.y + window.scrollY)),
            width: Math.ceil(rect.width),
            height: Math.ceil(rect.height),
            scale: 1
          },
          box: {
            x: round(rect.x),
            y: round(rect.y + window.scrollY),
            width: round(rect.width),
            height: round(rect.height)
          }
        };
      })()`,
    });

    const metrics = metricsResult.result.value;
    if (!metrics.ok) {
      throw new Error(metrics.error);
    }

    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: metrics.clip,
    });

    fs.writeFileSync(outPath, Buffer.from(screenshot.data, "base64"));
    fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  } finally {
    if (client) client.close();
    chrome.kill("SIGTERM");
    await wait(500);
    fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

- [ ] **Step 2: Make it executable**

Run:

```bash
chmod +x scripts/apollo-section-capture.js
```

Expected: exit code `0`.

- [ ] **Step 3: Smoke test the capture helper**

Run against an existing selector:

```bash
node scripts/apollo-section-capture.js \
  --url http://localhost:4174/marketing-data-platform.html \
  --selector ".apl-other-work" \
  --width 1440 \
  --height 18000 \
  --out /tmp/apollo-section-capture-smoke.png \
  --metrics /tmp/apollo-section-capture-smoke.json
```

Expected:

```text
exit code 0
/tmp/apollo-section-capture-smoke.png exists
/tmp/apollo-section-capture-smoke.json contains "ok": true
```

- [ ] **Step 4: Commit the capture helper**

Run:

```bash
git add scripts/apollo-section-capture.js
git commit -m "chore: add Apollo section capture helper" -- scripts/apollo-section-capture.js
```

## Task 2: Add Visual Diff Helper

**Files:**
- Create: `scripts/apollo-visual-diff.py`

- [ ] **Step 1: Create the visual diff helper**

Add this file:

```python
#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
from PIL import Image, ImageChops


def parse_args():
    parser = argparse.ArgumentParser(description="Compare a Figma source image with a local Apollo section crop.")
    parser.add_argument("--source", required=True)
    parser.add_argument("--local", required=True)
    parser.add_argument("--diff", required=True)
    parser.add_argument("--json", required=True)
    parser.add_argument("--threshold", type=float, default=0.02)
    return parser.parse_args()


def open_rgba(path):
    return Image.open(path).convert("RGBA")


def main():
    args = parse_args()
    source_path = Path(args.source)
    local_path = Path(args.local)
    diff_path = Path(args.diff)
    json_path = Path(args.json)
    diff_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.parent.mkdir(parents=True, exist_ok=True)

    source = open_rgba(source_path)
    local = open_rgba(local_path)
    size_mismatch = source.size != local.size
    if size_mismatch:
        local_for_compare = local.resize(source.size)
    else:
        local_for_compare = local

    diff = ImageChops.difference(source, local_for_compare)
    pixels = diff.getdata()
    changed = 0
    total_delta = 0
    max_delta = 0
    for pixel in pixels:
        delta = max(pixel[:3])
        total_delta += delta
        max_delta = max(max_delta, delta)
        if delta > 24:
            changed += 1

    total_pixels = source.size[0] * source.size[1]
    changed_ratio = changed / total_pixels if total_pixels else 1
    mean_delta = total_delta / (total_pixels * 255) if total_pixels else 1
    passed = (not size_mismatch) and changed_ratio <= args.threshold

    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    overlay_pixels = []
    for pixel in diff.getdata():
        if max(pixel[:3]) > 24:
            overlay_pixels.append((255, 0, 0, 160))
        else:
            overlay_pixels.append((0, 0, 0, 0))
    overlay.putdata(overlay_pixels)
    composed = Image.alpha_composite(local_for_compare, overlay)
    composed.save(diff_path)

    report = {
        "passed": passed,
        "threshold": args.threshold,
        "source": str(source_path),
        "local": str(local_path),
        "diff": str(diff_path),
        "source_size": source.size,
        "local_size": local.size,
        "size_mismatch": size_mismatch,
        "changed_ratio": changed_ratio,
        "mean_delta": mean_delta,
        "max_delta": max_delta,
    }
    json_path.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if passed else 1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Make it executable**

Run:

```bash
chmod +x scripts/apollo-visual-diff.py
```

Expected: exit code `0`.

- [ ] **Step 3: Smoke test exact image match**

Run:

```bash
python3 scripts/apollo-visual-diff.py \
  --source assets/images/apollo/other-work-cards-desktop.png \
  --local assets/images/apollo/other-work-cards-desktop.png \
  --diff /tmp/apollo-visual-diff-smoke.png \
  --json /tmp/apollo-visual-diff-smoke.json
```

Expected:

```text
"passed": true
"changed_ratio": 0.0
exit code 0
```

- [ ] **Step 4: Commit the visual diff helper**

Run:

```bash
git add scripts/apollo-visual-diff.py
git commit -m "chore: add Apollo visual diff helper" -- scripts/apollo-visual-diff.py
```

## Task 3: Add Geometry-Aware Section QA Runner

**Files:**
- Create: `scripts/run-apollo-visual-qa.sh`

- [ ] **Step 1: Create the runner**

Add this file:

```bash
#!/usr/bin/env bash
set -euo pipefail

SECTION="${1:?Usage: scripts/run-apollo-visual-qa.sh SECTION_SLUG}"
MANIFEST="${APOLLO_QA_MANIFEST:-docs/apollo-strict-qa-targets.json}"
ROOT="scratch/apollo-visual-qa/${SECTION}/$(date +%Y%m%d-%H%M%S)"

mkdir -p "${ROOT}"

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

  check_geometry "${metrics_json}"

  python3 scripts/apollo-visual-diff.py \
    --source "${SOURCE}" \
    --local "${local_png}" \
    --diff "${diff_png}" \
    --json "${diff_json}" \
    --threshold "${THRESHOLD}"
}

run_one desktop
run_one tablet
run_one mobile

echo "Apollo visual QA passed for ${SECTION}"
echo "Artifacts: ${ROOT}"
```

- [ ] **Step 2: Make it executable**

Run:

```bash
chmod +x scripts/run-apollo-visual-qa.sh
```

Expected: exit code `0`.

- [ ] **Step 3: Smoke test the geometry-aware runner**

Run:

```bash
scripts/run-apollo-visual-qa.sh other-work
```

Expected:

```text
Either "Apollo visual QA passed for other-work" or "Geometry gate failed"
Artifacts: scratch/apollo-visual-qa/other-work/20260513-223000
```

For the current page, `other-work` may fail the geometry gate because upstream sections can still compress or expand the page. That is a valid strict-QA failure, not a runner failure. The runner implementation is acceptable when it produces metrics, produces artifacts, and fails with a clear geometry or visual-diff reason.

- [ ] **Step 4: Commit the runner**

Run:

```bash
git add scripts/run-apollo-visual-qa.sh
git commit -m "chore: add Apollo visual QA runner" -- scripts/run-apollo-visual-qa.sh
```

## Task 4: Pilot The Strict Loop On My Other Works

**Files:**
- Modify: `docs/apollo-design-source-map.md`
- Modify: `docs/apollo-design-qc-checklist.md`
- Modify: `http/CONTINUITY.md`

- [ ] **Step 1: Run strict QA for `other-work`**

Run:

```bash
scripts/run-apollo-visual-qa.sh other-work
```

Expected for a passing section:

```text
Apollo visual QA passed for other-work
Artifacts: scratch/apollo-visual-qa/other-work/20260513-223000
```

Expected for a failing result:

```text
Geometry gate failed
or scripts/apollo-visual-diff.py prints "passed": false
scratch/apollo-visual-qa/other-work/20260513-223000/desktop-diff.png exists
```

- [ ] **Step 2: If the pilot fails, classify the failure**

Use the diff image and metrics JSON to identify the smallest fix:

```text
Y-position mismatch only -> do not patch other-work first; start strict QA from the earliest preceding section that creates vertical drift.
Geometry mismatch -> adjust section width, margin, padding, or media query.
Image mismatch -> replace or correct the responsive source asset.
Typography mismatch -> adjust the specific selector font size, weight, line height, or color.
Complex nested UI mismatch after two cycles -> choose documented image-lock fallback.
```

If the failure is local to `other-work`, edit only:

```text
marketing-data-platform.html
css/apollo.css
assets/images/apollo/other-work-cards-desktop.png
assets/images/apollo/other-work-cards-tablet.png
assets/images/apollo/other-work-cards-mobile.png
```

- [ ] **Step 3: Re-run the strict QA runner**

Run:

```bash
scripts/run-apollo-visual-qa.sh other-work
```

Expected:

```text
Apollo visual QA passed for other-work
```

- [ ] **Step 4: Update evidence docs**

Update `docs/apollo-design-source-map.md` with:

```markdown
| My Other Works | `.apl-other-work` | Node `5362:56703`; `assets/images/apollo/other-work-cards-desktop.png` | Node `5362:56796`; `assets/images/apollo/other-work-cards-tablet.png` | Node `5362:57669`; `assets/images/apollo/other-work-cards-mobile.png` | Done | `scratch/apollo-visual-qa/other-work/20260513-223000/desktop-local.png`; `scratch/apollo-visual-qa/other-work/20260513-223000/tablet-local.png`; `scratch/apollo-visual-qa/other-work/20260513-223000/mobile-local.png`; strict visual QA passed |
```

Update `docs/apollo-design-qc-checklist.md` with:

```markdown
| My Other Works | Done | Done | Done | Done | Continue to next mismatched section |
```

Update `http/CONTINUITY.md` with:

```markdown
- Strict visual QA passed for `other-work` across Desktop `1440`, Tablet `820`, and Mobile `390`.
- Artifacts: `scratch/apollo-visual-qa/other-work/20260513-223000/`.
```

- [ ] **Step 5: Verify and commit the pilot evidence**

Run:

```bash
git diff --check -- docs/apollo-design-source-map.md docs/apollo-design-qc-checklist.md http/CONTINUITY.md
npx gitnexus detect-changes --repo portfolio --scope unstaged
```

Expected:

```text
git diff --check exits 0
GitNexus risk level is low or explicitly reviewed before commit
```

Commit only the files touched by this section:

```bash
git add docs/apollo-design-source-map.md docs/apollo-design-qc-checklist.md http/CONTINUITY.md
git commit -m "docs: record Apollo strict QA pilot" -- docs/apollo-design-source-map.md docs/apollo-design-qc-checklist.md http/CONTINUITY.md
```

## Self-Review

- Spec coverage: Task 0 adds the source/geometry manifest. Tasks 1-3 implement section capture, visual diff reporting, and the geometry-aware runner. Task 4 implements the test-fix-test loop, docs updates, and stop condition.
- Placeholder scan: no unresolved placeholder instructions remain.
- Type consistency: script names are consistent across tasks: `apollo-section-capture.js`, `apollo-visual-diff.py`, and `run-apollo-visual-qa.sh`.
- Scope check: this plan implements QA tooling and runs it on one pilot section only. It does not redesign unrelated Apollo sections. If the pilot exposes upstream vertical drift, the next implementation pass must move to the earliest failing section instead of patching the lower section blindly.
