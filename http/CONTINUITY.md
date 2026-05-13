Goal (incl. success criteria):
- Implement a lower-cost, more accurate Apollo/Figma design-QA workflow.
- Success criteria: user provides Desktop/Tablet/Mobile full-page Figma links; Codex uses them as entrypoints, works section by section, verifies local Desktop/Tablet/Mobile screenshots, and does not advance until the current section passes.

Constraints/Assumptions:
- Workspace: `/Users/hafa/Documents/portfolio`.
- Preserve unrelated existing Apollo/Aperia/marketing worktree changes.
- Use Figma MCP as a source tool, not the main QA loop.
- Avoid querying every child node on a whole page.
- Prefer one to three MCP reads per section; allow up to four only when section root discovery is required.
- Local verification target remains `marketing-data-platform.html` with Apollo styling in `css/apollo.css`.
- Inline execution is running in the existing `feat/aperia-figma-rebuild` workspace because the current worktree already contains many related changes.

Key decisions:
- User chose workflow B: balanced section-level MCP source capture plus local screenshot QA.
- User clarified the Desktop/Tablet/Mobile Figma links will be full-page links.
- User approved the full-page workflow design spec.
- User chose Inline Execution.

State:
- Inline setup tasks 1 through 4 are complete.
- Execution is intentionally stopped before Task 5 because Desktop/Tablet/Mobile full-page Figma URLs have not been provided yet.

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

Now:
- Wait for the user to provide all three full-page Figma URLs: Desktop, Tablet, and Mobile.

Next:
- Record Desktop/Tablet/Mobile full-page Figma links in `docs/apollo-design-source-map.md`.
- Parse links with `scripts/extract-figma-links.py` before making any new Figma MCP reads.
- Start the first section verification batch only after the three links are recorded.

Open questions (UNCONFIRMED if needed):
- The actual Desktop, Tablet, and Mobile full-page Figma URLs are not provided yet.
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
- Known useful nodes: `4803:28720`, `4803:28724`, `4803:28744`
- Local verification URL: `http://localhost:4174/marketing-data-platform.html`
