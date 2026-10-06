# Requirement — Low-Stock Alerts

## 1. Scope

Add a minimum-inventory threshold to product stock and make low stock easy to spot in the stock table. Improve settings seeding so every missing default is inserted without overwriting values already present in the database.

The `minimum_inventory_quantity` setting is the default for newly created product-stock rows. Each stock row stores its own editable integer minimum. Existing rows are initialized to 2 by the migration; changing the global default later affects new rows only.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Seed `minimum_inventory_quantity` with a default value of 2, alongside the existing defaults. | The owner selected 2 based on the example threshold. |
| 2 | Settings seeding checks each default independently and inserts only missing parameters; it never updates existing values. | Startup must add new defaults to an existing database while preserving operator changes. |
| 3 | The seeded minimum is the default for newly created product-stock rows. Each row stores and allows editing its own integer minimum. | The owner chose a per-product threshold rather than one threshold applied to every stock row. |
| 4 | Existing product-stock rows receive a minimum of 2 when the migration adds the field. Changing the setting later does not change existing rows. | Existing inventory needs a useful initial threshold while preserving per-product choices afterward. |
| 5 | A stock quantity of zero is red; a positive quantity below its row's minimum is yellow; a quantity at or above the minimum is normal. | This follows the requested quick visual distinction and the selected "below minimum" boundary. |
| 6 | The color cue appears in the stock table only. | The owner selected the stock list as the visual alert surface. |
| 7 | The minimum is a non-negative integer. The existing Settings numeric API/storage contract may represent the seeded default numerically, but it must reject fractional and negative values. | The threshold is a count of products, not a fractional measurement. |
| 8 | Follow the existing EF Core/SQLite, layered backend, Angular repository and shared-table patterns; add no dependencies. | Required by `specs/mission.md` and `specs/tech-stack.md`. |

## 3. Context

- `SettingsSeeder` currently returns as soon as any setting exists, so settings added in a later release are not seeded for existing installations.
- The Settings table contains numeric key/value entries. The existing pricing settings are editable and must retain their current values when new defaults are introduced.
- Product stock is represented by `ProductStock` rows. Stock quantity is already non-negative and is displayed in the stocked-products feature.
- `specs/mission.md` identifies stock visibility and buy/produce signals as core product goals. `specs/tech-stack.md` requires EF Core migrations, backend tests, frontend tests and the existing project layering.

## 4. Out of Scope

- A single global threshold applied to all existing stock rows.
- Automatically updating existing per-product thresholds when the default setting changes.
- Dashboard alerts, notifications, print-job automation or automatic replenishment.
- Thresholds for filament weight or other inventory types.
- Changes to sales, stock quantity adjustment, or unrelated settings behavior.
