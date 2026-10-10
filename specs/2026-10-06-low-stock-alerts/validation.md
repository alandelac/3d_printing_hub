# Validation — Low-Stock Alerts

## 1. Automated Tests

### Settings seeding and validation
- [x] Seeding an empty database inserts all defaults, including `minimum_inventory_quantity` with value 2.
- [x] Seeding a partially populated database inserts each missing default without duplicating existing parameters.
- [x] Existing values, including customized defaults, remain unchanged after seeding.
- [x] Fractional and negative values are rejected for `minimum_inventory_quantity`; non-negative integers are accepted.

### Product-stock behavior
- [x] The migration gives existing stock rows a minimum quantity of 2 without changing their stock quantities or other data.
- [x] Newly created stock rows use the current seeded minimum as their initial per-row value.
- [x] Updating a product's minimum persists only that row's value; changing the seeded default does not rewrite existing rows.
- [x] Negative or fractional per-product minimum quantities are rejected without changing stock.

### Frontend behavior
- [x] The stock table allows a product's minimum quantity to be edited and shows persisted values after reload.
- [x] Quantity zero is shown as red, a positive quantity below the row minimum as yellow, and a quantity equal to or above the minimum has normal styling.
- [x] The warning status remains understandable without color alone.
- [x] Tests cover successful updates, validation failures and API errors.

## 2. Scenario Verification

These scenarios were exercised by the SQLite integration and frontend component tests rather than a manual session against the running database.

- [x] Start with a database containing customized settings and existing stock; verify seeding preserves existing values and adds the missing default.
- [x] Verify existing stock rows start with minimum 2 after migration, and a newly created stock row uses the current configured default.
- [x] Change one stock row's minimum and confirm other rows are unaffected after reload.
- [x] Verify the stock table shows zero in red, positive-below-minimum in yellow, and at/above-minimum without a warning.

## 3. CI Gates

- [x] Relevant backend unit and SQLite integration tests pass (52/52 in Debug).
- [x] Relevant frontend tests pass (160/160) and global frontend coverage remains at or above 80% (90.38% statements, 92.67% lines).
- [ ] Required CI checks (`build`, `backend-tests`, `frontend-tests`, `frontend-coverage`) pass. The Release build and frontend checks pass locally; the Release backend test command has six `ClientsApiIntegrationTests` failures because `WebApplicationFactory` cannot resolve the existing `3DPrintingHub.Client/obj/Release/net10.0/scopedcss/bundle/` path.
- [x] No new package or external service is introduced.

## 4. Merge Readiness

- [x] Existing settings values are preserved, and each missing default is seeded exactly once.
- [x] Per-product thresholds are persisted and drive the stock-table alert boundaries as specified.
- [x] The feature follows the documented backend and frontend architecture and introduces no unrelated behavior.
- [x] No credentials, personal data or machine-specific paths are introduced.
