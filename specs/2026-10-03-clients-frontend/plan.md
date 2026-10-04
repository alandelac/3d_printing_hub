# Plan — Clients Frontend

## Task Group 1 — Client Contracts and Repository
- [ ] Add TypeScript client and contact-platform contracts under `domain/models`, matching the API DTOs and enum values.
- [ ] Add a client repository under `data/` for listing, reading, creating and updating clients through the shared API client.
- [ ] Add focused repository tests for request paths, payloads and responses.

## Task Group 2 — Authenticated Navigation
- [ ] Add the `features/clients` feature using the established `pages/` and `components/` structure.
- [ ] Register the client routes behind `authGuard` and add a Clients entry to the navbar.
- [ ] Verify direct navigation and navbar navigation require authentication.

## Task Group 3 — Client List
- [ ] Build a client list showing name, contact platform, phone and email using the shared table component.
- [ ] Provide sorting and filtering for the client columns using the shared table behavior.
- [ ] Add an Add Client action that opens the create flow and row actions for editing.
- [ ] Cover loading, empty, error and populated states with component tests.

## Task Group 4 — Create and Edit
- [ ] Build create and edit forms for name, contact platform, optional phone and optional email.
- [ ] Use the existing client API contract and surface validation or request errors clearly.
- [ ] Refresh or update the list after a successful create or edit without requiring a full-page reload.
- [ ] Add component tests for form validation, submission, edit population and error handling.

## Task Group 5 — Final Validation
- [ ] Confirm the feature contains no direct HTTP calls or API URLs in components.
- [ ] Run focused client repository and component tests, the client build, and the frontend coverage check.
- [ ] Manually verify create, edit, list filtering/sorting and persistence after reload.
- [ ] Keep client deletion out of this phase; the row delete action will be delivered with its backend operation in phase 11c.