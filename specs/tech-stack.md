# Tech Stack — 3D Printing Hub

This is the constitution for *what we build with*. The stack below is the one already in the repository: descriptive first, prescriptive second.

> **Dependency rule:** Do not add a library or an external service that is not listed here without recording the decision at the end of this file with a one-line justification.

## Backend — .NET

Target framework `net10.0` across all projects; `Nullable` and `ImplicitUsings` enabled; root namespaces follow `_3DPrintingHub.<Layer>` (note the leading underscore). Solution: `src/3DPrintingHub.slnx`.

Four projects, one direction of dependency:

```
3DPrintingHub.Domain          # entities only, no dependencies
3DPrintingHub.Application     # service interfaces, DTOs, validators, exceptions
3DPrintingHub.Infrastructure  # EF Core DbContext, migrations, service implementations
3DPrintingHub.Api             # controllers, middleware, hosting, app settings
```

| Project | References | Packages |
|---|---|---|
| `Domain` | — | none |
| `Application` | `Domain` | `FluentValidation.DependencyInjectionExtensions` 12.1.1 |
| `Infrastructure` | `Application` | `Microsoft.AspNetCore.Identity.EntityFrameworkCore` 10.0.11, `Microsoft.EntityFrameworkCore.Sqlite` 10.0.10, `Microsoft.EntityFrameworkCore.Design` 10.0.10, `SQLitePCLRaw.bundle_e_sqlite3` 3.0.5, `Microsoft.Extensions.Configuration` 10.0.11, `Microsoft.Extensions.Configuration.Json` 10.0.0 |
| `Api` | `Application`, `Infrastructure` | `FluentValidation.AspNetCore` 11.3.1, `Microsoft.EntityFrameworkCore.Design` 10.0.10, `Microsoft.OpenApi` 3.9.0, `Microsoft.AspNetCore.Components.WebAssembly.Server` 10.0.10 |

**Persistence:** EF Core with **SQLite**. No database server, no external storage service. Migrations live in `src/3DPrintingHub.Infrastructure/Migrations` and are applied automatically at startup (`dbContext.Database.Migrate()`), immediately followed by `SettingsSeeder.SeedAsync(dbContext)`.

**API surface:** ASP.NET Core MVC controllers — not minimal APIs — for domain features. `System.Text.Json` with `JsonStringEnumConverter`. Cross-cutting wiring lives in `Program.cs`; application services are registered centrally through `AddApplicationServices()`.

**Validation:** FluentValidation, with validators colocated in `Application/Validators`.

**Errors:** `AddProblemDetails()` plus a global exception middleware (`app.UseGlobalExceptionHandler()`), registered before routing.

**Security:** ASP.NET Core Identity with the built-in `IdentityUser` and `AddIdentityApiEndpoints<IdentityUser>()`; routes come from `MapIdentityApi<IdentityUser>()` (`/login`, `/register`, `/manage/*`). Bearer-token authentication, `AddAuthorization()` registered. CORS policy `AllowFrontend`, origin read from the `AllowedOrigin` configuration key (default `http://localhost:4200`).

## Frontend — Angular

Angular **22.1** with standalone components (no NgModules), TypeScript `~6.0.2`, RxJS `~7.8.0`, npm `11.16.0`.

| Concern | Choice |
|---|---|
| Framework | `@angular/core`, `common`, `compiler`, `forms`, `platform-browser`, `router` — all 22.1.x |
| Build | `@angular/build` + `@angular/cli` 22.1.2 |
| Test | **Vitest 4** + jsdom 28 (already configured) |
| Formatting | Prettier 3.8 |
| UI library | **None** — hand-rolled CSS. No Angular Material, no Tailwind. |
| State management | **None** — RxJS streams plus component state. No NgRx, no Signals store. |
| i18n | None |

## Data model surface

Entities in `src/3DPrintingHub.Domain/Entities`:

`Brand`, `Filament`, `FilamentColor`, `FilamentProfile`, `Marketplace`, `MaterialType`, `ModelPrint`, `ModelPrintCategory`, `PrintJob`, `ProductStock`, `PublishedModels`, `Settings`.

Conventions: `Guid Id { get; set; } = Guid.NewGuid();` on every entity; navigation properties are nullable (`?`) and paired with an explicit foreign-key `Guid`; collections are initialised with `[]`. `Settings` is the one exception, using lowercase `parameter` / `value` property names.

## Project layout — client

As documented in `src/3DPrintingHub.Client/src/app/ARCHITECTURE.md`:

```
core/          # cross-cutting: auth (guard, service), http (api-client, interceptors), ui (nav-bar)
domain/models/ # TypeScript contracts mirroring the API DTOs
data/          # repositories — one per API resource
features/      # one folder per business domain: auth, dashboard, filaments, models, settings, stocked
shared/ui/     # modal, list-state, table-actions, confirm-delete
```

**Rules:** components own presentation, repositories own HTTP, never call HTTP from a view, never embed URLs in components, and anything used by more than one feature belongs in `core/` or `shared/`. Routes are declared in `app.routes.ts` behind `authGuard`, with `/login` as the only public route.

## Ops and deployment

- `Dockerfile.api` and `Dockerfile.frontend`, both multi-stage. The client is served by **Nginx**, which also acts as the reverse proxy via `nginx.conf`.
- `docker-compose.yml`: the API listens internally on `8080` with SQLite at `/data/printinghub.db` on the named volume `printinghub-data`; the frontend is published on host port `8081`. `AllowedOrigin` is supplied through `FRONTEND_URL`.
- Liveness: the API exposes anonymous `GET /health`; Compose probes the API on port `8080` and the frontend with Nginx, with the frontend gated on API health.
- `.github/workflows/build-publish.yml`: on push to `main` it builds and pushes `ghcr.io/alandelac/3d_printing_hub_api:latest` and `ghcr.io/alandelac/3d_printing_hub_frontend:latest`. **It publishes images only — it does not deploy or run them.**
- Local development: `scripts/run-all.ps1`, `run-program.ps1`, `run-front.ps1`, `update-db.ps1`. Ports: **API `5033`, client `4200`**.

## Gap Register

Deltas between what the stack promises and what exists. Each gap is scheduled in `roadmap.md`.

| Gap | Severity | Notes |
|---|---|---|
| No `Client` and no `Sale` entity, DTO, service or controller | **High** | `README.md` advertises both; neither exists. |
| `PrintJob` entity is orphaned | Medium | No service, DTO or controller — print history is unreachable. |
| No backend test project; CI runs no tests | **High** | No xUnit/NUnit/MSTest project exists at all. |
| Vitest configured but only one client spec (`app.spec.ts`), and that spec is stale — 1 of its 2 assertions fails | Medium | Measured 2026-09-16 (Phase 1): `should render title` expects an `h1` the shell never renders; the failure predates this branch and no client file changed. Repairing it and adding real coverage is Phase 3. |
| `.env` holds a live `OPENROUTERKEY` (plus a stale `DB_PASSWORD`) **locally** — it was never committed | **Low** | Corrected 2026-09-16 (Phase 0): `git log --all -- .env` is empty and `.gitignore:7` ignores it, so nothing leaked through this repository. Rotating both values on the provider side stays a manual operator action. The tracked template is `.env.example` (placeholders only). |
| `scripts/update-db.ps1` passed a **PostgreSQL** connection string | **Resolved** | Rewritten for SQLite in Phase 1: the script resolves `src/3DPrintingHub.Api/printinghub.db` from the repository root and fails loudly instead of silently doing nothing. |
| No pagination on list endpoints | Medium | Every list returns the full table. |
| No roles or authorization policies | Medium | Any authenticated user has full access. |
| No structured logging | Low | The global exception handler exists, and the liveness-only `/health` endpoint was added in Phase 2; deep readiness checks remain deferred to Phase 13. |
| Identity routes were mapped at the API root while nginx only proxied `/api` | **Resolved** | Phase 2 adds nginx proxy locations for `/login`, `/register`, refresh/confirmation/password routes and `/manage/*`. |
| Images were published for `linux/arm64` only | **Resolved** | Phase 2 publishes both `linux/amd64` and `linux/arm64` so the Docker quickstart works on common hosts. |
| No date/currency formatting utility and no i18n | Low | Formatting logic is duplicated per component. |

## Dependency decisions

Record additions here **before** using them.

| Date | Decision | Justification |
|---|---|---|
| — | *None yet beyond the stack listed above.* | — |
