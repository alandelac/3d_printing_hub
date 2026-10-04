# Plan — Global Table Component

## Overview
This phase replaces the ad hoc list-shell code spread across the Angular client with one reusable table component that owns sorting and filtering in a shared, app-wide way. The goal is to standardise list behavior while removing duplicated feature-level logic in both main pages and modal lists.

## Task Group 1 — Audit the existing table patterns

| # | Task | Description |
|---|------|-------------|
| 1.1 | Inventory current tables | Search the Angular client for list tables and modal tables that currently implement their own sorting, filtering or row rendering logic. |
| 1.2 | Map duplicated behavior | Identify which screens share the same table shell, status badges, pagination-like controls, or filter widgets so the common pattern can be captured once. |
| 1.3 | Define the shared contract | Decide the component API for data rows, sortable columns, filter state and events so feature pages only supply data and metadata. |

## Task Group 2 — Build the shared table component

| # | Task | Description |
|---|------|-------------|
| 2.1 | Add shared table shell | Create a reusable table component under the shared UI layer, with a generic row shape and a predictable list layout. |
| 2.2 | Add sorting and filtering | Implement column sorting and filtering in the shared component so feature tables do not need bespoke list state logic. |
| 2.3 | Keep it extensible | Design the table API so future specialized tables can override or extend behavior without re-implementing the whole shell. |

## Task Group 3 — Adopt the shared table across features

| # | Task | Description |
|---|------|-------------|
| 3.1 | Migrate main feature tables | Replace the custom table logic in the major list pages, especially filament, model and stock tables, with the shared component. |
| 3.2 | Migrate modal tables | Update list UIs such as colors, brands, material types and similar modal tables so they share the same sort/filter behavior. |
| 3.3 | Remove duplicated logic | Delete old per-feature sorting and filtering implementations once the shared component is validated and the UI remains stable. |

## Task Group 4 — Validate behavior and merge readiness

| # | Task | Description |
|---|------|-------------|
| 4.1 | Regression check | Verify the same features still render correctly with the shared table and that no current functionality regresses. |
| 4.2 | Test coverage | Add focused unit or component-integration tests for the shared table behavior and any changed feature flows. |
| 4.3 | CI and coverage | Ensure the frontend test suite passes and global coverage stays at or above 80% before merge. |

## Timeline
- **Day 1**: Audit all current table implementations and define the shared sortable/filterable contract.
- **Day 2**: Implement the shared table and migrate the main feature tables.
- **Day 3**: Migrate modal tables, remove duplication, and complete validation.

## Success Criteria
- There is one reusable app-wide table component in the shared UI layer.
- The main feature tables and modal tables use the same sorting/filtering behavior.
- Per-feature table logic is removed or reduced to data-only concerns.
- The Angular client passes its test suite with coverage maintained above 80%.
