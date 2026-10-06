# Plan — Sales Backend

## Task Group 1 — Domain Model
- [ ] Add a `Sale` entity under `src/3DPrintingHub.Domain/Entities` with the repository's `Guid Id` convention.
- [ ] Require a `ProductStockId`; allow an optional `ClientId`; store a positive quantity, the unit sale price at the time of sale, an explicitly supplied payment-received flag, and a UTC sale timestamp.
- [ ] Add nullable navigation properties and foreign keys following the entity conventions; update related collections only where useful to existing query patterns.
- [ ] Preserve sales history: client archiving must not affect existing sales, and deleting a referenced product-stock row must not cascade-delete its sales.
- [ ] Add domain tests for defaults and the sale's required relationships and values where behavior is enforced in the domain.

## Task Group 2 — Application Contracts and Validation
- [ ] Add create, update, list and detail DTOs under `src/3DPrintingHub.Application/Dtos`; do not expose EF Core entities from the API.
- [ ] Add FluentValidation validators for create and update requests.
- [ ] Require a valid product-stock id, quantity greater than zero, a positive unit sale price, and an explicit `PaymentReceived` value; keep the client id optional.
- [ ] Validate that referenced stock and client records exist in the service layer; return a clear not-found response for missing records.
- [ ] Add unit tests for valid requests, omitted payment state, invalid quantity/price, and optional client input.

## Task Group 3 — Sale Service and Atomic Inventory Changes
- [ ] Add `ISaleService` with create, list, get-by-id and update operations, and register its Infrastructure implementation through the existing service-registration path.
- [ ] On create, decrement the selected `ProductStock` by the sale quantity and persist the sale in one transaction; reject insufficient stock without creating a sale.
- [ ] On update, reconcile stock changes atomically: apply only the quantity difference for the same stock row, or restore the old row and decrement the new row when the stock reference changes.
- [ ] Reject updates that cannot be fulfilled without side effects; use the existing stock version/concurrency pattern so competing sales cannot oversell inventory.
- [ ] Increment affected stock versions and update timestamps consistently; add service tests for create, update, over-sale, missing resources, and rollback behavior.

## Task Group 4 — Persistence and Migration
- [ ] Add the `Sales` DbSet and configure required/optional relationships, delete behavior, and useful lookup indexes in `ApplicationDbContext`.
- [ ] Create an EF Core SQLite migration for sales and its foreign keys without changing unrelated schema.
- [ ] Verify that archiving a client retains its sale references and that referenced product stock cannot be deleted by cascading away history.
- [ ] Add temporary-SQLite integration coverage for migration, persistence, relationships, and transaction rollback.

## Task Group 5 — API Controller
- [ ] Add an authenticated MVC `SalesController` under the existing `/api` route conventions.
- [ ] Implement `POST /api/sales`, `GET /api/sales`, `GET /api/sales/{id}` and `PUT /api/sales/{id}` for the Phase 12b create/edit workflow; do not add a sale-delete operation.
- [ ] Return stable DTO shapes, HTTP 404 for missing sales/related records, HTTP 409 for stock conflicts, and HTTP 400 Problem Details for invalid request data.
- [ ] Add `WebApplicationFactory` tests for create/read/list/update, omitted required payment state, invalid data, missing resources, and over-sale with no persisted side effects.

## Task Group 6 — Final Validation
- [ ] Run the complete backend test suite and confirm the API and Infrastructure projects build.
- [ ] Confirm the SQLite migration applies through the normal startup migration path.
- [ ] Confirm concurrent/competing stock decrements cannot produce negative inventory or a sale without its matching decrement.
- [ ] Confirm no frontend feature, sale deletion, new dependency, or unrelated data-model change is introduced by this phase.