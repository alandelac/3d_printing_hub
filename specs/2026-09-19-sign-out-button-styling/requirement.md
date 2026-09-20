# Requirement — Sign-out Button Styling

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 6 (*Sign-out button styling*) |
| **Branch** | `phase-6-sign-out-button-styling` |
| **Spec directory** | `specs/2026-09-19-sign-out-button-styling/` |
| **Date opened** | 2026-09-19 |
| **Status** | Planned |
| **Depends on** | Phases 0–5 completed; Angular client dependencies installed |
| **Blocks** | Phase 7 frontend architecture consolidation |

## 1. Objective

Make the sign-out control in `src/3DPrintingHub.Client/src/app/core/ui/nav-bar` visually consistent with the other navbar controls, using the repository's existing component and CSS conventions.

## 2. Why this is the next phase

Phase 6 is the lowest-numbered unfinished phase in `specs/roadmap.md`. The navbar currently renders navigation links with navbar-specific styles, while the sign-out `<button>` has no matching class or shared control convention. This is a small user-facing inconsistency and an opportunity to establish the correct reusable boundary before the broader frontend consolidation in Phase 7.

## 3. Scope

### In scope

1. Inspect the existing navbar controls and determine whether a reusable navbar button class or component already exists.
2. Reuse that abstraction for sign-out, or create the smallest appropriate reusable abstraction in `core/ui` when none exists.
3. Apply the convention consistently to the navbar button controls that share the same visual role.
4. Remove bespoke sign-out styling or duplicated markup.
5. Add or update focused Vitest/component tests for rendered styling conventions and logout behavior.
6. Run the complete frontend test suite with coverage and the Angular production build.

### Out of scope

- Changing the logout API, authentication state management, routes, or token handling.
- Redesigning the navbar, changing its information architecture, or changing responsive breakpoints.
- Refactoring unrelated feature buttons or beginning the broader Phase 7 component consolidation.
- Adding Angular Material, Tailwind, another UI library, or any new dependency.
- Changing backend code, API contracts, or deployment configuration.

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | Inspect for an existing shared navbar button convention before adding a new abstraction. | Avoids duplicate UI primitives and follows the DRY request. |
| **D2** | If no suitable convention exists, create the minimum reusable control in `core/ui` and use it for all navbar controls with the same visual role. | `core/ui` owns cross-cutting reusable UI according to `tech-stack.md`; the abstraction should remain proportional to this small phase. |
| **D3** | Preserve the current click handler and `AuthService.logout()` contract. | Styling must not alter authentication behavior. |
| **D4** | Keep the existing hand-rolled CSS approach and add no dependency. | `tech-stack.md` explicitly specifies no UI library and requires dependency decisions before additions. |
| **D5** | Require the full frontend test suite with coverage and a production build before merge. | The mission requires automated verification, and CI already gates frontend tests, coverage, and build. |

## 5. Context

From `specs/mission.md`:

- The application must be discoverable and coherent for a solo maker using the self-hosted UI.
- Every change must include relevant automated tests and must pass the required frontend checks before merge.

From `specs/tech-stack.md`:

- The client uses standalone Angular components, Vitest with jsdom, and hand-rolled CSS.
- Cross-cutting reusable UI belongs in `core/ui` or `shared/ui`.
- The navbar is located at `core/ui/nav-bar`.
- No UI library or state-management library should be introduced for this work.

Current implementation context:

- `nav-bar.html` renders navigation links and a native sign-out button.
- The links have navbar-specific classes and styles, while the sign-out button does not share them.
- `nav-bar.spec.ts` already verifies that clicking the button calls `AuthService.logout()`; that behavior must remain intact.

## 6. Risks and mitigations

| Risk | Mitigation |
|---|---|
| A new abstraction expands the phase unnecessarily. | Prefer an existing class/component; if absent, create only the minimal `core/ui` primitive needed by the navbar. |
| Styling changes alter logout behavior. | Keep the existing button type and click binding; retain a component test for `logout()`. |
| Navbar links regress while styles are consolidated. | Test the rendered link set and run the full suite plus production build. |
| Mobile behavior changes accidentally. | Preserve the existing responsive rules and verify the build and component rendering. |

## 7. Done means

The navbar's sign-out control uses the same reusable styling convention as its sibling controls, no bespoke sign-out styling remains, logout behavior is unchanged and tested, and the full frontend test suite with coverage plus the production build pass. See `validation.md` for the merge checklist.
