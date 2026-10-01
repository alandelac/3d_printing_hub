# Requirement — Clients Backend

## 1. Scope

Phase 11a from `specs/roadmap.md`: introduce the `Client` domain concept end to end on the server.

The implementation must provide:

- A `Client` entity in the Domain project.
- Application DTOs and FluentValidation validators.
- An `IClientService` contract and Infrastructure implementation.
- An EF Core SQLite migration and DbContext mapping.
- An MVC `ClientsController` with create, list, read and update operations.
- Problem Details responses for validation errors and consistent not-found handling.
- Unit and API integration tests using the repository's xUnit and temporary SQLite conventions.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | `Name` is required. | Every client needs a human-readable identity in lists and sales records. |
| 2 | `ContactPlatform` is required. | The operator must know where this client can be reached, such as WhatsApp, Facebook or a phone call. |
| 3 | `Phone` and `Email` are optional. | Some clients are reachable only through the selected platform, so both direct contact fields cannot be mandatory. |
| 4 | The initial API is CRUD without delete: create, list, read and update. | These operations are the explicit Phase 11a acceptance scope; UI deletion is not part of this backend phase. |
| 5 | Contact platform values are represented by a controlled domain value set and serialized consistently by the existing JSON enum configuration. | This prevents arbitrary spelling differences in a field used to find a client. The initial values cover WhatsApp, Facebook and phone call. |
| 6 | No uniqueness rule is imposed on name, email, phone or platform. | Families or shared contact details can legitimately appear on more than one client, and the roadmap does not require deduplication. |
| 7 | Missing clients return HTTP 404; invalid request data returns HTTP 400 Problem Details. | This matches ordinary REST semantics and the existing API error conventions. |
| 8 | Persistence uses the existing EF Core SQLite migration path. | The tech stack requires boring, upgradeable schema changes applied at startup. |

## 3. Context

- `specs/mission.md` identifies clients as a core inventory and sales concept for a single self-hosted operator.
- `specs/tech-stack.md` requires Domain → Application → Infrastructure → Api layering, MVC controllers, FluentValidation, EF Core SQLite and xUnit integration tests.
- Phase 11b will consume this API from an Angular clients feature, so response contracts should be stable and should not expose EF Core entities directly.
- Phase 12a will later associate sales with clients; this phase does not introduce sales relationships or stock behavior.

## 4. Out of Scope

- Frontend pages, navigation or client repositories.
- Delete or soft-delete behavior.
- Sales, payment tracking, stock changes or client financial balances.
- Authentication roles, multi-tenancy or per-user client visibility.
- External contact-platform integrations or messaging.
- Search, pagination, sorting and deduplication rules beyond the basic list operation.
- New third-party dependencies.