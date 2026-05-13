Goal (incl. success criteria):
- Implement a lower-cost, more accurate Apollo/Figma design-QA workflow.
- Success criteria: user provides Desktop/Tablet/Mobile full-page Figma links; Codex uses them as entrypoints, works section by section, verifies local Desktop/Tablet/Mobile screenshots, and does not advance until the current section passes.
- Current goal: use Dev Mode links plus MCP plus local screenshots to fix Apollo sections accurately before moving to the next section.

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

State:
- Inline setup tasks 1 through 5 are complete.
- Desktop/Tablet/Mobile Dev Mode full-page links were provided and parsed without MCP.
- Next execution step is MCP account confirmation and first section verification batch.

Done:
- Verified Figma MCP can read duplicate file `ehkXrfmxPaRqlKYrlMFOa2` with account `030239230281@st.buh.edu.vn` / handle `UynFa`.
- Repaired several Apollo sections manually or with targeted MCP evidence before this planning phase: Design Statement, Goals, Research / Interviews, Decision #1, approval-flow detail, and Decision #2.
- Wrote spec at `docs/superpowers/specs/2026-05-13-full-page-figma-workflow-design.md`.
- Committed spec as `c5b5301 docs: add full-page Figma workflow spec`.
- Wrote implementation plan at `docs/superpowers/plans/2026-05-13-full-page-figma-workflow.md`.
- Added and verified `scripts/extract-figma-links.py`; committed as `ba1b885 chore: add Figma link parser`.
- Added and verified `scripts/capture-apollo-page.sh`; committed as `8b49978 chore: add Apollo screenshot capture script`.
- Added and verified `docs/apollo-design-source-map.md`; committed as `59293de docs: add Apollo design source map`.
- Added and verified `docs/apollo-design-qc-checklist.md`; committed as `d0eb973 docs: add Apollo design QA checklist`.
- Captured local verification screenshots with Chrome headless at 1440, 820, and 390 widths; server on port `4174` was stopped after verification.
- Parsed user-provided Figma links without MCP: Desktop `4789:42050`, Tablet `5342:39642`, Mobile `5362:56942`.
- Recorded the three full-page Figma sources in `docs/apollo-design-source-map.md`; commit `ba4a972` accidentally deleted this ledger and must be repaired immediately.

Now:
- Restore `http/CONTINUITY.md` after the scoped commit mistake.
- Confirm MCP account with `whoami`.
- Start the first section verification batch from the QA checklist.

Next:
- Use section-level MCP evidence and local screenshots at 1440, 820, and 390.
- Fix only the current section before moving to the next one.

Open questions (UNCONFIRMED if needed):
- Exact MCP quota mapping for Figma `student` tier remains UNCONFIRMED because the MCP resource does not list Student/Education as its own row/column.

Working set (files/ids/commands):
- `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`
- `/Users/hafa/Documents/portfolio/docs/superpowers/specs/2026-05-13-full-page-figma-workflow-design.md`
- `/Users/hafa/Documents/portfolio/docs/superpowers/plans/2026-05-13-full-page-figma-workflow.md`
- `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`
- `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`
- `/Users/hafa/Documents/portfolio/scripts/extract-figma-links.py`
- `/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh`
- `/Users/hafa/Documents/portfolio/marketing-data-platform.html`
- `/Users/hafa/Documents/portfolio/css/apollo.css`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/`
- Duplicate Figma file key: `ehkXrfmxPaRqlKYrlMFOa2`
- Desktop source node: `4789:42050`
- Tablet source node: `5342:39642`
- Mobile source node: `5362:56942`
- Local verification URL: `http://localhost:4174/marketing-data-platform.html`
