# Full-Page Figma Workflow Design

## Goal

Use three full-page Figma links for Desktop, Tablet, and Mobile as the source of truth for Apollo design matching, while keeping MCP usage controlled and removing the need for the user to manually inspect every mismatch.

## Approved Direction

The approved workflow is:

> Full-page Figma links are the entrypoint, section-level captures are the working source, and local three-breakpoint screenshots are the verification gate.

The user will provide full-page Figma links for Desktop, Tablet, and Mobile. Codex will not repeatedly fetch or inspect entire pages. Codex will map the full-page sources into sections, work section by section, and only move to the next section when the current section passes local verification at the relevant breakpoints.

## Context

The project is a static portfolio site in `/Users/hafa/Documents/portfolio`.

Primary local files:

- `/Users/hafa/Documents/portfolio/marketing-data-platform.html`
- `/Users/hafa/Documents/portfolio/css/apollo.css`
- `/Users/hafa/Documents/portfolio/assets/images/apollo/`
- `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`

Current Figma context:

- Duplicate file key: `ehkXrfmxPaRqlKYrlMFOa2`
- Original file key: `ToLSH2XQ70DIGScq0vKWmF`
- Known working MCP account from prior verification: `030239230281@st.buh.edu.vn`
- Known handle: `UynFa`
- Known useful nodes:
  - `4803:28720`: Design Statement label
  - `4803:28724`: Goals label
  - `4803:28744`: Research / User interviews block

## Source Inputs

The user will provide:

- Desktop full-page Figma link
- Tablet full-page Figma link
- Mobile full-page Figma link

Each link should point to the intended full-page frame or canvas state for the same Apollo page at that breakpoint.

Codex will parse:

- Figma file key
- Node ID
- Breakpoint label: Desktop, Tablet, or Mobile

If a link lacks a node ID, Codex will ask for a corrected link before using MCP reads.

## MCP Usage Strategy

MCP is used as a source tool, not as the main QA loop.

Allowed MCP usage:

- `whoami` at the start of a batch to confirm the current Figma account.
- `get_metadata` only when the section root nodes need to be discovered.
- `get_screenshot` for section-level visual source captures.
- `get_design_context` for small precise nodes such as labels, icons, typography, or text blocks.

Avoided MCP usage:

- Do not query every child node of a full page.
- Do not repeatedly screenshot full-page frames after every edit.
- Do not use MCP to inspect local implementation; local screenshots handle that.

Budget rules:

- One batch starts with `whoami`.
- Initial mapping may use one metadata read per full-page link if needed.
- Each section should target one to three MCP reads total across Desktop, Tablet, and Mobile.
- A section may use up to four MCP reads only when node discovery is required.
- If a rate-limit or access error appears, stop MCP reads and use existing exports or local source crops for that section.

## Section Workflow

For each section:

1. Identify the local section anchor in `marketing-data-platform.html`.
2. Identify the matching section region in the Desktop, Tablet, and Mobile Figma full-page sources.
3. Capture section-level source evidence from Figma or from a cached full-page export.
4. Start local server with `python3 -m http.server 4174`.
5. Capture local screenshots at the corresponding widths:
   - Desktop: `1440`
   - Tablet: `820`
   - Mobile: `390`
6. Compare source and local screenshots using the checklist below.
7. Make scoped fixes only in the section's HTML/CSS/assets.
8. Re-capture local screenshots.
9. Mark the section complete only when the verification gate passes.
10. Update `http/CONTINUITY.md` with the source used, local evidence, and current status.

## Verification Gate

A section passes only when all applicable checks are true:

- Required headings are present and ordered correctly.
- Required body text is present and not hidden.
- Required images/assets appear and are not cropped incorrectly.
- The section order matches Figma.
- There are no duplicated old blocks.
- Desktop screenshot matches the intended source within practical tolerance.
- Tablet screenshot does not introduce layout regressions.
- Mobile screenshot does not introduce overflow, overlap, or unreadable text.
- All referenced local assets return HTTP `200`.
- Any intentional difference is recorded in `http/CONTINUITY.md`.

Practical tolerance means the implementation may differ by a few pixels in browser text rendering, but not in content order, missing content, major spacing, image crop, section composition, or responsive behavior.

## Fix Strategy

Use the simplest accurate representation per section:

- Real HTML/CSS for headings, body copy, labels, icons, reusable text blocks, and normal layout.
- Cropped/exported image assets for complex static visuals such as workflow diagrams, annotated tables, dashboard screenshots, and large Figma-composed case-study canvases.
- Scoped CSS selectors for each section, such as `.apl-decision-one`, `.apl-decision-two`, or `.apl-statement-section`.

Do not refactor unrelated sections while fixing one section.

Do not flatten the entire page into one image.

Do not rebuild complex diagrams by hand when a cropped/exported design asset is more accurate and cheaper.

## Tracking Files

The workflow should create or maintain these files:

- `/Users/hafa/Documents/portfolio/docs/apollo-design-source-map.md`
  - Records Figma links, node IDs, source captures, MCP calls used, local evidence, and section status.
- `/Users/hafa/Documents/portfolio/docs/apollo-design-qc-checklist.md`
  - Tracks which sections are pending, in progress, or done across Desktop, Tablet, and Mobile.
- `/Users/hafa/Documents/portfolio/scripts/capture-apollo-page.sh`
  - Captures deterministic local screenshots through Chrome headless.
- `/Users/hafa/Documents/portfolio/http/CONTINUITY.md`
  - Keeps the current goal, state, decisions, and evidence compact for future turns.

## Error Handling

If Figma MCP access fails:

- Run `whoami`.
- Confirm the current MCP account is the intended account.
- Stop further read calls for the batch if access is wrong or quota is hit.
- Use existing hires exports or ask the user to duplicate/share the Figma file only if no usable source exists.

If a full-page Figma screenshot is too large:

- Do not retry full-page screenshot repeatedly.
- Use metadata to locate section roots.
- Capture only section-level screenshots.

If local screenshot capture fails:

- Confirm the local server responds with `curl -I http://localhost:4174/marketing-data-platform.html`.
- Confirm Chrome exists at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Fix the capture command before making design changes.

## Batch Policy

Work in small batches:

- Preferred batch size: one section when the section is complex.
- Maximum batch size: three sections when they are simple and adjacent.
- Do not move to the next section until the current section passes the verification gate.
- Report evidence after each completed section instead of waiting until the entire page is done.

## Recommended First Batch

After the user provides the three full-page links:

1. Confirm MCP account with `whoami`.
2. Build the source map from the three full-page links.
3. Start with the next unverified section after the already-repaired Decision #1 and Decision #2.
4. Verify Decision #3 across Desktop, Tablet, and Mobile.
5. Continue to Results only after Decision #3 passes.

## Success Criteria

The workflow is successful when:

- The user no longer needs to manually inspect and report every mismatch.
- Codex can show which section is being worked on, which source was used, and which screenshots verify it.
- MCP calls are bounded and recorded.
- Each section is checked at Desktop, Tablet, and Mobile before completion.
- The implementation remains maintainable: text and normal layout stay in HTML/CSS, while complex static visuals use explicit assets.

## Non-Goals

- This workflow does not attempt to convert the whole Figma page into generated code automatically.
- This workflow does not try to make every pixel identical when browser rendering naturally differs.
- This workflow does not introduce a new build framework or visual testing dependency unless later approved.
- This workflow does not commit unrelated existing worktree changes.

## Self-Review

- Placeholder scan: no incomplete placeholders remain.
- Scope check: the spec covers one workflow for Apollo Figma-to-local QA, not a general design system migration.
- Ambiguity check: full-page links are inputs, but section-level captures are the working source.
- Consistency check: MCP is used for source capture, local Chrome screenshots are used for implementation verification.
