# Plan — Sales and Money-Owed Frontend

## Task Group 1 — Client and Sales Feature Scaffold
- [ ] Create the `features/sales` area under the existing Angular structure and register the route(s) behind the auth guard.
- [ ] Add the sales domain model and repository types under `domain/models` and `data/` using the existing API DTO conventions.
- [ ] Confirm the navbar and route entry points expose the sales registry in the same way as other authenticated feature areas.
- [ ] Add a minimal state shell for list + create/edit flow and keep the feature aligned with the shared table and date-formatter patterns.

## Task Group 2 — Sales Registry UI
- [ ] Build the sales list page using the shared table component and the existing `core`/`shared` patterns.
- [ ] Add create/edit form behavior for sale records, including the required product-stock, quantity, unit price, client optionality, and payment-received flag.
- [ ] Add validation and feedback for invalid input and failed API calls, matching the existing client/product-stock UX conventions.
- [ ] Ensure the UI reads the stable API DTO shape and surfaces the correct success/error states after create or update.

## Task Group 3 — Client Detail and Money-Owed Summary
- [ ] Extend the client detail experience to include selling history and an unpaid-balance summary for that client.
- [ ] Compute “owes me money” from unpaid sales using the persisted `PaymentReceived` state, without introducing separate local-only business logic.
- [ ] Render the total outstanding value and relevant sale history in a consistent, readable format using existing shared UI services.
- [ ] Ensure archived clients still show historical sale context and that the summary matches the backend truth.

## Task Group 4 — Paid-State Editing
- [ ] Add a way for the user to mark an existing sale as paid from the UI without introducing destructive sale-delete flows.
- [ ] Update the form or action flow so the paid-state change updates the summary and persists the change through the API.
- [ ] Keep payment updates separate from stock mutations so inventory stays stable and sales remain historical records.
- [ ] Cover the user feedback path for success, validation and API failure on paid-state changes.

## Task Group 5 — Testing and Final Verification
- [ ] Add frontend unit/component tests covering the sales list, create/edit flow, client summary logic, and paid-state updates.
- [ ] Include checks for empty, invalid, and over-sale response states, using the repo’s Vitest + jsdom conventions.
- [ ] Run the relevant frontend tests and confirm the feature integrates with the existing shared table/date components and auth routing.
- [ ] Confirm no sale-delete behavior, no new dependency, and no unrelated model churn are introduced in this phase.
