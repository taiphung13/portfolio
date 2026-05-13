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
| Desktop | `https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=4789-42050&m=dev` | `ehkXrfmxPaRqlKYrlMFOa2` | `4789:42050` | Mapped |
| Tablet | `https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=5342-39642&m=dev` | `ehkXrfmxPaRqlKYrlMFOa2` | `5342:39642` | Mapped |
| Mobile | `https://www.figma.com/design/ehkXrfmxPaRqlKYrlMFOa2/Mateee--Copy-?node-id=5362-56942&m=dev` | `ehkXrfmxPaRqlKYrlMFOa2` | `5362:56942` | Mapped |

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
| Hero / Overview | `#nav-overview` | Hero `4963:10660`; Overview `4789:42078`; `/tmp/apollo-source-hero-desktop.png` | Hero `5342:39643`; Overview `5342:39680`; `/tmp/apollo-source-hero-tablet.png` | Hero `5362:56947`; Overview `5362:56971`; `/tmp/apollo-source-hero-mobile.png` | Done | `/tmp/apollo-local-overview-desktop-final.png`; `/tmp/apollo-local-overview-tablet-final.png`; `/tmp/apollo-local-overview-mobile-final.png`; final measured boxes match Hero exactly, Overview top within 0-1px desktop/tablet and exact mobile |
| Problem Statements | `#nav-problem` | Node `4802:28536`; `assets/images/apollo/problem-statements-desktop.png` | Node `5342:39717`; `assets/images/apollo/problem-statements-tablet.png` | Node `5362:57008`; `assets/images/apollo/problem-statements-mobile.png` | Done | `/tmp/apollo-local-problem-desktop-final.png`; `/tmp/apollo-local-problem-tablet-final.png`; `/tmp/apollo-local-problem-mobile-final.png`; measured boxes match source |
| Hypothesis Comparison | `#nav-hypothesis` | Node `4802:28539`; `assets/images/apollo/hypothesis-comparison-desktop.png` | Node `5342:39718`; `assets/images/apollo/hypothesis-comparison-tablet.png` | Node `5362:57009`; `assets/images/apollo/hypothesis-comparison-mobile.png` | Done | `/tmp/apollo-local-problem-desktop-final.png`; `/tmp/apollo-local-problem-tablet-final.png`; `/tmp/apollo-local-problem-mobile-final.png`; measured boxes match source |
| Design Statement | `#nav-design-statement` | Node `4802:28523` / `4803:28720` | Node `5342:39693` | Node `5362:56984` | Done | `/tmp/apollo-local-design-statement-desktop-final.png`; `/tmp/apollo-local-design-statement-tablet-final.png`; `/tmp/apollo-local-design-statement-mobile-final.png`; measured boxes match source |
| Goals | `#nav-goals-chapter` | Nodes `4803:28723`, `5021:10685`, `4803:28730`, `4810:29176`; `assets/images/apollo/goal-cards-desktop.png` | Nodes `5342:39698`, `5342:39719`, `5342:39703`, `5342:39707`; `assets/images/apollo/goal-cards-tablet.png` | Nodes `5362:56989`, `5362:57010`, `5362:56994`, `5362:56998`; `assets/images/apollo/goal-cards-mobile.png` | Done | `/tmp/apollo-local-goals-desktop-final.png`; `/tmp/apollo-local-goals-tablet-final.png`; `/tmp/apollo-local-goals-mobile-final.png`; measured boxes match source within 0-1px |
| Research / Interviews | `#nav-user-interview` | Known node `4803:28744` | Not captured | Not captured | Previously fixed | `/tmp/apollo-research-after.png` |
| Personas | `#nav-personas` | Not captured | Not captured | Not captured | Pending | None |
| Decision #1 | `#nav-design-decision` | Hires crop | Hires crop | Hires crop | Previously fixed | `/tmp/apollo-approval-flow-final-hires.png` |
| Decision #2 | `#nav-decision-2` | Hires crop | Hires crop | Hires crop | Previously fixed | `/tmp/apollo-decision2-final.png` |
| Decision #3 | `#nav-decision-3` | Not captured | Not captured | Not captured | Pending | None |
| Results | `#nav-results` | Not captured | Not captured | Not captured | Pending | None |
| My Other Works | `.apl-other-work` | Node `5362:56703`; `assets/images/apollo/other-work-cards-desktop.png` | Node `5362:56796`; `assets/images/apollo/other-work-cards-tablet.png` | Node `5362:57669`; `assets/images/apollo/other-work-cards-mobile.png` | Strict QA failed | `scratch/apollo-visual-qa/other-work/20260513-230242/`; crop size matches, but absolute y fails strict geometry: desktop `15855.59` vs `16751`, tablet `16448.73` vs `17012`, mobile `14604.98` vs `14167`; fix upstream vertical drift before marking done |

## Batch Log

| Date | Section | MCP Calls Used | Local Evidence | Result |
|---|---|---:|---|---|
| 2026-05-13 | Workflow setup | 0 | Spec approved | Ready for link input |
| 2026-05-13 | Full-page source registration | 0 | `scripts/extract-figma-links.py` output parsed Desktop/Tablet/Mobile source nodes | Ready for MCP source reads |
| 2026-05-13 | Hero / Overview | 8 | MCP metadata/context/screenshots plus local screenshots at 1440, 820, and 390 | Passed; move to Problem Statements |
| 2026-05-13 | Problem Statements / Hypothesis Comparison | 11 | MCP metadata/context/screenshots plus local screenshots at 1440, 820, and 390 | Passed; move to Design Statement responsive check |
| 2026-05-13 | Design Statement | 0 | Reused existing metadata and local screenshots at 1440, 820, and 390 | Passed; move to Goals responsive check |
| 2026-05-13 | Goals | 3 | MCP screenshots for goal cards plus local screenshots at 1440, 820, and 390 | Passed; move to Research / Interviews responsive check |
| 2026-05-13 | My Other Works | 4 | MCP design context plus Desktop/Tablet/Mobile screenshots; local screenshots at 1440, 820, and 390 | Superseded by strict QA; crop/size matched but full-page y drift was not checked |
| 2026-05-13 | My Other Works strict QA pilot | 0 | `scratch/apollo-visual-qa/other-work/20260513-230242/` | Failed geometry gate at Desktop/Tablet/Mobile; do not proceed lower-page QA until upstream vertical drift is fixed |
