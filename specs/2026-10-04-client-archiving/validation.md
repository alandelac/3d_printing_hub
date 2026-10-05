# Validation — Client Archiving

## 1. Automated Tests

### Backend
- [ ] Existing client rows migrate with `IsArchived = false`; newly created clients also default to active.
- [ ] Archiving an existing client persists `IsArchived = true` without removing or changing its id, name, contact platform, phone, or email.
- [ ] Archiving an already archived client succeeds without changing the retained client data.
- [ ] Archiving a missing client produces the established not-found result and API status `404`.
- [ ] `DELETE /api/clients/{id}` requires authentication and returns `204` for an existing client.
- [ ] `GET /api/clients` omits archived clients; `GET /api/clients/{id}` still returns the archived client and its archive state.
- [ ] Temporary-SQLite and `WebApplicationFactory` integration tests cover the migration and endpoint behavior.

### Frontend
- [ ] `ClientRepository` sends the archive request to the expected client endpoint.
- [ ] Canceling the shared confirmation dialog makes no request.
- [ ] Confirming archive disables duplicate submission while loading and removes the client from the active list after success.
- [ ] The confirmation text and action label describe archiving and retained history, not irreversible deletion.
- [ ] API errors remain visible, close no unrelated UI, and leave the client available for retry.
- [ ] Focused frontend tests pass; the complete frontend suite passes and global coverage remains at or above 80%.
- [ ] The Angular production build succeeds.

## 2. Referenced-Client Behavior

- [ ] Phase 11c proves through persistence tests that archive retains the client row and identifier instead of deleting the foreign-key target.
- [ ] Phase 12a adds an integration test using the actual Sale relationship: archiving a client with a sale succeeds, the sale remains persisted and still references that client, and the client is excluded from the active list.

## 3. Manual Verification

- [ ] Sign in and open Clients; verify each row offers an Archive action.
- [ ] Start archiving a client and cancel; verify the client remains active.
- [ ] Confirm the archive prompt identifies the selected client and explains that history is retained.
- [ ] Confirm archive; verify success feedback and immediate removal from the list.
- [ ] Reload the page and verify the archived client remains absent from the active list.
- [ ] Verify a repeated API archive request returns `204`, a missing id returns `404`, and archived client details remain resolvable by id.

## 4. CI Gates and Merge Readiness

- [ ] Backend build and full `dotnet test` pass, including temporary-SQLite and API integration tests.
- [ ] Frontend build, full Vitest suite, and global coverage gate pass.
- [ ] No new package or external service is added without a tech-stack decision.
- [ ] No credentials, personal data, or machine-specific paths are added.
- [ ] Changes remain uncommitted until the repository owner explicitly requests a commit.
