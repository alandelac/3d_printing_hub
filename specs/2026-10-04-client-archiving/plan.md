# Plan — Client Archiving

## Task Group 1 — Domain and Persistence
- [x] Add an `IsArchived` flag to the `Client` entity, defaulting to `false` so existing clients remain active after migration.
- [x] Add and apply an EF Core SQLite migration for the flag without deleting or rewriting client data.
- [x] Add an application-service archive operation that marks an existing client archived and leaves the row and its identifying data intact.
- [x] Add service and temporary-SQLite integration tests for active, archived, missing and repeated-archive cases.

## Task Group 2 — Client API
- [x] Add an authenticated `DELETE /api/clients/{id}` operation that archives rather than physically deletes the client.
- [x] Return `204 No Content` when the client exists, including when it was already archived; return the standard `404 Not Found` for a missing id.
- [x] Exclude archived clients from `GET /api/clients`; keep archived clients addressable by id and expose their archive state in the client response contract for historical references.
- [x] Add `WebApplicationFactory` integration tests for authorization, successful and repeated archive, missing clients, active-list filtering, and archived detail reads.

## Task Group 3 — Clients UI
- [x] Add the archive request to `ClientRepository`; keep HTTP calls out of components.
- [x] Add a per-client archive action to the client list and confirm it with the shared confirmation dialog.
- [x] Allow the shared dialog to show client-specific archive wording and an Archive action label without changing its existing delete wording for other features.
- [x] On success, close the confirmation and remove the client from the active list; show clear errors and retain usable state on failure.
- [x] Add repository and component tests for request path, cancel, success, loading, and API-error behavior.

## Task Group 4 — Final Validation
- [ ] Run the focused backend and frontend tests, the full backend and frontend test suites, the Angular production build, and the global frontend coverage check.
- [ ] Manually verify an existing client can be archived after confirmation, no longer appears after reload, and remains readable by id as archived.
- [x] Verify the SQLite migration preserves existing clients and new clients default to active.
- [ ] Confirm no sale records are introduced or changed in this phase; add the concrete sale-FK preservation integration test with the Sale persistence work in phase 12a.
- [ ] Confirm the phase 11c acceptance criteria are covered and no new dependency is introduced.
