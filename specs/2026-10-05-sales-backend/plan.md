# Plan — Sales Backend

## Task Group 1 — Domain Model
- [x] Add a `Sale` entity under `src/3DPrintingHub.Domain/Entities` with the repository's `Guid Id` convention.
- [x] Require a `ProductStockId`; allow an optional `ClientId`; store a positive quantity, the unit sale price at the time of sale, an explicitly supplied payment-received flag, and a UTC sale timestamp.
- [x] Add nullable navigation properties and foreign keys following the entity conventions; update related collections only where useful to existing query patterns.
- [x] Preserve sales history: client archiving must not affect existing sales, and deleting a referenced product-stock row must not cascade-delete its sales.
- [x] Add domain tests for defaults and the sale's required relationships and values where behavior is enforced in the domain.

## Task Group 2 — Application Contracts and Validation
- [x] Add create, update, list and detail DTOs under `src/3DPrintingHub.Application/Dtos`; do not expose EF Core entities from the API.
- [x] Add FluentValidation validators for create and update requests.
- [x] Require a valid product-stock id, quantity greater than zero, a positive unit sale price, and an explicit `PaymentReceived` value; keep the client id optional.
- [x] Validate that referenced stock and client records exist in the service layer; return a clear not-found response for missing records.
- [x] Add unit tests for valid requests, omitted payment state, invalid quantity/price, and optional client input.

## Task Group 3 — Sale Service and Atomic Inventory Changes
- [x] Add `ISaleService` with create, list, get-by-id and update operations, and register its Infrastructure implementation through the existing service-registration path.
- [x] On create, decrement the selected `ProductStock` by the sale quantity and persist the sale in one transaction; reject insufficient stock without creating a sale.
- [x] On update, reconcile stock changes atomically: apply only the quantity difference for the same stock row, or restore the old row and decrement the new row when the stock reference changes.
- [x] Reject updates that cannot be fulfilled without side effects; use the existing stock version/concurrency pattern so competing sales cannot oversell inventory.
- [x] Increment affected stock versions and update timestamps consistently; add service tests for create, update, over-sale, missing resources, and rollback behavior.

## Task Group 4 — Persistence and Migration
- [x] Add the `Sales` DbSet and configure required/optional relationships, delete behavior, and useful lookup indexes in `ApplicationDbContext`.
- [x] Create an EF Core SQLite migration for sales and its foreign keys without changing unrelated schema.
- [x] Verify that archiving a client retains its sale references and that referenced product stock cannot be deleted by cascading away history.
- [x] Add temporary-SQLite integration coverage for migration, persistence, relationships, and transaction rollback.

## Task Group 5 — API Controller
- [x] Add an authenticated MVC `SalesController` under the existing `/api` route conventions.
- [x] Implement `POST /api/sales`, `GET /api/sales`, `GET /api/sales/{id}` and `PUT /api/sales/{id}` for the Phase 12b create/edit workflow; do not add a sale-delete operation.
- [x] Return stable DTO shapes, HTTP 404 for missing sales/related records, HTTP 409 for stock conflicts, and HTTP 400 Problem Details for invalid request data.
- [x] Add `WebApplicationFactory` tests for create/read/list/update, omitted required payment state, invalid data, missing resources, and over-sale with no persisted side effects.

## Task Group 6 — Final Validation
- [x] Run the complete backend test suite and confirm the API and Infrastructure projects build.
- [x] Confirm the SQLite migration applies through the normal startup migration path.
- [x] Confirm concurrent/competing stock decrements cannot produce negative inventory or a sale without its matching decrement.
- [x] Confirm no frontend feature, sale deletion, new dependency, or unrelated data-model change is introduced by this phase.