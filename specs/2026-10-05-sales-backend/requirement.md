# Requirement — Sales Backend

## 1. Scope

Phase 12a from `specs/roadmap.md`: record sales against product stock and optionally a client, while keeping inventory accurate and payment state explicit.

The implementation must provide:

- A `Sale` entity in Domain, DTOs and FluentValidation validators in Application, `ISaleService` and an Infrastructure implementation, an EF Core SQLite migration, and an authenticated MVC `SalesController`.
- Create, list, read and update API operations. Update is included because the next roadmap phase requires a sales create/edit UI.
- A required link to one `ProductStock` row, an optional link to a `Client`, a positive quantity, a positive unit sale price captured at sale time, an explicitly supplied payment-received flag, and a UTC sale timestamp.
- Atomic stock decrement on creation and atomic inventory reconciliation when an edit changes stock or quantity.
- Unit and API/persistence integration tests using the repository's xUnit, temporary SQLite and `WebApplicationFactory` conventions.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | A sale references one required `ProductStock` row, not a `ModelPrint` directly. | Inventory is held per product-stock row, and the sale must decrement the exact row chosen by the operator. |
| 2 | `ProductStockId`, `Quantity`, and unit `SalePrice` are required; quantity and price must be greater than zero. | A sale must identify the inventory and the amount/price sold. Unit price is a snapshot and is not recalculated from later stock-price changes. |
| 3 | `ClientId` is optional, but any supplied id must reference an existing client. | Walk-in or unidentified buyers can be recorded, while known buyers can be connected to client history. |
| 4 | `PaymentReceived` must be explicitly supplied on create and update; it is persisted as a non-nullable boolean. | The roadmap's proposed default `true` would silently mark ordinary sales as paid and obscure unpaid balances. The owner selected explicit input instead. |
| 5 | `SoldAtUtc` is assigned in UTC when the sale is created and is not changed by ordinary sale updates. | A stable timestamp is needed for the sales registry and historical reporting. |
| 6 | Create decrements stock and stores the sale within one transaction; a failed or competing decrement creates no sale. | Inventory and its sales ledger must never disagree, and concurrent requests must not oversell stock. |
| 7 | Updating quantity or `ProductStockId` reconciles inventory atomically; changing price, client or payment state does not change stock. | This supports Phase 12b editing while keeping inventory correct. Stock conflicts reject the whole update without partial changes. |
| 8 | Updates use the stock row's existing version/concurrency mechanism and advance its version for each stock mutation. | The existing `ProductStock` service uses guarded atomic updates and a version field to detect competing changes. |
| 9 | Sales are not physically deleted in this phase. Client archival preserves existing references, and product-stock deletion must not cascade-delete sales. | Sales are financial/history records; Phase 11c explicitly promises client-history retention. |
| 10 | API routes are authenticated MVC endpoints: `POST`/`GET /api/sales`, `GET /api/sales/{id}`, and `PUT /api/sales/{id}`. | These match the existing API style and provide the operations needed by the next frontend phase without adding an unrequested delete workflow. |
| 11 | Missing sales or referenced records return 404; invalid input returns 400 Problem Details; insufficient or concurrently changed stock returns 409. | These distinguish malformed requests, missing resources and state conflicts using standard HTTP semantics. |
| 12 | No new package or external service is introduced. | The documented .NET, EF Core SQLite, FluentValidation and xUnit stack already supports this feature. |

## 3. Context

- `specs/mission.md` identifies sales, client history and payment tracking as core capabilities for one self-hosted operator, and requires relevant automated tests before merge.
- `specs/tech-stack.md` requires Domain → Application → Infrastructure → Api layering, MVC controllers, FluentValidation, EF Core SQLite migrations, and xUnit integration tests with temporary SQLite and `WebApplicationFactory` where persistence/API boundaries are affected.
- Phase 11a provides the client backend; Phase 11c archives clients rather than deleting them so future sales history can retain client references.
- `ProductStock` holds `QuantityInStock` and `Version`. `ProductStockService` already uses guarded atomic updates and advances the version, providing the local pattern for safe sale decrements.
- Phase 12b depends on sales list/create/edit API operations, client selling history, unpaid-sale totals, and the ability to mark a sale paid. This phase supplies the backend data and payment state; the frontend remains out of scope.
- The Phase 12a roadmap wording is malformed around optionality and payment defaults. The decisions above resolve it: client is optional, stock/quantity/price are required, and payment state must be explicitly provided.

## 4. Out of Scope

- Angular sales pages, client detail UI, navigation, or frontend repositories.
- Sale deletion, refunds, partial payments, payment methods, discounts, taxes, shipping, or external payment integrations.
- Editing `ProductStock` itself, changing stock identity, or recalculating historical sale price from current product data.
- Client financial balances or reporting endpoints beyond returning sales data needed by Phase 12b.
- Pagination, roles, multi-tenancy, per-user data access, or new dependencies.