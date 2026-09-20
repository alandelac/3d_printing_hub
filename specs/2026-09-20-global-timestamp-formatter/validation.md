# Validation — Global Timestamp Formatter

## Roadmap Phase 8 Acceptance

> ISO timestamps render as `YYYY-MM-DD` everywhere, defined once.
> No inline date formatting remains in feature templates, and the formatter has unit coverage.

## Execution summary

This phase is considered complete only when the Angular client has a single source of truth for date formatting and the relevant tests pass. Validation focuses on search, implementation and proof of behavior.

## Local checks executed

Run from the repository root or the client directory:

1. [ ] Search for date-formatting patterns in the Angular client
   - Run: `grep -R "toLocaleDateString\|Date\(|formatDate\|slice(0, 10)" src/3DPrintingHub.Client/src`
   - Expected: no ad hoc timestamp formatting remains in feature templates or components beyond the shared utility.
2. [ ] Verify the shared formatter output
   - Run: the formatter or pipe against `2026-08-25T03:58:56.028895`
   - Expected: output is `2026-08-25`.
3. [ ] Verify null/empty handling
   - Run: the formatter with `null`, empty string and invalid values
   - Expected: safe fallback or empty output without throwing.
4. [ ] Run frontend unit tests
   - Run: `npm test -- --run` from `src/3DPrintingHub.Client`
   - Expected: relevant tests pass and no regression is introduced.
5. [ ] Confirm coverage threshold
   - Run: `npm test -- --coverage`
   - Expected: global frontend coverage remains at or above 80%.
6. [ ] Review the diff for date formatting cleanup
   - Expected: duplicated feature-level date formatting logic is removed or replaced by the shared formatter.

## Failure-path evidence

| Check | Expected Result |
|---|---|
| Inline date formatting search | Should show only the shared formatter use, no repeated template logic |
| Date output test | `2026-08-25T03:58:56.028895` becomes `2026-08-25` |
| Invalid input tests | Null/empty/bad values are handled without exceptions |
| Test run | Frontend suite passes with no new failures |
| Coverage check | Coverage remains above the required 80% threshold |

## Branch protection / repository settings

- [x] Not applicable: this work is a feature branch under the repo’s normal CI gate model.

## Merge checklist status

- [ ] Shared formatter exists and is defined once.
- [ ] Angular pipe or equivalent template integration is in place.
- [ ] Inline date formatting in feature templates has been removed or replaced.
- [ ] Formatter unit tests cover valid and invalid inputs.
- [ ] Frontend test suite passes.
- [ ] Frontend global coverage remains at or above 80%.
- [ ] No unnecessary dependencies were introduced.
- [ ] `requirement.md` scope, decisions and context reviewed and confirmed.

## Validation against mission and tech-stack

From `specs/mission.md`:
- [ ] Discoverable, consistent UI improves the product experience.
- [ ] The change is verified by automated tests, not assumed.

From `specs/tech-stack.md`:
- [ ] The frontend uses Angular standalone components and hand-rolled utilities, with no unnecessary dependency additions.
- [ ] Shared code used by multiple features lives in `core/` or `shared/`.
- [ ] Frontend changes are covered by Vitest with jsdom.
- [ ] Coverage remains at or above 80%. 
