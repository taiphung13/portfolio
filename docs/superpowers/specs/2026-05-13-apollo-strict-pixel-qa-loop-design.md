# Apollo Strict Pixel QA Loop Design

## Goal

Make Apollo Figma-to-code work pass a stricter test-fix-test loop before each section is marked complete. The workflow should reduce manual user review by using source screenshots, local screenshots, cropped visual diffs, and DOM box checks across Desktop, Tablet, and Mobile.

## Success Criteria

- Each section is verified at Desktop `1440`, Tablet `820`, and Mobile `390`.
- Key section boxes are within `2px` of the Figma source for x position, width, height, and important vertical gaps.
- Local screenshot crops are compared against Figma source crops, and the section only passes when there are no large visible diff regions.
- The visual diff report includes enough evidence to explain what failed and what was fixed.
- Codex does not move to the next section until the current section passes all three breakpoints or an explicit fallback decision is recorded.

## Recommended Approach

Use a crop-based visual diff loop as the default workflow.

For each section:

1. Map the source section node for Desktop, Tablet, and Mobile.
2. Export or capture Figma source screenshots for those nodes.
3. Capture local page screenshots at matching viewport widths.
4. Locate the local section by selector and crop the local screenshot to that section.
5. Compare each local crop against the corresponding Figma source image.
6. Measure key DOM boxes and compare them to the expected Figma geometry.
7. Fix only the section-specific HTML/CSS/assets causing the drift.
8. Repeat the loop until the section passes or reaches the retry limit.

## Fallback Approach

Use responsive Figma image assets only for sections that are too complex to reproduce accurately as real HTML within the strict threshold. This is acceptable for dense dashboards, tables, diagrams, workflow boards, or mockup galleries where small typography and nested UI details make hand-coded parity expensive.

Fallback use must be recorded in the source map with:

- Reason for using image-lock.
- Figma node IDs for Desktop, Tablet, and Mobile.
- Generated asset paths.
- Local verification screenshots.

## Retry Rule

Each section gets up to three fix cycles per breakpoint group:

- Cycle 1: fix obvious geometry, spacing, and asset mismatch.
- Cycle 2: fix typography, crop, and internal visual mismatch.
- Cycle 3: final polish or choose image-lock fallback for complex UI.

If a section still fails after three cycles, stop and record the exact blocker instead of silently marking it done.

## Pass/Fail Outputs

Every completed section must update:

- `docs/apollo-design-source-map.md`
- `docs/apollo-design-qc-checklist.md`
- `http/CONTINUITY.md`

The evidence should include:

- Figma source image paths or MCP screenshot references.
- Local screenshot paths.
- Visual diff image paths.
- DOM metric summary.
- Final pass/fail status per breakpoint.

## Tooling Shape

The implementation should add small focused scripts rather than a large framework:

- A capture helper for local screenshots.
- A crop helper that crops by DOM selector bounding box.
- A visual diff helper that reports mismatch percentage and writes a diff image.
- A section QA runner that ties one section, three breakpoints, and one selector together.

The scripts should write artifacts under `scratch/apollo-visual-qa/<section>/` so repeated runs do not overwrite evidence from previous attempts.

## Scope Control

This workflow changes process and QA tooling first. It does not redesign the Apollo page by itself.

When implementation starts, edits should stay surgical:

- Add QA scripts and docs first.
- Run the loop on one currently failing section.
- Patch only the selectors, assets, or markup for that section.
- Do not refactor unrelated Apollo sections while chasing one diff.

## Open Decisions Resolved

- Accuracy mode: strict pixel QA.
- Default comparison: section crop, not full-page diff.
- Full-page screenshots: useful for evidence, not primary pass/fail.
- Complex UI fallback: allowed, but must be documented.
