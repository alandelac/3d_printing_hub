# Validation — Sales Backend

## 1. Automated Tests

### Domain and Application
- [ ] `Sale` has a generated id, a stable UTC creation timestamp, a required stock reference, and an optional client reference.
- [ ] Create and update validators accept valid sale data and reject missing stock id, omitted payment state, non-positive quantity, and non-positive unit price.
- [ ] An omitted client is accepted; an invalid supplied client/stock reference is reported as not found by the service/API.
- [ ] The sale's unit price and timestamp remain snapshots when the referenced product-stock price or sale's editable fields change.

### Infrastructure and API
- [ ] The SQLite migration creates the sales table and required/optional foreign keys, and applies to a temporary database.
- [ ] Creating a sale persists its data and decrements exactly the referenced product-stock quantity in the same transaction.
- [ ] A sale larger than available stock returns a conflict and leaves both stock and sales unchanged.
- [ ] Competing decrements cannot create a negative stock quantity or persist an unmatched sale; affected stock versions advance.
- [ ] Updating only price, client, or payment state leaves stock unchanged.
- [ ] Updating quantity on the same stock row applies only the difference; reducing quantity restores stock.
- [ ] Changing stock rows restores the old row and decrements the new row atomically; insufficient replacement stock leaves both rows and the sale unchanged.
- [ ] A failed update rolls back every stock and sale mutation.
- [ ] Archiving a client preserves the client row and any sale reference; product-stock deletion does not cascade-delete sales.
- [ ] `POST`, list, detail and `PUT` endpoints return stable sale DTOs; missing resources return 404, invalid data returns 400 Problem Details, and stock conflicts return 409.
- [ ] `dotnet test` passes for the complete solution.

## 2. Manual Verification

- [ ] Start the API with the normal development configuration and confirm the migration applies without errors.
- [ ] Record a sale against a stock row and verify the quantity decreases by the sale quantity after reloading data.
- [ ] Attempt an over-sale and verify an actionable conflict response with no sale or stock change.
- [ ] Edit sale quantity and stock selection; verify stock is reconciled correctly and failed edits leave all values unchanged.
- [ ] Mark a sale paid through the update endpoint and verify payment state persists without changing inventory.
- [ ] Archive a client referenced by a sale and verify the historical sale remains readable.

## 3. CI Gates

- [ ] Backend build and xUnit checks pass in the same environment used by CI.
- [ ] Temporary SQLite integration tests cover migration, transactional inventory behavior, and API responses.
- [ ] No new package or external service is introduced without a tech-stack dependency decision.

## 4. Merge Readiness Checklist

- [ ] All Phase 12a acceptance criteria from `specs/roadmap.md` are covered, including no side effects on over-sale.
- [ ] Domain, Application, Infrastructure and Api responsibilities remain in their documented layers.
- [ ] Sale history and client archive behavior are preserved; sale deletion and frontend work remain out of scope.
- [ ] No credentials, personal data or machine-specific paths are added.
- [ ] Changes remain uncommitted until the repository owner explicitly requests a commit.