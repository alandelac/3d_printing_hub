# Validation — Global Table Component

## Roadmap Phase 9 Acceptance

> One reusable table component with sorting and filtering, used app-wide across both page tables and modal tables.
> All list-based tables in the app, including modal tables, lose their bespoke sort/filter logic and behave identically or better under one shared component.

## Execution summary

This phase is complete only when the Angular client has a genuinely shared table implementation and every affected screen behaves the same way under that component. Validation focuses on code review, frontend behavior and the delivery of the repository’s required tests.

## Local checks executed

Run from the repository root or the client directory:

1. [ ] Search the client for bespoke table implementations
   - Run: `grep -R "sort\|filter\|table" src/3DPrintingHub.Client/src/app`
   - Expected: only the shared table implementation owns the common table lifecycle; remaining feature-specific code handles data, not row-shell behavior.
2. [ ] Verify the shared table contract
   - Run: inspect the shared component API and confirm it accepts rows plus sortable/filterable metadata.
   - Expected: the component can be used by both feature pages and modal content without per-screen table duplication.
3. [ ] Validate main feature tables
   - Check: filament, model and stock tables still render and sort/filter as expected after migration.
   - Expected: each feature keeps its domain behavior but uses the shared table shell.
4. [ ] Validate modal tables
   - Check: brand, color and material-type lists or similar dialogs render correctly and behave consistently with the same sort/filter mechanics.
   - Expected: modal table logic uses the shared pattern rather than bespoke implementations.
5. [ ] Run frontend unit/component tests
   - Run: `npm test -- --run` from `src/3DPrintingHub.Client`
   - Expected: the relevant Angular tests pass and no regressions are introduced.
6. [ ] Confirm coverage threshold
   - Run: `npm test -- --coverage`
   - Expected: global frontend coverage remains at or above 80%.
7. [ ] Review the diff for cleanup
   - Expected: duplicated sort/filter logic has been removed or replaced by the shared component, and feature code is simpler.

## Failure-path evidence

| Check | Expected Result |
|---|---|
| Shared table search | The app should not contain multiple overlapping page-level table implementations doing the same job |
| Main page validation | Filament/model/stock screens still work after migration |
| Modal validation | Brand/color/material-type modal lists still load and sort/filter correctly |
| Test run | Frontend suite passes without new failures |
| Coverage check | Coverage remains above 80% |

## Branch protection / repository settings

- [ ] Not applicable for this spec: the branch is validated under the usual CI gate model before merge.

## Merge checklist status

- [ ] Shared table component exists in the shared UI layer.
- [ ] Sort and filter behavior is centralized in one place.
- [ ] Main feature tables use the shared component.
- [ ] Modal tables use the shared component.
- [ ] Duplicated per-feature sort/filter code has been removed or reduced.
- [ ] Frontend tests pass.
- [ ] Frontend global coverage remains at or above 80%.
- [ ] No unnecessary UI library or dependency was added.
- [ ] `requirement.md` scope, decisions and context reviewed and confirmed.

## Validation against mission and tech-stack

From `specs/mission.md`:
- [ ] The app remains easy to use and consistent across screens.
- [ ] Features are verified by automated tests before merge.

From `specs/tech-stack.md`:
- [ ] The implementation respects the Angular standalone architecture and shared UI layering.
- [ ] The client remains dependency-light and does not add a heavy table framework without a documented decision.
- [ ] Frontend changes are validated with Vitest and jsdom.
- [ ] Coverage remains at or above 80%.
