# Requirement — Global Table Component

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 9 (*Global table component*) |
| **Branch** | `feature/phase-9-global-table-component` |
| **Spec directory** | `specs/2026-09-20-global-table-component/` |
| **Date opened** | 2026-09-20 |
| **Status** | Planned |
| **Depends on** | Phase 8 completed; frontend architecture consolidation already in place |
| **Blocks** | Future specialized tables and additional UI consistency work |

## 1. Objective

Create a single shared, sortable, filterable table component for the Angular client and migrate the main list-driven screens and modal list UIs to use that component instead of bespoke table logic.

## 2. Why this is the next phase

Phase 9 is the next uncompleted item in `specs/roadmap.md`. The repository has already consolidated the Angular frontend into predictable layers and shared concerns, so the most effective next step is to remove repeated list-shell logic and define one table pattern that all screens can follow.

## 3. Scope

### In scope

1. Review all current list tables and modal tables that implement sorting/filtering separately.
2. Add a reusable shared table component in the client’s shared UI layer.
3. Support common sorting and filtering behavior across app list screens.
4. Migrate main feature tables, including filament, model and stock tables, to the shared component.
5. Migrate modal tables such as colors, brands and material types to the same shared pattern.
6. Remove duplicated table code where the same behavior is now handled centrally.
7. Add or update tests for the shared table behavior and affected feature screens.

### Out of scope

- Introducing a new UI framework or third-party table library.
- Reworking unrelated business logic or backend APIs.
- Rebuilding screen contents or data model structures beyond the shared table pattern.
- Adding pagination, search server-side APIs or advanced row actions that are outside the roadmap acceptance criteria.

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | Use one shared table component for all list-based tables. | The roadmap explicitly calls for a single shared list shell, and this matches the repository’s preference for cross-cutting concerns in `core/` or `shared/`. |
| **D2** | Keep feature pages responsible for data and configuration, not table implementation details. | Feature components should stay focused on the domain data they render rather than re-creating a table shell each time. |
| **D3** | Standardize sort/filter behavior across page and modal tables. | This removes inconsistency and gives the app a predictable pattern for list interaction. |
| **D4** | Delete duplicated feature sorting/filter wiring after migration. | The goal is not just reuse, but reducing total code and preventing drift between screens. |
| **D5** | Keep the component generic and expand-only, not special-case-heavy. | The shared component must remain reusable for future specialized tables without forcing bespoke behavior into every list. |

## 5. Context

From `specs/mission.md`:
- The app is user-facing and should be easy to operate with a consistent, discoverable UI.
- The product is meant to be self-hosted and not complicated to navigate.
- All changes must be verified by tests and CI.

From `specs/tech-stack.md`:
- The front end is Angular 22.1 with standalone components and no UI framework dependency.
- The documented project layout places repeated UI pieces in `shared/ui` or `core/`.
- There is no UI library requirement; hand-rolled CSS and shared Angular components are the preferred pattern.
- Frontend changes must retain or improve Vitest-based test coverage and maintain at least 80% global coverage.

This phase is not introducing new business domain features; it is a frontend architecture consolidation that makes the app easier to maintain and more consistent without changing the underlying product logic.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Some screens keep custom sort/filter behavior and the duplication remains. | Use a repo-wide table audit and delete custom logic only after the migration is verified. |
| The shared component becomes too opinionated and cannot support future table variations. | Keep the shared shell generic and allow extension via configuration or wrapper usage. |
| Replacing table logic breaks existing screen behavior. | Validate both the main tables and modal tables before removing old code. |
| Coverage drops below the required threshold. | Add focused component tests for sorting/filtering and keep the frontend suite green. |
| The component is placed in the wrong layer. | Keep it under the shared UI area and keep data-fetching and API logic inside repositories. |

## 7. Done means

The Angular client has a single shared table component that owns sorting and filtering, the app’s main and modal tables use it, duplicate feature-level list logic is removed, and the frontend suites pass with coverage above the required threshold. See `validation.md` for the full merge checklist.
