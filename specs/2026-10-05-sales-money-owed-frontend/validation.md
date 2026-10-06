# Validation — Sales and Money-Owed Frontend

## 1. Automated Tests

### Feature and UI behaviour
- [ ] Sales list renders persisted sales and empty-state behaviour in the expected table format.
- [ ] Create/edit form accepts valid sale data and rejects missing required values using the same validation patterns as the rest of the app.
- [ ] Client detail view shows both historical sales and the outstanding total derived from unpaid sales.
- [ ] Marking a sale as paid updates the UI and removes that sale from the outstanding-balance total.
- [ ] Failed API calls surface user-facing error feedback without leaving the form or summary in a stale/broken state.

### Frontend coverage and architecture
- [ ] The sales feature uses the shared table, date formatter and repository patterns defined in the app architecture.
- [ ] All relevant sales UI flows are covered with Vitest unit/component tests in the client project.
- [ ] Existing client/stock feature tests continue passing without regressions in navigation or protected routes.

## 2. Manual Verification

- [ ] Open the authenticated app, navigate to the sales screen, and confirm the list loads the persisted sale records.
- [ ] Create a sale through the form and verify it appears immediately with the correct stock/client/price/payment details.
- [ ] Edit a sale and confirm the updated details persist after reload.
- [ ] Open a client detail and verify the sale history and outstanding balance match the ledger state.
- [ ] Mark a sale paid and confirm the client “owes me money” total decreases accordingly.
- [ ] Attempt invalid or rejected actions and confirm the UI surfaces an actionable error without mutating the underlying data.

## 3. CI Gates

- [ ] Frontend tests pass in the same environment used by CI.
- [ ] No new package or external service is introduced without a documented dependency decision.
- [ ] Frontend coverage remains at or above the project’s required threshold after the change.

## 4. Merge Readiness Checklist

- [ ] The sales registry and client money-owed flow are discoverable and reachable from the authenticated UI.
- [ ] The feature remains limited to the documented Phase 12b scope and does not add sale deletion or unrelated data-model churn.
- [ ] Inventory stock logic stays owned by the backend sales service; the frontend only reflects and edits the historical sales state.
- [ ] The feature matches the repository’s Angular architecture and uses shared UI/data patterns rather than bespoke one-off logic.
- [ ] No credentials, personal data or machine-specific paths are introduced.
