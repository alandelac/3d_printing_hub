# Requirement — Client Archiving

## 1. Scope

Phase 11c from `specs/roadmap.md`: provide a deliberate archive action for clients across the authenticated API and Angular UI while preserving client data for future sales history.

The implementation must provide:

- A persisted archive state for clients, with existing and newly created clients active by default.
- An authenticated API operation at `DELETE /api/clients/{id}` that archives the client rather than physically deleting its row.
- Active-client list results that omit archived clients, while a client remains addressable by id with its archived state available to consumers that need historical context.
- A per-client archive action with confirmation on the clients page, using the shared confirmation dialog and clear success/error feedback.
- Backend unit/integration tests and frontend repository/component tests using the existing xUnit, temporary SQLite, `WebApplicationFactory`, Vitest and jsdom conventions.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Archive clients instead of physically deleting them. | This preserves client identity and future sales history, and avoids invalidating sales references. |
| 2 | Represent archive state with an `IsArchived` flag defaulting to `false`. | It is a small, explicit schema change that works with the current entity and lets existing rows remain active through migration. |
| 3 | `DELETE /api/clients/{id}` returns `204 No Content` for a found client, including an already archived client; a missing id returns `404 Not Found`. | Repeating an archive request is safe and has a predictable result; missing resources follow the existing API convention. |
| 4 | `GET /api/clients` returns active clients only; `GET /api/clients/{id}` can still resolve an archived client and identifies its archived state. | The active UI stays uncluttered while future sale history can still resolve a client's identity. |
| 5 | The UI calls the action Archive, explains that the client leaves the active list while history is retained, and uses the shared confirmation dialog. | The existing generic delete wording says deletion cannot be undone, which would be inaccurate for this non-destructive operation. Add configurable wording while preserving current defaults for other features. |
| 6 | A confirmed successful archive removes the client from the visible list; failures are shown clearly and do not silently discard the row. | The list should reflect server state immediately without hiding a failed request. |
| 7 | Sales persistence and sale-specific UI remain out of scope; the client row remains in the database so future foreign keys can continue to reference it. | The Sale entity and sales persistence are scheduled for phase 12a. Phase 11c verifies row retention; phase 12a must verify a real sale reference remains intact after archive. |
| 8 | No new package, external service, or authorization policy is introduced. | Existing MVC, EF Core, Angular, shared UI, and authenticated API conventions are sufficient. |

## 3. Context

- `specs/roadmap.md` makes phase 11c the next incomplete phase. Its objective is deliberate client deletion and its acceptance requires UI confirmation, consistent outcomes, persistence after reload, and tests for missing and sales-referenced clients.
- `specs/mission.md` treats clients and sales as core records for a single self-hosted operator, and requires relevant automated tests before merge.
- `specs/tech-stack.md` requires Domain → Application → Infrastructure → Api layering, MVC controllers, EF Core SQLite migrations, xUnit with temporary-SQLite integration tests, and Angular repositories/components tested with Vitest and jsdom. Frontend coverage must remain at or above 80%.
- Phase 11a supplies the authenticated client API and persistence; phase 11b supplies the authenticated clients UI and shared table. The shared confirmation component is already used for destructive actions elsewhere.
- The Sale entity is not introduced until phase 12a. The archive design preserves the client row now; phase 12a owns an integration test against the actual sale relationship.

## 4. Out of Scope

- Physical deletion, cascading deletion, or mutation of sale records.
- A sales table, sales API, payment tracking, balances, or stock changes.
- An archived-clients page, restore action, bulk archiving, or archive filters.
- New client fields, deduplication, pagination, roles, multi-tenancy, or per-user visibility.
- New third-party dependencies or external contact integrations.
