# Requirement — Print Job Registry

## 1. Scope

Phase 13 from `specs/roadmap.md`: make the existing `PrintJob` domain entity usable through the backend and an authenticated frontend registry.

A user can record a completed print job with its model, filament, grams consumed, produced quantity, print timestamp and optional notes. Completion records the material cost, adds the produced quantity to the matching product stock, and reduces the selected filament's remaining weight as one atomic operation. Users can browse print history.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | A job records a required positive integer produced quantity. | The owner chose quantity per job; each completion adds that quantity to stock. |
| 2 | Creating a job records it as completed and applies inventory changes immediately. | The owner chose completed jobs only; queued, in-progress, failed and cancelled states are out of scope. |
| 3 | Stock is incremented on the existing `ProductStock` row matching both `ModelPrintId` and `FilamentId`. If that row does not exist, the operation is rejected without side effects. | Stock is tracked by model/filament pairing, and creating a row would require inventing pricing values. |
| 4 | Material cost uses the filament's current cost per gram when the job completes and is stored on the job. | This follows the phase objective and preserves the cost used for the historical job if filament costs later change. |
| 5 | Job persistence, stock increase and filament weight reduction are atomic. | A rejected or interrupted completion must not leave inventory or history partially updated. |
| 6 | The UI supports completed-job creation and print history only; no edit/delete or inventory reversal is included. | This is the agreed first registry scope and avoids ambiguous reversal rules. |
| 7 | Follow existing backend layering, Angular architecture, shared UI, validation and test conventions; add no dependencies. | Required by `specs/mission.md` and `specs/tech-stack.md`. |

## 3. Context

- `specs/mission.md` names print jobs as a core record for tracking production and material cost, and requires layered implementation and relevant automated tests.
- `specs/tech-stack.md` documents the Domain → Application → Infrastructure → Api backend layers, EF Core with SQLite, MVC controllers, FluentValidation, xUnit and temporary-SQLite API integration tests.
- The client uses Angular standalone components, feature folders, repository-owned HTTP, shared tables and the shared timestamp formatter; authenticated routes are registered in `app.routes.ts`.
- The existing `PrintJob` entity links a `Filament` and `ModelPrint`, and stores grams used, print timestamp, calculated material cost and optional notes. It does not yet store produced quantity.
- `ProductStock` identifies inventory by `ModelPrintId` and `FilamentId`, and stores `QuantityInStock`; the phase must reuse the atomic inventory-mutation approach established for sales.
- Phase 13 acceptance in `specs/roadmap.md` requires recorded/listed completion, increased stock, reduced filament weight, cost calculated from cost per gram, and rejection of a completion that would make filament weight negative without side effects.

## 4. Out of Scope

- Queued, in-progress, failed or cancelled print-job statuses.
- Editing or deleting jobs, inventory reversal, or manual stock corrections.
- Automatically creating product-stock rows or choosing their price/cost fields.
- Filament reservations, machine scheduling, time/labor/electricity costing, or external integrations.
- Changes to sales behavior, unrelated inventory workflows, or new dependencies.
