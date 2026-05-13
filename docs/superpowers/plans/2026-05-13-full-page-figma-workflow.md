# Full-Page Figma Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved workflow where Desktop, Tablet, and Mobile full-page Figma links become the source entrypoint, while section-level captures and local three-breakpoint screenshots become the verification gate.

**Architecture:** Add lightweight workflow documentation and two local helper scripts. The workflow records Figma link metadata, tracks section QA status, captures local screenshots deterministically, and keeps all implementation fixes scoped to `marketing-data-platform.html`, `css/apollo.css`, and explicit Apollo assets.

**Tech Stack:** Static HTML/CSS, Figma MCP, Python 3 standard library, Bash, Chrome headless, `python3 -m http.server`, `curl`, `sips`, Markdown.

---

## File Structure

- Create `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`
  - Records breakpoint links, parsed Figma file/node IDs, source evidence, MCP calls, local screenshot evidence, and section status.
- Create `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`
  - Tracks section-level QA status across Desktop, Tablet, and Mobile.
- Create `/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py`
  - Parses Desktop/Tablet/Mobile Figma URLs into file keys and node IDs without spending MCP calls.
- Create `/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh`
  - Captures local screenshots at deterministic browser sizes.
- Modify `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`
  - Records workflow state, evidence, and next section.
- Later section fixes may modify:
  - `/Users/hafa/Documents/portfolio/marketing-data-platform.html`
  - `/Users/hafa/Documents/portfolio/css/apollo.css`
  - `/Users/hafa/Documents/portfolio/assets/images/apollo/`

---

### Task 1: Add Figma Link Parser

**Files:**
- Create: `/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py`
- Test: command-line sample URL checks

- [ ] **Step 1: Create the parser script**

Create `/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py` with this exact content:

```python
#!/usr/bin/env python3
import json
import re
import sys
from urllib.parse import parse_qs, urlparse


def parse_figma_url(label, url):
    parsed = urlparse(url)
    path_parts = [part for part in parsed.path.split("/") if part]

    file_key = ""
    for index, part in enumerate(path_parts):
        if part in {"design", "file"} and index + 1 < len(path_parts):
            file_key = path_parts[index + 1]
            break

    query = parse_qs(parsed.query)
    raw_node_id = query.get("node-id", [""])[0]
    node_id = raw_node_id.replace("-", ":")

    return {
        "label": label,
        "url": url,
        "fileKey": file_key,
        "nodeId": node_id,
        "isValid": bool(file_key and node_id),
    }


def main(argv):
    if len(argv) != 4:
        print(
            "Usage: extract-figma-links.py DESKTOP_URL TABLET_URL MOBILE_URL",
            file=sys.stderr,
        )
        return 2

    labels = ["Desktop", "Tablet", "Mobile"]
    results = [parse_figma_url(label, url) for label, url in zip(labels, argv[1:])]
    invalid = [result["label"] for result in results if not result["isValid"]]

    print(json.dumps(results, indent=2, ensure_ascii=False))

    if invalid:
        print(
            "Invalid Figma links missing fileKey or nodeId: " + ", ".join(invalid),
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
```

- [ ] **Step 2: Make the parser executable**

Run:

```bash
chmod +x /Users/hafa/Documents/portfolio/scripts/extract-figma-links.py
```

Expected: command exits with code `0`.

- [ ] **Step 3: Verify valid link parsing**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py \
  'https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4803-28720&t=abc-0' \
  'https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4803-28724&t=abc-0' \
  'https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4803-28744&t=abc-0'
```

Expected: command exits with code `0` and prints JSON containing:

```json
[
  {
    "label": "Desktop",
    "fileKey": "ehkXrfmxPaRqlKYrlMFOa2",
    "nodeId": "4803:28720",
    "isValid": true
  },
  {
    "label": "Tablet",
    "fileKey": "ehkXrfmxPaRqlKYrlMFOa2",
    "nodeId": "4803:28724",
    "isValid": true
  },
  {
    "label": "Mobile",
    "fileKey": "ehkXrfmxPaRqlKYrlMFOa2",
    "nodeId": "4803:28744",
    "isValid": true
  }
]
```

The `url` fields will also be present in the actual output.

- [ ] **Step 4: Verify invalid link handling**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py \
  'https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-' \
  'https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4803-28724' \
  'https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4803-28744'
```

Expected: command exits with code `1` and stderr includes:

```text
Invalid Figma links missing fileKey or nodeId: Desktop
```

- [ ] **Step 5: Commit**

Run:

```bash
git add /Users/hafa/Documents/portfolio/scripts/extract-figma-links.py
git commit -m "chore: add Figma link parser"
```

Expected: commit succeeds. If the current worktree contains unrelated staged changes, use:

```bash
git commit --only /Users/hafa/Documents/portfolio/scripts/extract-figma-links.py -m "chore: add Figma link parser"
```

---

### Task 2: Add Local Screenshot Capture Script

**Files:**
- Create: `/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh`
- Test: local server screenshot capture

- [ ] **Step 1: Create the screenshot script**

Create `/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh` with this exact content:

```bash
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
```

- [ ] **Step 2: Make the script executable**

Run:

```bash
chmod +x /Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh
```

Expected: command exits with code `0`.

- [ ] **Step 3: Start local server**

Run:

```bash
cd /Users/hafa/Documents/portfolio
python3 -m http.server 4174
```

Expected: output includes:

```text
Serving HTTP on
```

- [ ] **Step 4: Verify desktop capture in another terminal**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=capture-script-desktop' \
  '/tmp/apollo-capture-script-desktop.png' \
  1440 \
  18000
```

Expected: output includes:

```text
pixelWidth: 1440
```

- [ ] **Step 5: Verify tablet capture**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=capture-script-tablet' \
  '/tmp/apollo-capture-script-tablet.png' \
  820 \
  18000
```

Expected: output includes:

```text
pixelWidth: 820
```

- [ ] **Step 6: Verify mobile capture**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=capture-script-mobile' \
  '/tmp/apollo-capture-script-mobile.png' \
  390 \
  18000
```

Expected: output includes:

```text
pixelWidth: 390
```

- [ ] **Step 7: Stop local server**

Press `Ctrl-C` in the server terminal.

Expected: server exits.

- [ ] **Step 8: Commit**

Run:

```bash
git add /Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh
git commit -m "chore: add Apollo screenshot capture script"
```

Expected: commit succeeds. If the current worktree contains unrelated staged changes, use:

```bash
git commit --only /Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh -m "chore: add Apollo screenshot capture script"
```

---

### Task 3: Create Source Map Document

**Files:**
- Create: `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`

- [ ] **Step 1: Create the source map**

Create `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md` with this exact content:

```markdown
# Apollo Design Source Map

## Purpose

Track Figma source links, section-level captures, MCP calls, and local verification evidence for the Apollo case-study rebuild.

## Input Gate

Do not start MCP source reads until the user has provided all three full-page Figma links:

- Desktop full-page link
- Tablet full-page link
- Mobile full-page link

## Figma Access

- Expected active file key: `ehkXrfmxPaRqlKYrlMFOa2`
- Expected MCP account: `030239230281@st.buh.edu.vn`
- Expected handle: `UynFa`
- Account check tool: `whoami`

## Breakpoint Sources

| Breakpoint | Figma URL | File Key | Node ID | Status |
|---|---|---|---|---|
| Desktop | Waiting for user-provided full-page link | Not parsed | Not parsed | Waiting |
| Tablet | Waiting for user-provided full-page link | Not parsed | Not parsed | Waiting |
| Mobile | Waiting for user-provided full-page link | Not parsed | Not parsed | Waiting |

## MCP Budget Rules

- Start each batch with `whoami`.
- Use full-page links only as entrypoints.
- Prefer section-level screenshots or design context after the page is mapped.
- Target one to three MCP reads per section across Desktop, Tablet, and Mobile.
- Allow up to four MCP reads only when section root discovery is required.
- Stop MCP reads when access or rate-limit errors appear.

## Section Map

| Section | Local Anchor | Desktop Source | Tablet Source | Mobile Source | Status | Evidence |
|---|---|---|---|---|---|---|
| Hero / Overview | `#nav-overview` | Not captured | Not captured | Not captured | Pending | None |
| Problem Statements | `#nav-problem` | Not captured | Not captured | Not captured | Pending | None |
| Hypothesis Comparison | `#nav-hypothesis` | Not captured | Not captured | Not captured | Pending | None |
| Design Statement | `#nav-design-statement` | Known node `4803:28720` | Not captured | Not captured | Previously fixed | Local screenshot verified |
| Goals | `#nav-goals-chapter` | Known node `4803:28724` | Not captured | Not captured | Previously fixed | Local screenshot verified |
| Research / Interviews | `#nav-user-interview` | Known node `4803:28744` | Not captured | Not captured | Previously fixed | `/tmp/apollo-research-after.png` |
| Personas | `#nav-personas` | Not captured | Not captured | Not captured | Pending | None |
| Decision #1 | `#nav-design-decision` | Hires crop | Hires crop | Hires crop | Previously fixed | `/tmp/apollo-approval-flow-final-hires.png` |
| Decision #2 | `#nav-decision-2` | Hires crop | Hires crop | Hires crop | Previously fixed | `/tmp/apollo-decision2-final.png` |
| Decision #3 | `#nav-decision-3` | Not captured | Not captured | Not captured | Pending | None |
| Results | `#nav-results` | Not captured | Not captured | Not captured | Pending | None |

## Batch Log

| Date | Section | MCP Calls Used | Local Evidence | Result |
|---|---|---:|---|---|
| 2026-05-13 | Workflow setup | 0 | Spec approved | Ready for link input |
```

- [ ] **Step 2: Verify the source map exists**

Run:

```bash
test -f /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md
rg -n "Input Gate|Breakpoint Sources|Decision #3" /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md
```

Expected: output contains `Input Gate`, `Breakpoint Sources`, and `Decision #3`.

- [ ] **Step 3: Commit**

Run:

```bash
git add /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md
git commit -m "docs: add Apollo design source map"
```

Expected: commit succeeds. If the current worktree contains unrelated staged changes, use:

```bash
git commit --only /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md -m "docs: add Apollo design source map"
```

---

### Task 4: Create QA Checklist

**Files:**
- Create: `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`

- [ ] **Step 1: Create the QA checklist**

Create `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md` with this exact content:

```markdown
# Apollo Design QA Checklist

## Rule

A section is complete only when the current section passes Desktop, Tablet, and Mobile checks or an intentional breakpoint exception is recorded.

## Verification Checks

For each section:

- Source evidence exists for Desktop, Tablet, and Mobile, or an explicit fallback is recorded.
- Local Desktop screenshot exists.
- Local Tablet screenshot exists.
- Local Mobile screenshot exists.
- Required headings are present and ordered correctly.
- Required body copy exists and is not hidden.
- Required images/assets load and are not obviously cropped wrong.
- Section order matches source.
- Old duplicate blocks are not visible.
- Text does not overlap or overflow on Tablet or Mobile.
- All local assets referenced by the section return HTTP `200`.
- `http/CONTINUITY.md` records what was checked and what remains.

## Section Status

| Section | Desktop | Tablet | Mobile | Overall | Next Action |
|---|---|---|---|---|---|
| Hero / Overview | Pending | Pending | Pending | Pending | Capture source and local screenshots |
| Problem Statements | Pending | Pending | Pending | Pending | Capture source and local screenshots |
| Hypothesis Comparison | Pending | Pending | Pending | Pending | Capture source and local screenshots |
| Design Statement | Done | Pending | Pending | Needs responsive check | Verify Tablet and Mobile |
| Goals | Done | Pending | Pending | Needs responsive check | Verify Tablet and Mobile |
| Research / Interviews | Done | Pending | Pending | Needs responsive check | Verify Tablet and Mobile |
| Personas | Pending | Pending | Pending | Pending | Capture source and local screenshots |
| Decision #1 | Done | Pending | Pending | Needs responsive check | Verify Tablet and Mobile |
| Decision #2 | Done | Pending | Pending | Needs responsive check | Verify Tablet and Mobile |
| Decision #3 | Pending | Pending | Pending | Pending | Capture source and local screenshots |
| Results | Pending | Pending | Pending | Pending | Capture source and local screenshots |
```

- [ ] **Step 2: Verify the checklist exists**

Run:

```bash
test -f /Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md
rg -n "Verification Checks|Decision #3|Needs responsive check" /Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md
```

Expected: output contains `Verification Checks`, `Decision #3`, and `Needs responsive check`.

- [ ] **Step 3: Commit**

Run:

```bash
git add /Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md
git commit -m "docs: add Apollo design QA checklist"
```

Expected: commit succeeds. If the current worktree contains unrelated staged changes, use:

```bash
git commit --only /Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md -m "docs: add Apollo design QA checklist"
```

---

### Task 5: Record User-Provided Full-Page Links

**Files:**
- Modify: `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`
- Modify: `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`

- [ ] **Step 1: Wait for all three links**

Do not call Figma MCP until the user provides all three full-page links in the same request or clearly labels them across consecutive requests:

```text
Desktop: https://www.figma.com/design/...
Tablet: https://www.figma.com/design/...
Mobile: https://www.figma.com/design/...
```

Expected: there are three URLs, each with `node-id=`.

- [ ] **Step 2: Parse the links without MCP**

Run the parser with the exact URLs provided by the user:

```bash
DESKTOP_URL='paste the Desktop full-page URL from the user message'
TABLET_URL='paste the Tablet full-page URL from the user message'
MOBILE_URL='paste the Mobile full-page URL from the user message'

/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py \
  "$DESKTOP_URL" \
  "$TABLET_URL" \
  "$MOBILE_URL"
```

Expected: command exits with code `0`, and all three rows have `"isValid": true`.

- [ ] **Step 3: Update the source map**

Replace the three rows under `## Breakpoint Sources` in `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md` with this structure, using the actual parsed values:

```markdown
| Breakpoint | Figma URL | File Key | Node ID | Status |
|---|---|---|---|---|
| Desktop | value from Desktop `url` | value from Desktop `fileKey` | value from Desktop `nodeId` | Parsed |
| Tablet | value from Tablet `url` | value from Tablet `fileKey` | value from Tablet `nodeId` | Parsed |
| Mobile | value from Mobile `url` | value from Mobile `fileKey` | value from Mobile `nodeId` | Parsed |
```

Expected: no `Waiting for user-provided full-page link` remains in the breakpoint table after the links are recorded.

- [ ] **Step 4: Update the ledger**

Add a Done bullet to `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`:

```markdown
- Recorded Desktop/Tablet/Mobile full-page Figma links in `docs/apollo-design-source-map.md`; all links parsed with file keys and node IDs before MCP reads.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md /Users/hafa/Documents/portfolio/http/CONTINUITY.md
git commit -m "docs: record Apollo full-page Figma sources"
```

Expected: commit succeeds. If unrelated staged changes exist, use:

```bash
git commit --only /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md /Users/hafa/Documents/portfolio/http/CONTINUITY.md -m "docs: record Apollo full-page Figma sources"
```

---

### Task 6: Run First Section Verification Batch

**Files:**
- Modify: `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`
- Modify: `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`
- Modify: `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`
- May modify after source comparison:
  - `/Users/hafa/Documents/portfolio/marketing-data-platform.html`
  - `/Users/hafa/Documents/portfolio/css/apollo.css`
  - `/Users/hafa/Documents/portfolio/assets/images/apollo/`

- [ ] **Step 1: Confirm MCP account**

Call Figma MCP `whoami`.

Expected: current account is the intended account, preferably:

```text
030239230281@st.buh.edu.vn
```

If the account is wrong, stop and ask the user to switch MCP login.

- [ ] **Step 2: Choose the first section**

Start with the first pending section in `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`.

Expected current first pending section:

```text
Hero / Overview
```

If the user asks to continue after the already-repaired lower sections, start with:

```text
Decision #3
```

- [ ] **Step 3: Capture section source with bounded MCP**

Use the three full-page links as entrypoints. Do not repeatedly screenshot full pages. If section roots are unknown, make one metadata call for the full-page frame, then capture the chosen section only.

Expected evidence paths for Decision #3:

```text
/tmp/apollo-source-decision-3-desktop.png
/tmp/apollo-source-decision-3-tablet.png
/tmp/apollo-source-decision-3-mobile.png
```

If MCP rate-limits, record the error in `/Users/hafa/Documents/portfolio/http/CONTINUITY.md` and use available exported/hires assets for that section.

- [ ] **Step 4: Start local server**

Run:

```bash
cd /Users/hafa/Documents/portfolio
python3 -m http.server 4174
```

Expected: output includes `Serving HTTP on`.

- [ ] **Step 5: Capture local Desktop**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=decision-3-desktop-before' \
  '/tmp/apollo-local-decision-3-desktop-before.png' \
  1440 \
  18000
```

Expected: output includes `pixelWidth: 1440`.

- [ ] **Step 6: Capture local Tablet**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=decision-3-tablet-before' \
  '/tmp/apollo-local-decision-3-tablet-before.png' \
  820 \
  18000
```

Expected: output includes `pixelWidth: 820`.

- [ ] **Step 7: Capture local Mobile**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=decision-3-mobile-before' \
  '/tmp/apollo-local-decision-3-mobile-before.png' \
  390 \
  18000
```

Expected: output includes `pixelWidth: 390`.

- [ ] **Step 8: Compare and make scoped fixes**

Only touch files directly needed for the selected section. For Decision #3, allowed files are:

```text
/Users/hafa/Documents/portfolio/marketing-data-platform.html
/Users/hafa/Documents/portfolio/css/apollo.css
/Users/hafa/Documents/portfolio/assets/images/apollo/notification-preview.png
/Users/hafa/Documents/portfolio/assets/images/apollo/mobile-before-after.png
```

Expected: no unrelated sections are reformatted or refactored.

- [ ] **Step 9: Verify local assets**

Run:

```bash
curl -I http://localhost:4174/marketing-data-platform.html
curl -I http://localhost:4174/css/apollo.css
curl -I http://localhost:4174/assets/images/apollo/notification-preview.png
curl -I http://localhost:4174/assets/images/apollo/mobile-before-after.png
```

Expected: every response starts with:

```text
HTTP/1.0 200 OK
```

- [ ] **Step 10: Capture after screenshots**

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=decision-3-desktop-after' \
  '/tmp/apollo-local-decision-3-desktop-after.png' \
  1440 \
  18000

/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=decision-3-tablet-after' \
  '/tmp/apollo-local-decision-3-tablet-after.png' \
  820 \
  18000

/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=decision-3-mobile-after' \
  '/tmp/apollo-local-decision-3-mobile-after.png' \
  390 \
  18000
```

Expected: outputs include `pixelWidth: 1440`, `pixelWidth: 820`, and `pixelWidth: 390`.

- [ ] **Step 11: Update tracking docs**

Update `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md` for the selected section. For Decision #3 after successful verification:

```markdown
| Decision #3 | Done | Done | Done | Done | None |
```

Append a row to `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md` under `Batch Log`:

```markdown
| 2026-05-13 | Decision #3 | number of MCP read calls used in this batch | `/tmp/apollo-local-decision-3-desktop-after.png`, `/tmp/apollo-local-decision-3-tablet-after.png`, `/tmp/apollo-local-decision-3-mobile-after.png` | Done |
```

Use the actual MCP read call count from the batch, for example `3` when one section source read was used for each breakpoint.

- [ ] **Step 12: Update ledger**

Add a Done bullet to `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`:

```markdown
- Verified Decision #3 against Desktop/Tablet/Mobile sources; local evidence saved at `/tmp/apollo-local-decision-3-desktop-after.png`, `/tmp/apollo-local-decision-3-tablet-after.png`, and `/tmp/apollo-local-decision-3-mobile-after.png`.
```

- [ ] **Step 13: Stop local server**

Press `Ctrl-C` in the server terminal.

Expected: server exits.

- [ ] **Step 14: Commit**

Run:

```bash
git add /Users/hafa/Documents/portfolio/marketing-data-platform.html /Users/hafa/Documents/portfolio/css/apollo.css /Users/hafa/Documents/portfolio/assets/images/apollo/notification-preview.png /Users/hafa/Documents/portfolio/assets/images/apollo/mobile-before-after.png /Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md /Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md /Users/hafa/Documents/portfolio/http/CONTINUITY.md
git commit -m "fix: align Apollo decision three across breakpoints"
```

Expected: commit succeeds. If unrelated staged changes exist, use `git commit --only` with the exact changed files from this task.

---

### Task 7: Final Verification Report for Each Batch

**Files:**
- Modify: `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`

- [ ] **Step 1: Capture final screenshots for the completed batch**

Run local server:

```bash
cd /Users/hafa/Documents/portfolio
python3 -m http.server 4174
```

Run:

```bash
/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=batch-final-desktop' \
  '/tmp/apollo-batch-final-desktop.png' \
  1440 \
  18000

/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=batch-final-tablet' \
  '/tmp/apollo-batch-final-tablet.png' \
  820 \
  18000

/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh \
  'http://localhost:4174/marketing-data-platform.html?verify=batch-final-mobile' \
  '/tmp/apollo-batch-final-mobile.png' \
  390 \
  18000
```

Expected: outputs include `pixelWidth: 1440`, `pixelWidth: 820`, and `pixelWidth: 390`.

- [ ] **Step 2: Stop local server**

Press `Ctrl-C` in the server terminal.

Expected: server exits.

- [ ] **Step 3: Update ledger for handoff**

Set these fields in `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`:

```markdown
State:
- Current Apollo verification batch completed and evidence captured for Desktop/Tablet/Mobile.

Now:
- Report completed section evidence to the user.

Next:
- Continue to the next pending section only after user approves or requests continuation.
```

- [ ] **Step 4: Commit ledger update**

Run:

```bash
git add /Users/hafa/Documents/portfolio/http/CONTINUITY.md
git commit -m "docs: record Apollo verification batch"
```

Expected: commit succeeds. If unrelated staged changes exist, use:

```bash
git commit --only /Users/hafa/Documents/portfolio/http/CONTINUITY.md -m "docs: record Apollo verification batch"
```

---

## Self-Review

Spec coverage:

- Uses three full-page Figma links as entrypoints: Task 5.
- Keeps work section-level: Tasks 3, 4, 6.
- Controls MCP usage: Tasks 3, 5, 6.
- Verifies Desktop/Tablet/Mobile locally: Tasks 2, 6, 7.
- Avoids moving to next section before pass: Tasks 4, 6, 7.

Placeholder scan:

- No unresolved marker tokens remain.
- Runtime values that must come from the user's links or from a real MCP batch are described as explicit values to paste or record during execution.

Type/path consistency:

- All file paths use `/Users/hafa/Documents/portfolio`.
- The screenshot widths are consistent with the approved spec: `1440`, `820`, `390`.
- The parser and screenshot script paths are consistent across tasks.
