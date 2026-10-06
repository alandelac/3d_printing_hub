# Plan — Low-Stock Alerts

## Task Group 1 — Idempotent Settings Defaults
- [x] Change `SettingsSeeder` to check each default parameter independently and insert only missing settings; preserve existing values, including operator-edited values.
- [x] Add `minimum_inventory_quantity` with default value 2.
- [x] Validate that the new setting's value is a non-negative integer wherever settings can be created or updated.
- [x] Add tests for an empty database, a partially seeded database, and preservation of existing customized values.

## Task Group 2 — Per-Product Minimum Inventory
- [x] Add an integer minimum-quantity field to `ProductStock` and create an EF Core migration that initializes existing rows to 2.
- [x] Initialize new stock rows from the current `minimum_inventory_quantity` setting; fail clearly if the setting is unavailable rather than silently using a different value.
- [x] Expose the per-product minimum through the relevant DTOs and service operations, with non-negative integer validation.
- [x] Add backend tests for migration-compatible persistence, defaulting new rows, per-row updates, and invalid thresholds.

## Task Group 3 — Stock Table Alerts
- [x] Display and allow editing each stock row's minimum quantity in the existing stock-management UI.
- [x] In the stock table, render zero quantity as red, positive quantity below that row's minimum as yellow, and quantity at or above the minimum normally.
- [x] Keep the alert limited to the stock table and provide an accessible status indication that does not rely on color alone.
- [x] Add frontend tests for threshold editing, save/error behavior, and all quantity/color boundaries.

## Task Group 4 — Verification
- [x] Run focused backend and frontend tests for the changed settings, stock and UI behavior.
- [x] Run the repository build/test commands and confirm frontend coverage remains at or above 80%; record the Release backend-test host-resolution failure in `validation.md`.
- [x] Verify through temporary SQLite tests that customized settings are retained, missing defaults are added, and existing stock rows survive migration.
