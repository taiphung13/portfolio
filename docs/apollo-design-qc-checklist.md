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
