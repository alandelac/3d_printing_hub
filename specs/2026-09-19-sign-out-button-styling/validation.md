# Validation — Sign-out Button Styling

## Roadmap Phase 6 Acceptance

> The navbar renders visually consistent controls, with no bespoke sign-out styling left behind.

## Local checks

Run from `src/3DPrintingHub.Client`:

1. [x] Verify the focused navbar test
   - Run: `npm test -- --include src/app/core/ui/nav-bar/nav-bar.spec.ts`
   - Expected: the navbar test passes, including the shared styling convention and the `AuthService.logout()` interaction.
2. [x] Run the complete frontend suite with coverage
   - Run: `npm test`
   - Expected: all Vitest tests pass and global frontend coverage remains at or above 80%.
3. [x] Build the production client
   - Run: `npm run build`
   - Expected: Angular production build completes without TypeScript, template, or stylesheet errors.

## Review checklist

- [x] Sign-out uses the same class or reusable component convention as the other navbar controls.
- [x] No sign-out-only CSS rule or duplicated button styling remains.
- [x] `button` remains `type="button"` and still calls `AuthService.logout()`.
- [x] Existing navbar links and responsive behavior remain unchanged unless required by the shared convention.
- [x] No new dependency was added.
- [x] `npm test` passes with global coverage at or above 80%.
- [x] `npm run build` passes.

## Mission and tech-stack checks

From `specs/mission.md`:

- [x] The UI remains discoverable and consistent for the self-hosted operator.
- [x] Relevant automated frontend tests pass before merge.

From `specs/tech-stack.md`:

- [x] The reusable UI remains in `core/ui` or the existing shared UI boundary.
- [x] The implementation uses standalone Angular components and hand-rolled CSS.
- [x] No UI library or external dependency was added.

## Merge decision

The phase can be merged only when every review checklist item is satisfied, the focused navbar test passes, the complete frontend test suite reports at least 80% global coverage, and the production build succeeds.
