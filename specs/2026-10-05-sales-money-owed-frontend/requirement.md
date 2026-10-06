# Requirement — Sales and Money-Owed Frontend

## 1. Scope

Phase 12b from `specs/roadmap.md`: expose the sales registry and the client money-owed view in the Angular application.

The implementation must provide:

- A sales feature area in `src/3DPrintingHub.Client/src/app/features/sales` with a list and create/edit experience.
- Shared-table and date-formatting integration consistent with the existing frontend architecture.
- A way to view per-client sales history and outstanding balance from the client detail context.
- A paid-state action that updates the sale and the derived client “owes me money” total without touching inventory state.

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | The sales frontend is built as a dedicated `features/sales` area with route registration behind the auth guard. | The project convention is one feature folder per domain and route registration via `app.routes.ts`. |
| 2 | Sales list and edit/create are part of the feature, using the shared table shell and the date formatter. | The roadmap explicitly calls for this as the next UI step after the backend sales API. |
| 3 | Client detail includes a sales history and an unpaid-balance summary. | This is the user-facing representation of the backend sale ledger and payment state. |
| 4 | Marking a sale paid updates only the payment state and derived balance; it does not change stock. | The backend sale ledger is historical and inventory changes are already handled by the sale create/update service. |
| 5 | The UI must rely on repository-level API calls rather than HTTP logic inside components. | This matches the documented architecture and prevents feature logic from leaking into view code. |
| 6 | No sale-delete workflow is introduced in this phase. | The roadmap explicitly says delete is out of scope for the sales backend and frontend feature. |

## 3. Context

- `specs/mission.md` identifies sales and payment tracking as core capabilities for a self-hosted maker business operation.
- `specs/tech-stack.md` requires Angular 22 standalone patterns, feature folders, shared table components, and repository-driven data access.
- The backend sales API already stores `ProductStockId`, optional `ClientId`, quantity, unit sale price, payment state, and UTC sale timestamp.
- The repo’s frontend conventions already include `core/`, `data/`, `features/`, `domain/models` and `shared/ui` and rely on a shared table and formatter.
- The roadmap calls for a sales registry and money-owed frontend and names the acceptance condition as “sales are visible per client, unpaid sales sum into a clear owes me money figure, and marking a sale paid updates that figure.”

## 4. Out of Scope

- Sale deletion, refunds, partial payments, discounts, tax calculation, shipping or external payments.
- New backend domain design beyond the already defined sales API contract.
- Direct DB or service-layer changes outside the client feature area.
- Frontend styling or route work unrelated to the sales money-owed flow.
- Any change that bypasses the documented Angular architecture or shared UI conventions.
