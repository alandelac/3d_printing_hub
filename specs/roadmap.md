# Roadmap — 3D Printing Hub

This is the **single source of truth for planned work**. `TODO.md` has been retired; its items were inlined into the phases below and tagged `(was TODO.md → …)` so the history stays traceable.

## How to use this file

- Phases are deliberately **tiny**. Each should land as one small change in roughly one sitting.
- Do them in order. The next feature spec is always the lowest-numbered phase that is not yet done.
- A phase is complete when its **Acceptance** check passes.
- Phases marked *optional* are maintenance capacity, not commitments.

---

## Phase 0 — Purge secrets and repo hygiene

**Objective:** No credential, personal datum or machine-specific path is tracked by git.

**Deliverables**
- Stop tracking `.env` and add `.env.example` documenting every key the app reads.
- `.gitignore` covers `.env`, `*.db`, `*.db-shm`, `*.db-wal`.
- Rotate the leaked `OPENROUTERKEY`; drop the stale `DB_PASSWORD` (Postgres-era, unused).

**Acceptance:** `git ls-files` shows no `.env` and no `*.db`; a fresh clone contains only `.env.example`.

---

## Phase 1 — Fix the developer scripts

**Objective:** Local tooling matches the SQLite reality.

**Deliverables**
- `scripts/update-db.ps1` uses the SQLite connection string instead of the Postgres one.
- Scripts state the real ports (API `5033`, client `4200`).

**Acceptance:** `./scripts/update-db.ps1` applies migrations against SQLite with no connection errors.

---

## Phase 2 — Five-minute quickstart

**Objective:** A stranger can install the app from the README alone.

**Deliverables**
- README "Getting started": clone → copy `.env.example` to `.env` → `docker compose up` → open `http://localhost:8081`.
- Note explaining first-run account creation via the Identity `/register` route.
- A health endpoint the compose file can use for readiness.

**Acceptance:** Following only the README on a clean machine yields a usable, logged-in instance in under 5 minutes.

---

## Phase 3 — Backend test foundation

**Objective:** The backend can be tested at all.

**Deliverables**
- A shared xUnit test project named `src/3DPrintingHub.Tests`.
- First meaningful unit tests against existing domain/application behavior.
- Integration-test support using a temporary SQLite database and `WebApplicationFactory` for API, EF Core and service-integration changes.
- Frontend unit and component-integration tests using Vitest + jsdom, including repair of the stale baseline spec.
- Global frontend coverage at or above 80%.

**Acceptance:** `dotnet test` and `npm test` run green from a clean checkout, and frontend coverage is at least 80%.

---

## Phase 4 — CI gates

**Objective:** Broken builds cannot reach `ghcr.io`.

**Deliverables**
- `.github/workflows/build-publish.yml` gains build + `dotnet test` + `npm test` + frontend coverage steps.
- Pull requests and merges to `main` are blocked when required tests or the 80% frontend coverage threshold fail.

**Acceptance:** A workflow run with a failing test or insufficient frontend coverage stops before publishing images and cannot merge to `main`.

---

## Phase 5 — Sign-out button styling *(was TODO.md → Next)*

**Objective:** The sign-out button matches the other navbar buttons.

**Deliverables**
- Sign-out control in `core/ui/nav-bar` uses the same classes/component conventions as its siblings.

**Acceptance:** The navbar renders visually consistent buttons, with no bespoke sign-out styling left behind.

---

## Phase 6 — Frontend architecture consolidation *(was TODO.md → **Now**)*

**Objective:** The client is DRY, organised predictably, and free of repeated code.

**Deliverables**
- Duplicated table/modal/form logic between `filaments`, `models`, `settings` and `stocked` extracted into shared building blocks.
- Feature folders normalised to the `pages/` + `components/` structure described in `ARCHITECTURE.md`.
- Pages lazy-loaded in `app.routes.ts` instead of eagerly imported.
- No HTTP call or API URL remains inside a component.

**Acceptance:** Identical UI concerns exist once in `shared/` or `core/`, the client builds, its tests pass, and every existing page still works.

---

## Phase 7 — Global timestamp formatter *(was TODO.md → Next)*

**Objective:** ISO timestamps render as `YYYY-MM-DD` everywhere, defined once.

**Deliverables**
- A shared formatting utility plus an Angular pipe that turns `2026-08-25T03:58:56.028895` into `2026-08-25`.
- All templates currently formatting dates by hand switched to it.

**Acceptance:** No inline date formatting remains in feature templates, and the formatter has unit coverage.

---

## Phase 8 — Global table component *(was TODO.md → Next)*

**Objective:** One table component with sorting and filtering, used app-wide.

**Deliverables**
- Shared sortable/filterable table component in `shared/ui`.
- Adopted by the filament, model and stock tables; per-feature sorting/filtering code deleted.

**Acceptance:** The three existing tables lose their bespoke sort/filter logic and behave identically or better.

---

## Phase 9 — Filament remaining-weight adjuster *(was TODO.md → Next)*

**Objective:** Adjust a spool's remaining weight from the filament table.

**Deliverables**
- On the remaining-weight column: `+`, `−` and `update` buttons plus a numeric input.
- `+` adds the entered amount, `−` subtracts it, `update` sets the total to the entered value.
- The adjustment goes through the service layer atomically, and the resulting value is validated (never negative).

**Acceptance:** Each of the three actions yields the expected persisted weight after a page reload, and an invalid operation surfaces an error instead of corrupting the value.

---

## Phase 10a — Clients backend *(was TODO.md → Next)*

**Objective:** The `Client` domain concept exists end to end on the server.

**Deliverables**
- `Client` entity in `Domain`, DTOs + validators in `Application`, `IClientService` + implementation, `ClientsController`, and an EF Core migration.

**Acceptance:** A client can be created, listed, read and updated through the API, with validation errors surfaced as problem details.

---

## Phase 10b — Clients frontend *(was TODO.md → Next)*

**Objective:** A client page where basic info is gathered.

**Deliverables**
- `features/clients` with list and create/edit pages, models in `domain/models`, and a repository in `data/`.
- Route registered behind `authGuard` and added to the navbar.

**Acceptance:** A user can create, edit, list and delete clients from the UI, and the data survives a reload.

---

## Phase 11a — Sales backend

**Objective:** Sales are recorded and tied to clients and stock.

**Deliverables**
- `Sale` entity linking client, model/product stock (and filament where relevant), quantity, price and a payment-received flag.
- Atomic product-stock decrement on sale; DTOs, validators, `ISaleService` + implementation, `SalesController`, migration.

**Acceptance:** Recording a sale decrements stock exactly once, and an over-sale is rejected without side effects.

---

## Phase 11b — Sales and money-owed frontend

**Objective:** A sales registry, plus per-client selling history and who owes money.

**Deliverables**
- `features/sales` list + create/edit, built on the shared table and date formatter.
- Client detail view showing selling history and outstanding balance.
- A way to mark a sale as paid.

**Acceptance:** Sales are visible per client, unpaid sales sum into a clear "owes me money" figure, and marking a sale paid updates that figure.

---

## Phase 12 — Print job registry *(was TODO.md → Next)*

**Objective:** The orphaned `PrintJob` entity becomes usable: finishing a job adds the printed quantity to stock and consumes the filament it used.

**Deliverables**
- DTOs, service, controller and wiring for `PrintJob`, with material cost calculated from the filament's cost per gram.
- Completing a job **adds the produced quantity to product stock** and **reduces the filament's remaining weight** by the grams used, atomically — reusing the stock-decrement pattern established in Phase 11a.
- A UI surface for print history.

**Acceptance:** Completing a job against a filament is recorded, listed, increases stock by the produced quantity, lowers the filament's remaining weight by the grams used, and its material cost reflects the filament's cost per gram. A job that would drive the filament weight negative is rejected without side effects.

**Note:** This phase sits after Phase 11a deliberately, because it reuses the atomic stock-adjustment pattern introduced there rather than inventing a second one.

---

## Phase 13 — Hardening backlog *(optional, as needed)*

**Objective:** Address remaining Gap Register items when a real need appears.

**Deliverables** (pick one at a time)
- Roles and authorization policies (`Admin`/`Operator`), restricting cost and margin data.
- Pagination on list endpoints.
- Structured logging and a health/readiness endpoint.
- Any item promoted out of the Gap Register in `tech-stack.md`.

**Acceptance:** The chosen item ships with tests, and its Gap Register row is updated or removed.

---

## Open Questions

1. **Sequencing.** `TODO.md` originally marked the frontend cleanup as "Now", but the mission front-loads the foundations (Phases 0–4). The order above follows the mission. If you would rather do Phase 6 first and move Phases 0–4 later, say so and this file gets reordered.
2. **Test framework.** Phase 3 uses **xUnit** in one shared `src/3DPrintingHub.Tests` project. API/EF/service-integration tests use a temporary SQLite database and `WebApplicationFactory`; frontend tests use Vitest + jsdom with an 80% global coverage floor.
3. **First-run account model.** `/register` stays open for the single-operator self-hosted install. Phase 2 provides a discoverable register page that creates the operator account and signs it in immediately.
4. **Single user vs. several.** This constitution assumes one operator per instance. If fork owners are expected to host several people, roles (Phase 13) moves up in priority.
