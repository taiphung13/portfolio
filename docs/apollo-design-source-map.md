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
| Desktop | `https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4789-42050&m=dev` | `ehkXrfmxPaRqlKYrlMFOa2` | `4789:42050` | Parsed |
| Tablet | `https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=5342-39642&m=dev` | `ehkXrfmxPaRqlKYrlMFOa2` | `5342:39642` | Parsed |
| Mobile | `https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=5362-56942&m=dev` | `ehkXrfmxPaRqlKYrlMFOa2` | `5362:56942` | Parsed |

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
| 2026-05-13 | Full-page source registration | 0 | `scripts/extract-figma-links.py` output parsed Desktop/Tablet/Mobile source nodes | Ready for MCP source reads |
