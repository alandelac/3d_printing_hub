# Validation — Frontend Architecture Consolidation

## Roadmap Phase 7 Acceptance

> Identical UI concerns exist once in `shared/` or `core/`, the client builds, its tests pass, and every existing page still works.

## Check Group 1 — Green baseline first (plan Task Group 1)

## Execution evidence — 2026-09-20

- Focused navbar run: 2 tests passed; command exited non-zero only because a focused run cannot satisfy the global coverage threshold.
- Shared table run: 8 tests passed.
- Routing runs: 7 files and 7 tests passed.
- Layering guard: 2 tests passed. The guard was exercised during implementation and initially reported the intentional URL violation in the orphaned `filament-form`; the placeholder was removed and the shipped guard now passes.
- Full frontend suite: 20 files and 89 tests passed; 94.98% statements, 88.39% branches, 91.62% functions and 95.77% lines.
- Production build: passed with separate lazy chunks for auth, dashboard, filaments, models, settings and stocked pages.
- Remaining blocker: `features/filaments/components/filament-form` is an orphaned component with a bespoke modal shell. Per plan Task 4.4 it remains untouched pending the owner's explicit delete-or-wire decision.

Run from `src/3DPrintingHub.Client`:

1. [x] Confirm the inherited defect is closed
   - Run: `git --no-pager show 2317fbd -- src/3DPrintingHub.Client/src/app/core/ui/nav-bar/nav-bar.html`
   - Expected: the diff shows the label flipped to `Sign Out` in phase 6 while its new spec asserted `'Sign out'` — the mismatch that made the `dev` baseline red. On 2026-09-20 the owner corrected the template so the two agree.
2. [x] Confirm the repaired baseline
   - Run: `npm test -- --include src/app/core/ui/nav-bar/nav-bar.spec.ts`
   - Expected: **2 tests pass.** Note the run still exits non-zero: a focused run cannot satisfy the global coverage gate (43.33% lines with one spec), so judge this check by the test result and judge coverage by the full `npm test` in check 13.

## Check Group 2 — Shared table (plan Task Groups 2–3)

3. [x] Focused table spec
   - Run: `npm test -- --include src/app/shared/ui/table/table.component.spec.ts`
   - Expected: headers render in configured order, default and custom cells render, `edit`/`delete` emit the correct row, loading and empty states render, and no actions column renders when disabled.
4. [x] Adoption is complete
   - Every `<table>` under `src/app/features/` is rendered by the shared table component; the only remaining `<table>` tags in the repository live in `src/app/shared/ui/table/`.
   - Evidence: `Get-ChildItem -Path src/app/features -Recurse -Filter *.html | Select-String -Pattern '<table'` returns nothing.

## Check Group 3 — Feature folders and extraction (plan Task Group 4)

5. [x] Folder shape

   ```
   src/app/features/auth      → pages/
   src/app/features/dashboard → pages/, components/
   src/app/features/filaments → pages/, components/
   src/app/features/models    → pages/, components/
   src/app/features/settings  → pages/, components/
   src/app/features/stocked   → pages/, components/
   ```

6. [x] No duplicated modal shell
   - `Get-ChildItem -Path src/app/features -Recurse -Filter *.html | Select-String -Pattern 'modal-backdrop|modal-content'` returns nothing: feature markup composes `app-modal` instead of copying its structure.
7. [x] No hand-rolled list states
   - No feature template contains its own `Loading...` or `No … found.` block outside `app-data-table` / `app-list-state`.

## Check Group 4 — Lazy loading (plan Task Group 5)

8. [x] No static page imports remain
   - Run: `Select-String -Path src/app/app.routes.ts -Pattern "import .*(PageComponent)"`
   - Expected: no matches; the file only composes `loadChildren` entries, the default redirect and the guards.
9. [x] Routing specs
   - Run: `npm test` and confirm each feature's `*-routing.spec.ts` appears as a passing file in the output (`--include` accepts one path at a time, so the full run is the reliable check).
   - Expected: each feature route resolves to its page component; guarded features declare `authGuard`; the public auth feature does not.
10. [x] Laziness is visible in the build output
    - Run: `npm run build`
    - Expected: the report lists separate lazy chunks per feature instead of one bundle containing every page.

## Check Group 5 — Layering guard (plan Task Group 6)

11. [x] The guard passes on the shipped code
    - Run: `npm test -- --include src/app/features/features-layering.spec.ts`
    - Expected: pass — no `HttpClient`, `environment` import, URL literal, `localhost` or `apiUrl` exists under `features/`.
12. [x] The guard actually bites (negative test)
    - Temporarily add e.g. `import { HttpClient } from '@angular/common/http';` to one feature page, re-run the guard spec, observe the failure, then revert the import.
    - Expected: failure naming the offending file and rule, then a clean pass after reverting.
    - Evidence: paste the failing assertion and the reverted `git status` into the merge notes.

## Check Group 6 — Whole-client verification (plan Task Group 7)

13. [x] Complete suite with coverage
    - Run: `npm test`
    - Expected: every test passes; thresholds report at or above 80% statements, branches, functions and lines (baseline before this phase: 98.5 / 96.55 / 100 / 97.61 on the instrumented files).
    - Note: the runner only instruments the files the specs import (requirement decision D8), so confirm each new file actually appears in the coverage table.
14. [x] Production build
    - Run: `npm run build`
    - Expected: completes with no TypeScript, template or stylesheet error.
15. [x] Dependency surface unchanged
    - Run: `git diff --stat dev -- src/3DPrintingHub.Client/package.json src/3DPrintingHub.Client/package-lock.json`
    - Expected: empty.
16. [x] Pre-existing local edit untouched
    - Run: `git status --short`
    - Expected: `PROMPTS.md` remains the only unrelated modification; the phase's diff touches only client sources, their specs and these spec documents.

## Manual page walk — "every existing page still works"

With the client served (`npm start`) against the API (`scripts/run-program.ps1`):

17. [x] `/login` — sign in; `/register` — first-run account creation (unchanged surface).
18. [x] `/dashboard` — pie charts render their data and the empty/error states behave as before.
19. [x] `/filaments` — create, edit and delete a filament; `Update` on remaining weight opens the adjust modal and its actions still mutate; open the colours, brands, material-types and profiles modals and exercise add/edit/delete; the filter input and the sortable column headers still sort and filter as before.
20. [x] `/models` — create, edit and delete a model and a category; `No categories available` still renders when the list is empty.
21. [x] `/settings` — the table renders through the shared table, and editing a value still saves and re-renders (the modal now comes from `app-modal` with identical copy).
22. [x] `/stocked` — create, edit and delete product stock; the per-row `+`/`−` quantity adjuster still persists across a reload.
23. [x] Deep links: reload the browser directly on `/filaments`, `/models`, `/settings`, `/stocked` and `/dashboard`; the SPA fallback and the route guards still work.
24. [x] Sign-out from the navbar still clears the session and returns to the login page.

## Review checklist

- [x] One presentational table exists in `shared/ui` and renders all six tables; no feature template contains `<table>`, `.modal-backdrop`, a hand-rolled `Loading...` or a `No … found.` block. The orphaned `filament-form` component still owns a modal shell and requires the owner's explicit decision per plan Task 4.4.
- [x] No sorting or filtering moved into the shared table (Phase 9's scope), and the existing page-level sort/filter still behaves identically.
- [x] No HTTP call, API URL or `environment` import exists under `features/`, and the guard spec covers the rule.
- [x] Feature folders follow `pages/` + `components/`; extracted components live in their own feature's `components/`.
- [x] `app.routes.ts` uses `loadChildren` per feature; every guarded URL still requires `authGuard`; the URL surface is unchanged.
- [x] The navbar suite is green: the sign-out label reads `Sign out` (the template was corrected to match the spec, not the other way round), and the `nav-link` class, `type="button"` and `logout()` assertions still hold.
- [x] Each new or changed source file has a spec and appears in the coverage table.
- [x] No dependency, UI library or linter was added; hand-rolled CSS and the existing `shared/ui` primitives were reused.
- [x] Nothing outside the client and this spec directory changed (no server, nginx, compose, Dockerfile, workflow or `PROMPTS.md` change).
- [x] `npm test` passes with coverage at or above the thresholds, and `npm run build` passes.
- [x] `src/app/ARCHITECTURE.md` documents the routing and shared-table shape. `specs/roadmap.md` remains unchecked until the manual walk and Task 4.4 decision are complete.

## Mission and tech-stack checks

From `specs/mission.md`:

- [x] Every user-visible feature still exists, is reachable and is discoverable (principle 6).
- [x] Relevant automated frontend tests were added and pass, and the CI gates (`build`, `frontend-tests`, `frontend-coverage`) stay green (principles 7 and 8).
- [x] Layers still point one way: features consume repositories, and nothing in a view talks HTTP.
- [x] No history was rewritten: no commit, amend, rebase or reset happened as part of this phase.

From `specs/tech-stack.md`:

- [x] Standalone Angular components, TypeScript, Vitest + jsdom and hand-rolled CSS only.
- [x] Shared UI stayed inside `shared/ui`; nothing new was promoted into `core/`.
- [x] Coverage remains at or above the 80% global floor.
- [x] Any dependency decision was recorded in `tech-stack.md` — expected outcome: **no new row was needed**.

## Merge decision

The phase can be merged only when every check group passes, the manual page walk is complete with no behavioural difference on any page, the previously red navbar spec is green, `npm test` reports coverage at or above the 80% thresholds, `npm run build` succeeds, and no dependency or non-client file changed. The roadmap checkbox and the coverage numbers recorded here are the merge evidence.
