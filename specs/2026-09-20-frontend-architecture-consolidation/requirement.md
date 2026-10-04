# Requirement — Frontend Architecture Consolidation

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 7 (*Frontend architecture consolidation*, was `TODO.md → **Now**`) |
| **Branch** | `phase-7-frontend-architecture-consolidation` |
| **Spec directory** | `specs/2026-09-20-frontend-architecture-consolidation/` |
| **Date opened** | 2026-09-20 |
| **Status** | Planned |
| **Depends on** | Phases 0–6 completed; client dependencies installed (`npm ci` in `src/3DPrintingHub.Client`) |
| **Blocks** | Phase 8 (global timestamp formatter), Phase 9 (global table component), Phase 10 (filament weight adjuster) |

## 1. Objective

Make the Angular client DRY and organised predictably: identical UI concerns exist once in `shared/` or `core/`, feature folders follow the `pages/` + `components/` shape documented in `src/app/ARCHITECTURE.md`, every feature page is lazy-loaded, and no component performs an HTTP call or embeds an API URL.

## 2. Why this is the next phase

Phase 7 is the lowest-numbered unfinished phase in `specs/roadmap.md:118` and the only remaining item `TODO.md` had labelled **Now**. It is also a prerequisite for the work queued behind it: Phase 8 funnels date formatting, Phase 9 collapses the sortable/filterable table, and Phase 10 edits the filament remaining-weight column — all of which are far cheaper once the table and page shells exist once instead of six times.

## 3. Scope

### In scope

1. **Repair the inherited red baseline.** `npm test` fails on `dev` before this phase starts (see §6). The suite must be green before consolidation work begins, because "the client builds, its tests pass" is part of this phase's acceptance.
2. **One presentational table building block** in `shared/ui`: column configuration, default cell rendering, per-column custom cell templates, the shared actions column, and the shared loading/empty/scroll shell. Adopted by every existing table: filaments (filaments + profiles), models (models + categories), stocked (product stock), settings (settings).
3. **Shared modal and form shells adopted everywhere.** Settings still hand-rolls `.modal`/`.modal-backdrop`/`.modal-content`; all four pages still carry the same edit-modal, delete-confirm and `alert()`-error plumbing. The hand-rolled modal is replaced by the existing `shared/ui/modal`, and per-feature form markup moves out of `pages/*.html`.
4. **Feature folders normalised** to `pages/` + `components/`: `features/models`, `features/settings` and `features/stocked` gain `components/` folders holding their extracted feature-specific components.
5. **Lazy loading per feature.** Each feature gets a `<feature>-routing.ts` exporting `Routes`; `app.routes.ts` keeps only the guarded `loadChildren` entries, the public auth entry, and the default redirect.
6. **A layering regression guard.** A Vitest spec that scans `features/**/*.ts` (excluding specs) and fails when `HttpClient`, the `environment` module, an `http(s)://` literal, `localhost`, or `apiUrl` appears there, plus an assertion on the `pages/` + `components/` folder shape.
7. **Tests for everything new**: the shared table, the routing files, the extracted feature components, and the guard spec itself, keeping the global coverage thresholds satisfied.
8. **Documentation parity**: `src/app/ARCHITECTURE.md` (routing/lazy-loading shape and the new shared table) and the roadmap checkbox for Phase 7 are updated when the work lands.

### Out of scope

- **Sorting and filtering.** Phase 9 owns the sortable/filterable table. Phase 7 moves the current tables onto a presentational component and leaves the existing page-level sort/filter behaviour exactly as it behaves today.
- **Date and currency formatting.** `filaments-page.component.html` formats `lastPurchaseDate` inline and `stocked-page.component.html` prints raw ISO `lastUpdated`; both are Phase 8.
- **The filament remaining-weight adjuster UI.** Phase 10 rebuilds it as `+` / `−` / `update` controls; Phase 7 only moves its current markup.
- **Visual redesign.** Copy, class names consumed by the global stylesheet (`.modal`, `.add-form`, `.table-scroll`, `.primary`, `.secondary`, `.danger`) and layout stay as they are; this is a structural refactor.
- **The navbar, authentication and token handling.** Touched only in Task Group 1, and only in its spec file.
- **Anything on the server side**: no API contracts, entities, migrations, DTOs or controllers.
- **Ops**: no `nginx.conf`, `docker-compose.yml`, `Dockerfile.*` or workflow change. Deep links already work because `nginx.conf` serves `try_files $uri $uri/ /index.html`, and lazy loading does not change any URL.
- **New dependencies**: no Angular Material, Tailwind, NgRx, ESLint or other library. A Vitest source scan (decision D5) covers the layering rule instead of adding a linter.
- **Pre-existing local edit**: the `PROMPTS.md` typo fix rides in the same commit as these documents because the owner asked for a single commit containing all current changes; it is not part of the phase's implementation scope and no further edits to it are expected.

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | The shared table is **presentational only**: column configuration, cell rendering (default + custom templates), the shared actions column and the list/scroll shell. Sorting and filtering stay in the pages until Phase 9. | Owner decision, 2026-09-20. Extracting a sortable/filterable table now would mean writing Phase 9's component twice and re-touching the same six call sites. |
| **D2** | Lazy loading uses **per-feature `<feature>-routing.ts` files** with `loadChildren` from `app.routes.ts`. | Owner decision, 2026-09-20. It matches `ARCHITECTURE.md`'s `filaments-routing.ts` guidance, groups each feature's routes with the feature, and keeps `app.routes.ts` a short index of the application. |
| **D3** | The inherited `nav-bar.spec.ts` failure is resolved by **aligning the shipped label to the spec**: the sign-out button now reads `Sign out`. The spec, the `nav-link` class, `type="button"` and the click handler are not changed. | Owner decision and edit, 2026-09-20. Phase 6 merged red (commit `2317fbd` renamed the label to "Sign Out" while its new spec asserted `'Sign out'`), and Phase 7 cannot claim "its tests pass" while the baseline is broken. Repairing the copy keeps the spec's intended wording and needs no test rewrite. |
| **D4** | The table is adopted by **all six tables** (filaments, profiles, models, categories, product stock, settings), not just the four features named in the roadmap. | Roadmap wording names features, not tables; leaving one table behind would recreate the duplication this phase removes. |
| **D5** | The "no HTTP call or API URL inside a component" rule is enforced by a **Vitest guard spec that scans feature sources**, not by a linter. | Owner decision, 2026-09-20. It adds no dependency (respecting `tech-stack.md`'s dependency rule) and it fails CI's existing `frontend-tests` job when violated. |
| **D6** | Only `models`, `settings` and `stocked` gain a `components/` folder. `auth` (pages only), `dashboard` and `filaments` already match the target shape. | Keeps the diff proportional: `filaments/components/` already holds its feature components. |
| **D7** | No new dependency and no UI library; hand-rolled CSS continues, and the existing `shared/ui` primitives (`modal`, `list-state`, `table-actions`, `confirm-delete`) are reused rather than rewritten. | `tech-stack.md` fixes the UI library at "None" and requires any addition to be recorded as a decision first. |
| **D8** | The 80% coverage thresholds are treated as a floor on the **instrumented** files, so every new source file must be imported by a spec. | Measured 2026-09-20: despite `all: true` in `vitest.config.ts`, the `@angular/build:unit-test` runner reported only the 6 files the specs import. A new component no spec imports is invisible to the gate — so "add the file" always means "add the file and its spec". |

## 5. Context

From `specs/mission.md`:

- Principle 5 — layers are the map for where code belongs; `ARCHITECTURE.md` is the client's version of that map, so normalising folders is constitution work, not cosmetics.
- Principle 6 — discoverable features; every route must keep resolving exactly as it does today.
- Principle 7 — every change ships with relevant automated tests, here Vitest unit and component-integration tests.
- Principle 8 — CI is the gate; `frontend-tests`, `frontend-coverage` and `build` must stay green.

From `specs/tech-stack.md`:

- Angular 22.1 standalone components, TypeScript `~6.0.2`, Vitest 4 + jsdom, global coverage at or above 80%, Prettier 3.8.
- `shared/ui` currently owns `modal`, `list-state`, `table-actions`, `confirm-delete`; anything used by more than one feature belongs in `core/` or `shared/`.
- Components own presentation, repositories own HTTP, never call HTTP from a view, never embed URLs in components.
- Routes are declared behind `authGuard`, with `/login` as the only public entry point.

Current client inventory (verified 2026-09-20):

- `app.routes.ts` statically imports all 7 page components; there are no per-feature routing files and no `loadComponent`/`loadChildren` anywhere.
- Only 4 spec files exist (`app`, `auth.guard`, `auth.service`, `nav-bar`); `shared/ui` and every feature page are untested.
- Duplication found: the modal shell is re-implemented by hand in `settings-page.component.html:34-67`; loading/empty blocks are hand-rolled in `settings-page.component.html:7-8,28-30` and `stocked-page.component.html:67-69`; the table + `thead` + `.table-scroll` markup is copied across filaments (2 tables), models (2), stocked (1) and settings (1); the edit-modal, delete-confirm and `alert()`-based error plumbing is repeated in all four page components.
- `features/filaments/components/filament-card`, `.../filament-form` and `.../profiles-modal` are imported by nothing — dead duplicates of markup that lives inline in the page.
- The "no HTTP in a component" rule is already satisfied: searching `features/**` for `HttpClient`, `apiUrl`, `http://` and `localhost` returns nothing. This phase locks that in rather than fixing it.

## 6. Risks and mitigations

| Risk | Mitigation |
|---|---|
| The baseline is red, so "tests pass" is unprovable. | Task Group 1 repairs the inherited assertion and records fresh coverage before any refactor. |
| A regression hides behind untested files, and the coverage gate cannot see unimported files. | Every new or changed file gets a spec that imports it (decision D8); the guard spec adds the layering check the gate cannot express. |
| Adopting a new table changes rendered markup and breaks page behaviour. | Behaviour-preserving refactor: same copy, same classes consumed by the global stylesheet, same reads and writes; the manual page walk in `validation.md` covers every screen, and the production build fails on any template error. |
| Lazy loading changes routes and breaks links or deep links. | The URL surface is unchanged; `authGuard` moves to the parent route so every feature page stays protected; `nginx.conf` already serves deep links via `try_files`. |
| Splitting pages into feature components makes the diff huge and review-blind. | Feature directories are created only where extraction is real (D6), and each page's extraction is its own task so it can be verified and reviewed on its own. |
| Renaming or moving files breaks imports across the client. | No file is renamed outside its new `components/` home, and every move is validated by the production build plus the full suite. |
| The phase is small on paper and quietly becomes a redesign. | Scope is bounded in §3: no sorting/filtering, no formatting utility, no visual change, no new dependency, no server or ops change. Anything else is proposed, not done. |

## 7. Done means

All six tables render through one shared presentational component, feature folders match the documented `pages/` + `components/` shape, no feature component performs HTTP or embeds a URL, every feature page loads lazily through its own routing file with `authGuard` still enforced, the previously red `nav-bar` spec is green, the full Vitest suite with coverage and the Angular production build pass, and every existing page still works. See `validation.md` for the merge checklist.
