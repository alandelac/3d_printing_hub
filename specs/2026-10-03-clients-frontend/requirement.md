# Requirement — Clients Frontend

## 1. Scope

Phase 11b from `specs/roadmap.md`: make client records usable from the authenticated Angular application.

The feature must provide:

- A Clients navigation entry and routes protected by `authGuard`.
- A list of clients with name, contact platform, phone and email columns, using the shared table for filtering and sorting.
- An Add Client action and create/edit forms.
- TypeScript models under `domain/models` and a repository under `data/` for client API calls.
- Automated frontend unit and component-integration tests.

The existing API supports authenticated create, list, read and update operations at `/api/clients`. Client records contain a required name and contact platform (`WhatsApp`, `Facebook` or `PhoneCall`) and optional phone and email values.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Use the shared table for the client list, with filterable and sortable client-detail columns. | Phase 9 establishes one consistent table behavior across list-based features. |
| 2 | Show name, contact platform, phone and email in the list. | These are the complete client fields currently exposed by the API and are useful when finding or identifying a client. |
| 3 | Name and contact platform are required in the form; phone and email remain optional. | The frontend mirrors the backend contract and allows clients reachable only through their selected platform. |
| 4 | Keep HTTP calls in a `data/` repository and contracts in `domain/models`. | This follows the client architecture and keeps components focused on presentation. |
| 5 | Do not provide a working delete action in phase 11b. | The backend currently has no delete endpoint; phase 11c will deliver deletion across frontend and backend together. |
| 6 | Successful create and edit operations refresh the visible list, and changes persist through reload. | The list should immediately reflect saved server state and remain correct on subsequent visits. |
| 7 | No new dependencies or external services are introduced. | The existing Angular, RxJS, shared UI and API client are sufficient. |

## 3. Context

- `specs/mission.md` defines clients as part of the self-hosted hub for recording customers and future sales, and requires every feature to be discoverable and tested.
- `specs/tech-stack.md` requires standalone Angular components, `domain/models`, a repository in `data/`, guarded routes in `app.routes.ts`, Vitest with jsdom and global frontend coverage of at least 80%.
- Phase 11a provides the authenticated clients API and the domain contract. Delete is deliberately split into phase 11c so the UI does not expose an operation the API cannot perform.
- The app is for one operator on one self-hosted instance; multi-tenancy, per-client access control and external messaging are not part of this work.

## 4. Out of Scope

- Client deletion, including a delete button/action, confirmation flow or delete API call; these belong to phase 11c.
- Sales history, payment status, balances or stock changes; these belong to phase 12.
- Pagination, bulk actions, deduplication and external contact-platform integrations.
- Changes to the client backend contract or persistence schema.
- New third-party dependencies.