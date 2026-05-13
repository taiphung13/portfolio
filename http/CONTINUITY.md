Goal (incl. success criteria):
- Implement a lower-cost, more accurate Apollo/Figma design-QA workflow.
- Success criteria: user provides Desktop/Tablet/Mobile full-page Figma links; Codex uses them as entrypoints, works section by section, verifies local Desktop/Tablet/Mobile screenshots, and does not advance until the current section passes.
- Current goal: use Dev Mode links plus MCP plus local screenshots to fix Apollo sections accurately before moving to the next section.
- Current brainstorming goal: define a stricter test-fix-test workflow for Apollo visual parity because the current section-by-section checks still miss visible drift.

Constraints/Assumptions:
- Workspace: `/Users/hafa/Documents/portfolio`.
- Preserve unrelated existing Apollo/Aperia/marketing worktree changes.
- Use Figma MCP as a source tool, not the main QA loop.
- Avoid querying every child node on a whole page.
- Prefer one to three MCP reads per section; allow up to four only when section root discovery is required.
- Local verification target remains `marketing-data-platform.html` with Apollo styling in `css/apollo.css`.
- Inline execution is running in the existing `feat/aperia-figma-rebuild` workspace because the current worktree already contains many related changes.
- Use the approved workflow: Dev Mode identifies the source, MCP gets bounded evidence, local screenshots verify the implementation.

Key decisions:
- User chose workflow B: balanced section-level MCP source capture plus local screenshot QA.
- User clarified the Desktop/Tablet/Mobile Figma links will be full-page links.
- User approved the full-page workflow design spec.
- User chose Inline Execution.
- User approved Dev Mode-first plus MCP-surgical workflow.
- User asked to redesign the QA loop so Codex tests and fixes repeatedly until the section is accurate enough, instead of relying on user visual review after each attempt.
- User accepted the brainstorming visual companion; use it only when a visual comparison/mockup would be clearer than text.
- User chose strict pixel QA: local screenshot vs Figma should pass with very low visual diff and key boxes within about 1-2px.

State:
- Inline setup tasks 1 through 5 are complete.
- Desktop/Tablet/Mobile Dev Mode full-page links were provided and parsed without MCP.
- MCP account confirmation and section source reads succeeded.
- Hero/Overview, Problem/Hypothesis, Design Statement, Goals, and MY OTHER WORKS are verified across Desktop/Tablet/Mobile and recorded in the source map/checklist.

Done:
- Verified Figma MCP can read duplicate file `ehkXrfmxPaRqlKYrlMFOa2` with account `030239230281@st.buh.edu.vn` / handle `UynFa`.
- Repaired several Apollo sections manually or with targeted MCP evidence before this planning phase: Design Statement, Goals, Research / Interviews, Decision #1, approval-flow detail, and Decision #2.
- Wrote spec at `docs/superpowers/specs/2026-05-13-full-page-figma-workflow-design.md`.
- Wrote strict QA spec at `docs/superpowers/specs/2026-05-13-apollo-strict-pixel-qa-loop-design.md`.
- Committed strict QA spec as `d8406a3 docs: add Apollo strict pixel QA spec`.
- Refreshed GitNexus index after stale-index warning with `npx gitnexus analyze`.
- Wrote strict QA implementation plan at `docs/superpowers/plans/2026-05-13-apollo-strict-pixel-qa-loop.md`.
- Reviewed and revised the strict QA plan: added target manifest, top-down gate, absolute geometry gate, visual crop gate, asset gate, and evidence gate.
- Key review finding: crop-only diff can pass while full-page position is still wrong; strict QA must fail lower sections when upstream vertical drift remains.
- Committed spec as `c5b5301 docs: add full-page Figma workflow spec`.
- Wrote implementation plan at `docs/superpowers/plans/2026-05-13-full-page-figma-workflow.md`.
- Added and verified `scripts/extract-figma-links.py`; committed as `ba1b885 chore: add Figma link parser`.
- Added and verified `scripts/capture-apollo-page.sh`; committed as `8b49978 chore: add Apollo screenshot capture script`.
- Added and verified `docs/apollo-design-source-map.md`; committed as `59293de docs: add Apollo design source map`.
- Added and verified `docs/apollo-design-qc-checklist.md`; committed as `d0eb973 docs: add Apollo design QA checklist`.
- Captured local verification screenshots with Chrome headless at 1440, 820, and 390 widths.
- Parsed user-provided Figma links without MCP: Desktop `4789:42050`, Tablet `5342:39642`, Mobile `5362:56942`.
- Recorded the three full-page Figma sources in `docs/apollo-design-source-map.md`.
- Restored this ledger after accidental scoped-commit deletion.
- MCP source reads completed for full-page metadata, Hero screenshots, and Desktop Overview design context.
- Replaced Hero image assets with Figma source screenshots for desktop/tablet/mobile.
- Patched Hero/Overview CSS typography, spacing, source image sizing, and caption handling.
- Final local screenshots captured: `/tmp/apollo-local-overview-desktop-final.png`, `/tmp/apollo-local-overview-tablet-final.png`, `/tmp/apollo-local-overview-mobile-final.png`.
- Hero/Overview layout measurements match Figma: Hero exact at all breakpoints; Result/Meta/Overview exact on mobile; desktop/tablet Meta/Overview within 1px.
- Updated `docs/apollo-design-source-map.md` and `docs/apollo-design-qc-checklist.md` marking Hero/Overview done.
- Downloaded Figma source images for Problem Statements and Hypothesis Comparison across Desktop/Tablet/Mobile.
- Replaced the local Problem/Hypothesis visual block with responsive Figma image assets while keeping the Problem copy as HTML.
- Final local screenshots captured: `/tmp/apollo-local-problem-desktop-final.png`, `/tmp/apollo-local-problem-tablet-final.png`, `/tmp/apollo-local-problem-mobile-final.png`.
- Problem/Hypothesis measurements match Figma source: Desktop `4802:28536` / `4802:28539`, Tablet `5342:39717` / `5342:39718`, Mobile `5362:57008` / `5362:57009`.
- Patched Design Statement spacing/typography across breakpoints.
- Final local screenshots captured: `/tmp/apollo-local-design-statement-desktop-final.png`, `/tmp/apollo-local-design-statement-tablet-final.png`, `/tmp/apollo-local-design-statement-mobile-final.png`.
- Design Statement measurements match Figma source: Desktop `4802:28523`, Tablet `5342:39693`, Mobile `5362:56984`.
- Downloaded Figma source images for Goals cards across Desktop/Tablet/Mobile.
- Final local screenshots captured: `/tmp/apollo-local-goals-desktop-final.png`, `/tmp/apollo-local-goals-tablet-final.png`, `/tmp/apollo-local-goals-mobile-final.png`.
- Goals measurements match Figma source within 0-1px: Desktop `4803:28723`/`5021:10685`/`4803:28730`/`4810:29176`, Tablet `5342:39698`/`5342:39719`/`5342:39703`/`5342:39707`, Mobile `5362:56989`/`5362:57010`/`5362:56994`/`5362:56998`.
- Downloaded Figma source images for MY OTHER WORKS across Desktop/Tablet/Mobile.
- Replaced MY OTHER WORKS with responsive `<picture>` assets in `marketing-data-platform.html` and scoped CSS sizing/gaps in `css/apollo.css`.
- Final local screenshots captured: `/tmp/apollo-local-other-work-desktop-final.png`, `/tmp/apollo-local-other-work-tablet-final.png`, `/tmp/apollo-local-other-work-mobile-final.png`.
- Earlier MY OTHER WORKS crop/size measurements matched Figma source, but strict QA later found absolute full-page y drift.
- Added strict QA target manifest `docs/apollo-strict-qa-targets.json`; committed as `eb496bc docs: add Apollo strict QA target manifest`.
- Added strict QA section capture helper `scripts/apollo-section-capture.js`; committed as `62bf888 chore: add Apollo section capture helper`.
- Added strict QA visual diff helper `scripts/apollo-visual-diff.py`; committed as `8dca20b chore: add Apollo visual diff helper`.
- Added geometry-aware strict QA runner `scripts/run-apollo-visual-qa.sh`; committed as `aeaadd1 chore: add Apollo visual QA runner`.
- Ran strict QA pilot for `other-work`; it failed geometry gate at all breakpoints: desktop local y `15855.59` vs Figma `16751`, tablet local y `16448.73` vs `17012`, mobile local y `14604.98` vs `14167`.
- Strict QA artifacts: `scratch/apollo-visual-qa/other-work/20260513-230242/`.

Now:
- Strict Apollo visual parity workflow spec is approved.
- Strict QA tooling is implemented and pilot run exposed upstream vertical drift.
- Current selected threshold: strict pixel QA.
- Executing revised strict QA implementation plan inline per user request.
- Keep existing server on port `4174` while continuing local verification.

Next:
- Fix earliest upstream section causing vertical drift, then re-run strict QA top-down before marking lower sections done.

Open questions (UNCONFIRMED if needed):
- Exact MCP quota mapping for Figma `student` tier remains UNCONFIRMED because the MCP resource does not list Student/Education as its own row/column.

Working set (files/ids/commands):
- `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`
- `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`
- `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`
- `/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py`
- `/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh`
- `/Users/hafa/Documents/portfolio/docs/apollo-strict-qa-targets.json`
- `/Users/hafa/Documents/portfolio/scripts/apollo-section-capture.js`
- `/Users/hafa/Documents/portfolio/scripts/apollo-visual-diff.py`
- `/Users/hafa/Documents/portfolio/scripts/run-apollo-visual-qa.sh`
- `/Users/hafa/Documents/portfolio/docs/superpowers/plans/2026-05-13-apollo-strict-pixel-qa-loop.md`
- `/Users/hafa/Documents/portfolio/marketing-data-platform.html`
- `/Users/hafa/Documents/portfolio/css/apollo.css`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/hero-dashboard-desktop.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/hero-dashboard-tablet.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/hero-dashboard-mobile.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/problem-statements-desktop.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/problem-statements-tablet.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/problem-statements-mobile.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/hypothesis-comparison-desktop.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/hypothesis-comparison-tablet.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/hypothesis-comparison-mobile.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/other-work-cards-desktop.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/other-work-cards-tablet.png`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/other-work-cards-mobile.png`
- Duplicate Figma file key: `ehkXrfmxPaRqlKYrlMFOa2`
- Desktop source node: `4789:42050`
- Tablet source node: `5342:39642`
- Mobile source node: `5362:56942`
- Local verification URL: `http://localhost:4174/marketing-data-platform.html`
