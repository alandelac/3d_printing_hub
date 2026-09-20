# Plan — Frontend Architecture Consolidation

## Overview

Phase 7 turns six hand-rolled page shells into one shared presentational table plus feature-owned form components, lazy-loads every feature through per-feature route files, and locks the layering rule with a source-scanning guard spec. Task groups are ordered so the suite is green before anything is refactored, and so each group can be verified on its own.

Commands below run from `src/3DPrintingHub.Client` unless stated otherwise.

## Task Group 1 — Restore a green baseline

| # | Task | Description |
|---|------|-------------|
| 1.1 | Reproduce the inherited failure | Run `npm test -- --include src/app/core/ui/nav-bar/nav-bar.spec.ts` and confirm the single failure: the spec asserts `'Sign out'` while `nav-bar.html` renders `'Sign Out'` (introduced by commit `2317fbd`, merged in phase 6). |
| 1.2 | Confirm the resolution | The owner aligned the shipped label to the spec: `nav-bar.html` now reads `Sign out`. Verify the spec, the `nav-link` class, `type="button"` and the click handler are untouched and that the focused test passes — do not rename the button again (decision D3). |
| 1.3 | Confirm green + record coverage | Run `npm test` and record the reported thresholds (baseline measured 2026-09-20: 10 tests / 4 files, 98.5% statements, 96.55% branches, 100% functions, 97.61% lines). |
| 1.4 | Confirm the build | Run `npm run build` and store the evidence for `validation.md` task group 1. |

## Task Group 2 — Build the shared presentational table

| # | Task | Description |
|---|------|-------------|
| 2.1 | Define the contract | Add `src/app/shared/ui/table/table.component.ts` with `TableColumn<T>` (`key`, `header`, optional `value: (row) => …`, optional `cssClass`) and a `TableCellDirective` (`appTableCell="<columnKey>"`) used on `<ng-template>` to register a custom cell per column. |
| 2.2 | Implement the component | Inline template + styles, matching the single-file convention of `modal`, `list-state`, `table-actions` and `confirm-delete`. It owns the `.table-scroll` wrapper, the `<table>`/`<thead>` shell, default cell rendering via `column.value(row)`, `contentChildren` lookup for custom cells, and an optional trailing actions column that renders `app-table-actions` and re-emits `edit`/`delete` with the row. |
| 2.3 | Compose the list states | Inputs `loading`, `emptyText` and `rows`; the component wraps its output in the existing `app-list-state` so loading/empty rendering is identical everywhere and pages stop hand-rolling it. |
| 2.4 | Spec the component | `table.component.spec.ts`: renders configured headers in order, renders default values, honours a custom cell template, emits `edit`/`delete` with the correct row, shows the loading and empty states, and renders no actions column when disabled. |
| 2.5 | Keep Phase 9 out | Add **no** sorting or filtering inputs or logic. The component's inputs are the extension point Phase 9 will build on; Phase 7 only guarantees identical rendering. |

## Task Group 3 — Adopt the shared table and shells, one page at a time

Each task below is independently reviewable: adopt the shared table, delete the page's own `<table>` shell and hand-rolled loading/empty blocks, keep behaviour and copy identical, then run the affected spec.

| # | Task | Description |
|---|------|-------------|
| 3.1 | Settings page | Replace the hand-rolled `.modal` block (`settings-page.component.html:34-67`) with `app-modal`, and replace the hand-rolled loading/empty/table blocks with the shared table. |
| 3.2 | Stocked page | Replace the hand-rolled loading/empty/table block with the shared table, keeping the per-row quantity adjuster as a custom cell template and `app-table-actions` for edit/delete. |
| 3.3 | Models page | Adopt the shared table for both tables (models and categories), keeping the model/category modals and their `app-table-actions` wiring unchanged. |
| 3.4 | Filaments page | Adopt the shared table for both tables (filaments and profiles), keeping the sortable `th` click handlers, the filter input, the swatch cell, the weight-update cell and the buy-link cell exactly as they behave today (custom cell templates). |
| 3.5 | Small tidy-ups in touched files | Remove the leftover debug `console.log` in `filaments-page.component.ts`; do not restructure anything else. |
| 3.6 | Page specs | Add focused component specs for the touched pages proving the shared table is used and the page's key interactions still work (load, edit, delete-confirm), so every page file stays inside the coverage instrumentation. |

## Task Group 4 — Extract feature components into `components/`

| # | Task | Description |
|---|------|-------------|
| 4.1 | Models | Move the create/edit model form and the category modal markup into `features/models/components/` (`model-form-modal`, `category-modal`), leaving the page to own state and orchestration. |
| 4.2 | Settings | `features/settings/components/setting-form-modal` owns the edit form markup and its fields. |
| 4.3 | Stocked | `features/stocked/components/stock-form-modal` owns the create/edit form markup and the model/filament selects. |
| 4.4 | Orphaned components | Report the three components imported by nothing (`filament-card`, `filament-form`, `profiles-modal`) and either wire them in or delete them **with the owner's explicit go-ahead** — git keeps the history. This phase must not depend on the answer; if the owner defers, the files stay and no other task changes. |
| 4.5 | Component specs | Each extracted component gets a spec (inputs render, outputs emit, disabled/loading states). |

## Task Group 5 — Lazy-load every feature

| # | Task | Description |
|---|------|-------------|
| 5.1 | Feature routing files | Add `auth-routing.ts`, `dashboard-routing.ts`, `filaments-routing.ts`, `models-routing.ts`, `settings-routing.ts` and `stocked-routing.ts`, each exporting `Routes` that map the feature's paths to its pages. |
| 5.2 | Rewire `app.routes.ts` | Remove the static page imports; register each feature with `loadChildren: () => import('./features/<x>/<x>-routing').then(m => m.routes)`. Keep `''` → `dashboard` with `pathMatch: 'full'`, keep `/login` and `/register` public, and apply `authGuard` to every guarded feature at the parent route. |
| 5.3 | URL surface unchanged | `/dashboard`, `/filaments`, `/models`, `/settings`, `/stocked`, `/login`, `/register` and `''` all keep resolving; no wildcard route is added or removed in this phase. |
| 5.4 | Routing specs | Assert each feature route resolves to its page component, that guarded features declare `authGuard`, and that the public auth feature does not. |
| 5.5 | Prove laziness in the build | Run `npm run build` and confirm the output contains per-feature lazy chunks instead of one bundle with every page inlined. |

## Task Group 6 — Lock the layering rule

| # | Task | Description |
|---|------|-------------|
| 6.1 | Guard spec | Add `src/app/features/features-layering.spec.ts` that walks `features/**/*.ts` (excluding `*.spec.ts`) and fails when it finds `HttpClient`, an import of `environments/environment`, an `http://`/`https://` literal, `localhost`, or `apiUrl`. |
| 6.2 | Folder-shape assertion | In the same spec, assert that every feature directory contains a `pages/` folder and that the features with extraction work also contain `components/`. |
| 6.3 | Prove the guard bites | Temporarily add a violating import, watch the spec fail, then revert — and record that evidence in `validation.md`. |

## Task Group 7 — Documentation and final verification

| # | Task | Description |
|---|------|-------------|
| 7.1 | Update `src/app/ARCHITECTURE.md` | Document the per-feature `<feature>-routing.ts` lazy-loading shape and add the shared table to the `shared/ui` inventory, so the doc matches the code it already prescribes. |
| 7.2 | Update `specs/roadmap.md` | Mark Phase 7 as covered once acceptance passes. |
| 7.3 | Full verification | Run the focused specs, the complete suite with coverage, and the production build; fill in `validation.md`. |
| 7.4 | Hand back, do not commit | Report what changed, what was verified, and the proposed commit message(s). Per `specs/mission.md`, the owner declares every commit — this phase ends with an uncommitted, verified branch. |

## Success Criteria

- Every table renders through one presentational component in `shared/ui`; no feature template contains a `<table>` or a hand-rolled modal/loading/empty shell.
- `features/models`, `features/settings` and `features/stocked` have `components/` folders holding their extracted components.
- `app.routes.ts` contains no static page import; each feature loads through its own routing file and keeps `authGuard`.
- The layering guard spec passes as shipped and fails when a feature component touches HTTP or an API URL.
- `npm test` is green — including the previously failing navbar spec — with coverage at or above the 80% thresholds, and `npm run build` succeeds.
- No dependency was added and every existing page still works.
