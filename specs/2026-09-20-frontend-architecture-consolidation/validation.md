# Validation — Frontend Architecture Consolidation

## Roadmap Phase 7 Acceptance

> Identical UI concerns exist once in `shared/` or `core/`, the client builds, its tests pass, and every existing page still works.

## Check Group 1 — Green baseline first (plan Task Group 1)

Run from `src/3DPrintingHub.Client`:

1. [ ] Confirm the inherited defect is closed
   - Run: `git --no-pager show 2317fbd -- src/3DPrintingHub.Client/src/app/core/ui/nav-bar/nav-bar.html`
   - Expected: the diff shows the label flipped to `Sign Out` in phase 6 while its new spec asserted `'Sign out'` — the mismatch that made the `dev` baseline red. On 2026-09-20 the owner corrected the template so the two agree.
2. [ ] Confirm the repaired baseline
   - Run: `npm test -- --include src/app/core/ui/nav-bar/nav-bar.spec.ts`
   - Expected: **2 tests pass.** Note the run still exits non-zero: a focused run cannot satisfy the global coverage gate (43.33% lines with one spec), so judge this check by the test result and judge coverage by the full `npm test` in check 13.

## Check Group 2 — Shared table (plan Task Groups 2–3)

3. [ ] Focused table spec
   - Run: `npm test -- --include src/app/shared/ui/table/table.component.spec.ts`
   - Expected: headers render in configured order, default and custom cells render, `edit`/`delete` emit the correct row, loading and empty states render, and no actions column renders when disabled.
4. [ ] Adoption is complete
   - Every `<table>` under `src/app/features/` is rendered by the shared table component; the only remaining `<table>` tags in the repository live in `src/app/shared/ui/table/`.
   - Evidence: `Get-ChildItem -Path src/app/features -Recurse -Filter *.html | Select-String -Pattern '<table'` returns nothing.

## Check Group 3 — Feature folders and extraction (plan Task Group 4)

5. [ ] Folder shape

   ```
   src/app/features/auth      → pages/
   src/app/features/dashboard → pages/, components/
   src/app/features/filaments → pages/, components/
   src/app/features/models    → pages/, components/
   src/app/features/settings  → pages/, components/
   src/app/features/stocked   → pages/, components/
   ```

6. [ ] No duplicated modal shell
   - `Get-ChildItem -Path src/app/features -Recurse -Filter *.html | Select-String -Pattern 'modal-backdrop|modal-content'` returns nothing: feature markup composes `app-modal` instead of copying its structure.
7. [ ] No hand-rolled list states
   - No feature template contains its own `Loading...` or `No … found.` block outside `app-data-table` / `app-list-state`.

## Check Group 4 — Lazy loading (plan Task Group 5)

8. [ ] No static page imports remain
   - Run: `Select-String -Path src/app/app.routes.ts -Pattern "import .*(PageComponent)"`
   - Expected: no matches; the file only composes `loadChildren` entries, the default redirect and the guards.
9. [ ] Routing specs
   - Run: `npm test` and confirm each feature's `*-routing.spec.ts` appears as a passing file in the output (`--include` accepts one path at a time, so the full run is the reliable check).
   - Expected: each feature route resolves to its page component; guarded features declare `authGuard`; the public auth feature does not.
10. [ ] Laziness is visible in the build output
    - Run: `npm run build`
    - Expected: the report lists separate lazy chunks per feature instead of one bundle containing every page.

## Check Group 5 — Layering guard (plan Task Group 6)

11. [ ] The guard passes on the shipped code
    - Run: `npm test -- --include src/app/features/features-layering.spec.ts`
    - Expected: pass — no `HttpClient`, `environment` import, URL literal, `localhost` or `apiUrl` exists under `features/`.
12. [ ] The guard actually bites (negative test)
    - Temporarily add e.g. `import { HttpClient } from '@angular/common/http';` to one feature page, re-run the guard spec, observe the failure, then revert the import.
    - Expected: failure naming the offending file and rule, then a clean pass after reverting.
    - Evidence: paste the failing assertion and the reverted `git status` into the merge notes.

## Check Group 6 — Whole-client verification (plan Task Group 7)

13. [ ] Complete suite with coverage
    - Run: `npm test`
    - Expected: every test passes; thresholds report at or above 80% statements, branches, functions and lines (baseline before this phase: 98.5 / 96.55 / 100 / 97.61 on the instrumented files).
    - Note: the runner only instruments the files the specs import (requirement decision D8), so confirm each new file actually appears in the coverage table.
14. [ ] Production build
    - Run: `npm run build`
    - Expected: completes with no TypeScript, template or stylesheet error.
15. [ ] Dependency surface unchanged
    - Run: `git diff --stat dev -- src/3DPrintingHub.Client/package.json src/3DPrintingHub.Client/package-lock.json`
    - Expected: empty.
16. [ ] Pre-existing local edit untouched
    - Run: `git status --short`
    - Expected: `PROMPTS.md` remains the only unrelated modification; the phase's diff touches only client sources, their specs and these spec documents.

## Manual page walk — "every existing page still works"

With the client served (`npm start`) against the API (`scripts/run-program.ps1`):

17. [ ] `/login` — sign in; `/register` — first-run account creation (unchanged surface).
18. [ ] `/dashboard` — pie charts render their data and the empty/error states behave as before.
19. [ ] `/filaments` — create, edit and delete a filament; `Update` on remaining weight opens the adjust modal and its actions still mutate; open the colours, brands, material-types and profiles modals and exercise add/edit/delete; the filter input and the sortable column headers still sort and filter as before.
20. [ ] `/models` — create, edit and delete a model and a category; `No categories available` still renders when the list is empty.
21. [ ] `/settings` — the table renders through the shared table, and editing a value still saves and re-renders (the modal now comes from `app-modal` with identical copy).
22. [ ] `/stocked` — create, edit and delete product stock; the per-row `+`/`−` quantity adjuster still persists across a reload.
23. [ ] Deep links: reload the browser directly on `/filaments`, `/models`, `/settings`, `/stocked` and `/dashboard`; the SPA fallback and the route guards still work.
24. [ ] Sign-out from the navbar still clears the session and returns to the login page.

## Review checklist

- [ ] One presentational table exists in `shared/ui` and renders all six tables; no feature template contains `<table>`, `.modal-backdrop`, a hand-rolled `Loading...` or a `No … found.` block.
- [ ] No sorting or filtering moved into the shared table (Phase 9's scope), and the existing page-level sort/filter still behaves identically.
- [ ] No HTTP call, API URL or `environment` import exists under `features/`, and the guard spec covers the rule.
- [ ] Feature folders follow `pages/` + `components/`; extracted components live in their own feature's `components/`.
- [ ] `app.routes.ts` uses `loadChildren` per feature; every guarded URL still requires `authGuard`; the URL surface is unchanged.
- [ ] The navbar suite is green: the sign-out label reads `Sign out` (the template was corrected to match the spec, not the other way round), and the `nav-link` class, `type="button"` and `logout()` assertions still hold.
- [ ] Each new or changed source file has a spec and appears in the coverage table.
- [ ] No dependency, UI library or linter was added; hand-rolled CSS and the existing `shared/ui` primitives were reused.
- [ ] Nothing outside the client and this spec directory changed (no server, nginx, compose, Dockerfile, workflow or `PROMPTS.md` change).
- [ ] `npm test` passes with coverage at or above the thresholds, and `npm run build` passes.
- [ ] `specs/roadmap.md` marks Phase 7 covered and `src/app/ARCHITECTURE.md` documents the routing and shared-table shape.

## Mission and tech-stack checks

From `specs/mission.md`:

- [ ] Every user-visible feature still exists, is reachable and is discoverable (principle 6).
- [ ] Relevant automated frontend tests were added and pass, and the CI gates (`build`, `frontend-tests`, `frontend-coverage`) stay green (principles 7 and 8).
- [ ] Layers still point one way: features consume repositories, and nothing in a view talks HTTP.
- [ ] No history was rewritten: no commit, amend, rebase or reset happened as part of this phase.

From `specs/tech-stack.md`:

- [ ] Standalone Angular components, TypeScript, Vitest + jsdom and hand-rolled CSS only.
- [ ] Shared UI stayed inside `shared/ui`; nothing new was promoted into `core/`.
- [ ] Coverage remains at or above the 80% global floor.
- [ ] Any dependency decision was recorded in `tech-stack.md` — expected outcome: **no new row was needed**.

## Merge decision

The phase can be merged only when every check group passes, the manual page walk is complete with no behavioural difference on any page, the previously red navbar spec is green, `npm test` reports coverage at or above the 80% thresholds, `npm run build` succeeds, and no dependency or non-client file changed. The roadmap checkbox and the coverage numbers recorded here are the merge evidence.
