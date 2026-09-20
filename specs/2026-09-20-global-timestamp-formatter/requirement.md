# Requirement — Global Timestamp Formatter

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 8 (*Global timestamp formatter*) |
| **Branch** | `phase-8-global-timestamp-formatter` |
| **Spec directory** | `specs/2026-09-20-global-timestamp-formatter/` |
| **Date opened** | 2026-09-20 |
| **Status** | Planned |
| **Depends on** | Phase 7 completed; frontend architecture consolidated |
| **Blocks** | None; this is a shared quality and consistency improvement |

## 1. Objective

Standardise all date rendering in the Angular client so that ISO timestamps display as `YYYY-MM-DD` through one shared formatter, instead of being re-implemented in multiple templates and components.

## 2. Why this is the next phase

Phase 8 is the next open phase in `specs/roadmap.md` and the lowest-numbered unfinished item. The repository already consolidates frontend structure and shared UI patterns, and this is the next obvious cleanup to eliminate duplicated date-formatting logic and make output consistent.

## 3. Scope

### In scope

1. Identify all current inline date formatting in the Angular client.
2. Add a single shared date-formatting utility used by the app.
3. Add an Angular pipe to format ISO timestamps as `YYYY-MM-DD` in templates.
4. Replace hand-written date formatting across existing feature templates and components.
5. Add unit tests covering valid and invalid timestamp inputs.

### Out of scope

- Introducing a new UI library or dependency solely for date formatting.
- Reworking unrelated frontend architecture beyond the date-formatting cleanup.
- Adding locale-specific formatting beyond the repository’s consistent `YYYY-MM-DD` requirement.
- Changing business logic or server-side date storage.

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | Use a single formatter function and a pipe, rather than one-off template logic. | Matches the repository’s architectural rule: shared cross-cutting concerns belong in `core/` or `shared/`. |
| **D2** | Format to `YYYY-MM-DD` only. | This is the repository’s required output and matches the roadmap acceptance criteria. |
| **D3** | Keep the implementation lightweight and dependency-free. | The project intentionally avoids unnecessary UI libraries and prefers hand-rolled utilities. |
| **D4** | Replace all current manual formatting calls in templates instead of layering another ad hoc formatter on top. | Reduces duplication and keeps the app consistent. |
| **D5** | Validate invalid/null values explicitly. | Prevents broken output and keeps the UI resilient during edge cases. |

## 5. Context

From `specs/mission.md`:
- The product is a self-hosted maker’s tool intended to be easy to use and consistent.
- Discoverable, predictable UI is part of the repository’s working principles.
- Changes must be verified by tests.

From `specs/tech-stack.md`:
- The frontend is Angular 22.1 with standalone components and no UI framework dependency.
- Frontend changes require Vitest and jsdom coverage.
- UI logic used by more than one feature belongs in `core/` or `shared/`.
- The app intentionally avoids new libraries unless they are required and documented in the dependency decision log.

This phase is not adding a new feature to the business domain; it is a front-end quality fix that improves maintainability and consistency while aligning with the roadmap’s acceptance standard.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Duplicate formatting remains hidden in one or two templates. | Search the client for date formatting strings and remove all remaining ad hoc formatters. |
| String format changes break existing UI expectations. | Update tests before/alongside implementation and confirm screenshots or rendered output match the expected `YYYY-MM-DD` value. |
| A formatter is introduced in the wrong layer. | Keep the utility in the shared client layer and expose it through a pipe for template use. |
| Invalid dates cause UI errors. | Handle null/empty and malformed values explicitly with predictable output. |
| Coverage dips below the required threshold. | Add targeted coverage for formatter behavior and keep the test suite green. |

## 7. Done means

The client has one shared date-formatting utility and pipe, any inline temple-date formatting is removed or replaced, unit coverage exists for valid and invalid timestamps, and the frontend tests stay green with coverage above 80%. See `validation.md` for the complete merge checklist.
