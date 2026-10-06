# Plan — Print Job Registry

## Task Group 1 — Domain and Persistence
- [x] Extend `PrintJob` with a required positive integer produced quantity while retaining its model, filament, grams used, timestamp, calculated material cost and optional notes.
- [x] Confirm the existing EF Core relationship and migration conventions for `PrintJob` and its foreign keys; add a migration only if the model change requires one.
- [x] Define the matching product-stock record by `ModelPrintId` and `FilamentId`; do not create stock with invented pricing when no matching record exists.

## Task Group 2 — Atomic Completion Service
- [x] Add application DTOs, validation and service contracts for recording and listing completed print jobs.
- [x] Implement completion in the infrastructure service: validate the inputs and matching stock row, calculate material cost from the filament's current cost per gram, persist the job, add produced quantity to stock, and subtract grams used from filament.
- [x] Make the job insert and both inventory mutations atomic. Reject missing stock, invalid quantities/weight, or insufficient filament without partial changes.
- [x] Register the service through the existing application/infrastructure wiring conventions and expose authenticated controller endpoints.

## Task Group 3 — Print Job Registry UI
- [x] Add print-job DTO models and a repository under the documented Angular `domain/models` and `data` areas.
- [x] Build an authenticated print-job feature with a history list and a form to record a completed job; expose it through the existing route and navigation patterns.
- [x] Use shared table/date formatting and repository-driven HTTP access; show validation, success, empty and API-error states.
- [x] Keep the UI limited to completed-job creation and history; do not add status workflows, edit/delete actions or inventory reversal flows.

## Task Group 4 — Tests and Merge Readiness
- [x] Add application/service tests for valid completion, cost calculation, stock increase, filament decrease, and rejection without side effects.
- [x] Add API/EF integration coverage using temporary SQLite and `WebApplicationFactory` for persistence, listing and atomic failure behavior.
- [x] Add frontend unit/component tests for history, empty/error states and valid/invalid job submission.
- [x] Run the relevant backend and frontend tests, confirm required coverage and CI gates, and verify no unapproved dependencies or unrelated changes are introduced.
