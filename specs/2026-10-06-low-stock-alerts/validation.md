# Validation — Low-Stock Alerts

## 1. Automated Tests

### Settings seeding and validation
- [ ] Seeding an empty database inserts all defaults, including `minimum_inventory_quantity` with value 2.
- [ ] Seeding a partially populated database inserts each missing default without duplicating existing parameters.
- [ ] Existing values, including customized defaults, remain unchanged after seeding.
- [ ] Fractional and negative values are rejected for `minimum_inventory_quantity`; non-negative integers are accepted.

### Product-stock behavior
- [ ] The migration gives existing stock rows a minimum quantity of 2 without changing their stock quantities or other data.
- [ ] Newly created stock rows use the current seeded minimum as their initial per-row value.
- [ ] Updating a product's minimum persists only that row's value; changing the seeded default does not rewrite existing rows.
- [ ] Negative or fractional per-product minimum quantities are rejected without changing stock.

### Frontend behavior
- [ ] The stock table allows a product's minimum quantity to be edited and shows persisted values after reload.
- [ ] Quantity zero is shown as red, a positive quantity below the row minimum as yellow, and a quantity equal to or above the minimum has normal styling.
- [ ] The warning status remains understandable without color alone.
- [ ] Tests cover successful updates, validation failures and API errors.

## 2. Manual Verification

- [ ] Start with a database containing customized settings and existing stock; verify seeding preserves existing values and adds the missing default.
- [ ] Verify existing stock rows start with minimum 2 after migration, and a newly created stock row uses the current configured default.
- [ ] Change one stock row's minimum and confirm other rows are unaffected after reload.
- [ ] Verify the stock table shows zero in red, positive-below-minimum in yellow, and at/above-minimum without a warning.

## 3. CI Gates

- [ ] Relevant backend unit and SQLite integration tests pass.
- [ ] Relevant frontend tests pass and global frontend coverage remains at or above 80%.
- [ ] Required CI checks (`build`, `backend-tests`, `frontend-tests`, `frontend-coverage`) pass.
- [ ] No new package or external service is introduced.

## 4. Merge Readiness

- [ ] Existing settings values are preserved, and each missing default is seeded exactly once.
- [ ] Per-product thresholds are persisted and drive the stock-table alert boundaries as specified.
- [ ] The feature follows the documented backend and frontend architecture and introduces no unrelated behavior.
- [ ] No credentials, personal data or machine-specific paths are introduced.
