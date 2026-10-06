# Plan — Low-Stock Alerts

## Task Group 1 — Idempotent Settings Defaults
- [ ] Change `SettingsSeeder` to check each default parameter independently and insert only missing settings; preserve existing values, including operator-edited values.
- [ ] Add `minimum_inventory_quantity` with default value 2.
- [ ] Validate that the new setting's value is a non-negative integer wherever settings can be created or updated.
- [ ] Add tests for an empty database, a partially seeded database, and preservation of existing customized values.

## Task Group 2 — Per-Product Minimum Inventory
- [ ] Add an integer minimum-quantity field to `ProductStock` and create an EF Core migration that initializes existing rows to 2.
- [ ] Initialize new stock rows from the current `minimum_inventory_quantity` setting; fail clearly if the setting is unavailable rather than silently using a different value.
- [ ] Expose the per-product minimum through the relevant DTOs and service operations, with non-negative integer validation.
- [ ] Add backend tests for migration-compatible persistence, defaulting new rows, per-row updates, and invalid thresholds.

## Task Group 3 — Stock Table Alerts
- [ ] Display and allow editing each stock row's minimum quantity in the existing stock-management UI.
- [ ] In the stock table, render zero quantity as red, positive quantity below that row's minimum as yellow, and quantity at or above the minimum normally.
- [ ] Keep the alert limited to the stock table and provide an accessible status indication that does not rely on color alone.
- [ ] Add frontend tests for threshold editing, save/error behavior, and all quantity/color boundaries.

## Task Group 4 — Verification
- [ ] Run focused backend and frontend tests for the changed settings, stock and UI behavior.
- [ ] Run required repository test/build gates and confirm frontend coverage remains at or above 80%.
- [ ] Verify an existing database retains customized settings, receives any missing defaults, and keeps its stock rows after migration.
