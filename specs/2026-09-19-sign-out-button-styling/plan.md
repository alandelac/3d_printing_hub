# Plan — Sign-out Button Styling

## Overview

This phase makes the sign-out control in `core/ui/nav-bar` follow the same reusable button convention as the other navbar controls, while keeping the change intentionally small.

## Task Group 1 — Inspect the navbar button surface

| # | Task | Description |
|---|------|-------------|
| 1.1 | Inventory controls | Inspect the navbar links and sign-out control, including their template, component stylesheet, and existing tests. |
| 1.2 | Check for reuse | Determine whether a shared button class or component already represents the navbar controls. |
| 1.3 | Confirm ownership | Keep the solution in `core/ui` unless an existing shared abstraction is the correct owner. |

## Task Group 2 — Apply the DRY styling convention

| # | Task | Description |
|---|------|-------------|
| 2.1 | Reuse existing convention | Apply the existing navbar button class or component to sign-out if one is already available. |
| 2.2 | Extract the minimum common abstraction | If no suitable abstraction exists, create one in `core/ui` and apply it consistently to the navbar button controls. |
| 2.3 | Remove bespoke styling | Delete sign-out-only styling or markup that duplicates the shared convention. Preserve logout behavior and responsive behavior. |

## Task Group 3 — Test the navbar contract

| # | Task | Description |
|---|------|-------------|
| 3.1 | Update component coverage | Assert that the sign-out control renders with the shared convention and still invokes `AuthService.logout()`. |
| 3.2 | Preserve navigation coverage | Ensure existing navbar links and routing-related behavior remain covered. |
| 3.3 | Run frontend verification | Run the complete Vitest suite with coverage and the Angular production build. |

## Success Criteria

- Sign-out uses the same class/component convention as the navbar controls.
- No bespoke sign-out styling remains.
- Logout behavior is unchanged and covered by tests.
- The full frontend test suite, coverage threshold, and production build pass.
