# Requirement — Five-minute quickstart

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 2 (*Five-minute quickstart*) |
| **Branch** | `phase-2-five-minute-quickstart` |
| **Spec directory** | `specs/2026-09-16-five-minute-quickstart/` |
| **Date opened** | 2026-09-16 |
| **Status** | Implemented — Task Groups 1-8 done on this branch; evidence collected per `validation.md` |
| **Depends on** | Phase 0 (`.env.example` exists), Phase 1 (scripts correct, `.slnx` buildable) |
| **Blocks** | Phase 4 (CI gates) — the publish workflow gains a platform matrix here |

---

## 1. Objective

A stranger with only Docker installed reads `README.md`, runs one command, opens `http://localhost:8081`, creates
their account and is signed in — on a clean machine, in under five minutes, without reading the source.

Three roadmap deliverables carry that sentence:

1. A **README "Getting started"** section: clone → copy `.env.example` to `.env` → `docker compose up` → open
   `http://localhost:8081`.
2. A note explaining **first-run account creation** through the Identity `/register` route.
3. A **health endpoint** the compose file can use for readiness.

Two blocking defects were found while auditing those three lines. Both are fixed here, because the acceptance
criterion — *"a usable, logged-in instance"* — is otherwise unreachable:

- **The containerised login cannot work.** The Identity routes are mapped at the API root, but nginx only proxies
  `/api`, so the browser's `POST /login` is answered by the Angular shell.
- **The published images are `linux/arm64` only**, so `docker compose up` cannot pull them on an amd64 machine.

---

## 2. Why this is the next phase (audit evidence)

The roadmap says the next feature spec is the lowest-numbered phase that is not done. Verified on `main` at
`2fed3cf`:

### Phases 0 and 1 are done, Phase 2 is untouched

- `git log --oneline` shows the Phase 0/1 work landed (`1ba4c04`, `25abb1d`, `ce25010`, `79a167b`); `git ls-files |
  Select-String '\.env'` returns exactly `.env.example`.
- `README.md` has **no** Getting-started section: its headings are *Features*, *Project Structure*, *Development
  scripts*, *CI/CD* and *License*. The script table added in Phase 1 documents `5033`/`4200` and explicitly defers
  the container walkthrough.
- `git grep -i health -- src` returns nothing: `Program.cs` maps only controllers and the Identity routes. There is
  no health endpoint, no `AddHealthChecks()`, and no compose `healthcheck` in either service.
- `app.routes.ts` exposes `/login` as the only public route and the login template contains no register link, so
  first-run account creation has no UI surface at all.

### The identity routing gap (blocking)

| Step | Evidence |
|---|---|
| 1 | `Program.cs:78` — `app.MapIdentityApi<IdentityUser>()` maps `/register`, `/login`, `/refresh`, `/confirmEmail`, `/resendConfirmationEmail`, `/forgotPassword`, `/resetPassword` and `/manage/*` at the **application root**. |
| 2 | `nginx.conf` has exactly two locations: `/` (static SPA with `try_files … /index.html`) and `/api` (`proxy_pass http://webapi:8080`). |
| 3 | `angular.json:36-37` replaces `environment.ts` with `environment.prod.ts` for the production build, and `Dockerfile.frontend:11` builds with `--configuration=production`. |
| 4 | `environment.prod.ts` sets `apiUrl: '/api'`; `auth.service.ts:23` derives `identityUrl` by stripping `/api` → `''`; `login()` posts to `${identityUrl}/login` → **`/login` on the frontend origin**. |
| 5 | nginx answers that same-origin `POST /login` from `location /` with `index.html` (HTTP 200 + HTML), so the login page can never authenticate in Docker. |

Local development is unaffected: `environment.ts` sets `apiUrl: 'http://localhost:5033/api'`, so `identityUrl`
becomes `http://localhost:5033` and the call reaches the API directly (allowed by the `AllowFrontend` CORS policy).

### The arm64-only publish (blocking)

`.github/workflows/build-publish.yml:40` and `:50` pin `platforms: linux/arm64`. `docker-compose.yml` declares both
`image:` and `build:`, and Compose's default `pull_policy: missing` tries the registry **first**, so on an
x86_64 host the quickstart fails with `no matching manifest for linux/amd64` instead of falling back to a local
build. The README cannot honestly promise a five-minute install to the majority of users until this is fixed.

### Findings recorded here but fixed elsewhere

- The Docker daemon is **not running** on the development machine while this spec was written (`Docker version
  29.7.2`, `Docker Compose version v5.3.1`, but `npipe:////./pipe/dockerDesktopLinuxEngine` is absent). The compose
  half of `validation.md` can only run once Docker Desktop is started; this is an environment condition, not a
  defect.
- No backend test project exists, so the API-side proof here stays manual (`dotnet build` plus a live `curl`).
  Automating it is Phase 3.
- `.github/workflows/build-publish.yml` still runs no tests before publishing. Phase 4 owns that gate; this spec
  only changes its `platforms:` matrix.
- `app.spec.ts` still fails 1 of its 2 assertions (`should render title` expects an `h1` the shell never renders).
  Pre-existing, recorded in the Gap Register, and repaired in Phase 3 — not touched here.

---

## 3. Scope

**In scope**

- `README.md`: a single, numbered *Getting started* walkthrough for the Docker path, plus first-run account notes
  and a short troubleshooting block.
- A health endpoint in the API (`GET /health`) and compose `healthcheck` blocks for both services, with the
  frontend gated on the API's health.
- nginx proxy rules that make the Identity surface reachable on the published origin.
- A client register page (`/register`) with a link from the login page, so first-run account creation is
  discoverable rather than a raw HTTP call.
- The publish workflow's platform matrix (`linux/amd64` added).
- Traceability: `tech-stack.md` Gap Register, `roadmap.md` Open Question 3, and a `CHANGELOG.md` entry once the
  owner-declared commit exists.

**Out of scope**

- Readiness/deep health checks (SQLite `CanConnect()`, EF Core health-check package) — deferred to Phase 13.
- CI gating of the image publish jobs with tests — Phase 4.
- Any change to `Domain`, `Application`, `Infrastructure`, entities, DTOs, validators, services or migrations.
- Roles, authorization policies, pagination, structured logging, i18n — Phase 13 backlog.
- A hosted/one-click installer, HTTPS termination, or a reverse-proxy setup guide beyond the shipped compose file.
- Multi-user onboarding: the instance still assumes **one operator** (mission §"Who it's for").

---

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | The quickstart consumes **prebuilt `ghcr.io` images**. `build-publish.yml` publishes `linux/amd64` **and** `linux/arm64`; the README documents `docker compose up -d` as the pull-first path (`pull_policy: missing` fetches the image) and keeps `docker compose up --build` as the documented fork/offline fallback. | Owner decision, 2026-09-16. Publishing arm64 only makes the pull path fail on ordinary amd64 hosts, so the phase's acceptance sentence is untrue without it. Adding a second platform is a one-line matrix change and does not alter the workflow's responsibilities (it still publishes, it does not deploy). |
| **D2** | First-run account creation is a **client register page**: `features/auth/pages/register-page.component.{ts,html,css}`, a public `register` route, and a link from the login page. It calls the Identity `POST /register` through `AuthService.register()` and, on success, signs the operator in immediately via the existing `login()` flow. No account is seeded and registration stays open. | Owner decision, 2026-09-16. It answers roadmap Open Question 3 ("`/register` stays open") and mission principle 6 — *"a feature nobody can find is not finished"*. `ARCHITECTURE.md:66` already anticipates `features/auth/register-page.component.ts`, so this is the shape the client was designed for. The README's note becomes a link plus a password-policy hint instead of a `curl` command. |
| **D3** | A **liveness-only** health endpoint: `builder.Services.AddHealthChecks()` plus `app.MapHealthChecks("/health")`. Compose probes the API with a bash `/dev/tcp` connection test. `/health/ready` and any database-connectivity verdict are deferred to Phase 13. | Owner decision, 2026-09-16. Liveness is what `depends_on: condition: service_healthy` needs to stop the frontend from serving before the API is listening. `Microsoft.AspNetCore.Diagnostics.HealthChecks.dll` is part of the `Microsoft.AspNetCore.App` 10.0.10 shared framework (verified in the local ref pack), so this adds **no package**. A deep check would need `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` — a dependency decision this phase does not have to make. |
| **D4** | `nginx.conf` gains explicit proxy locations for the Identity surface: `/login`, `/register`, `/refresh`, `/confirmEmail`, `/resendConfirmationEmail`, `/forgotPassword`, `/resetPassword` (as one anchored regex location) and `/manage/`, all proxying to `http://webapi:8080` with the same header set as `/api`. | Mandatory, not a preference: §2 proves the production client posts same-origin `/login` and `/register`, which `location /` answers with `index.html`. Proxying at nginx keeps the client's URL derivation (`environment.apiUrl` minus `/api`) intact and avoids re-plumbing `MapIdentityApi` under a path prefix in `Program.cs`, which would also change every local development URL. |
| **D5** | The frontend is gated on the API and both services carry a `healthcheck`; the frontend probe uses busybox `wget --spider` (`nginx:alpine`), the API probe uses bash `/dev/tcp` (`mcr.microsoft.com/dotnet/aspnet:10.0` is Debian-based and has bash but **no** `curl`/`wget`). The API's `start_period` is 30 s. | Avoids modifying `Dockerfile.api` to install a probe tool, keeping the image unchanged and the diff reviewable. The `start_period` absorbs first-boot migrations plus `SettingsSeeder`, so a container is not reported unhealthy while EF Core is still migrating. |
| **D6** | The README keeps **one** canonical walkthrough, under `## 🚀 Getting started`, as five numbered steps. The existing *Development scripts*, *CI/CD* and *License* sections stay and are not duplicated. | A stranger installs from the README alone (Phase 2 objective); duplicating the container ports in two places is how the Postgres-era drift fixed in Phase 1 happened. |
| **D7** | Local development is untouched: dev identity calls keep pointing at `http://localhost:5033`, and the dev ports remain API `5033` / client `4200`. | Only the containerised origin is broken; the dev path already works through the `AllowFrontend` CORS policy. Changing it would invalidate the script behaviour documented in Phase 1. |
| **D8** | No entity, DTO, validator, service, controller or migration changes; no new NuGet or npm dependency. | Keeps this phase about installation, and keeps Phase 3 (test foundation) and Phase 4 (CI gates) free of inherited risk. If a dependency ever becomes necessary, `tech-stack.md`'s decision table gets a row *before* use. |

---

## 5. Context

### Verified environment (development machine, 2026-09-16)

| Thing | Value |
|---|---|
| .NET SDK | `10.0.302`; shared framework `Microsoft.AspNetCore.App` `10.0.10` |
| Docker | client `29.7.2`; Compose `v5.3.1`; **daemon stopped** while this spec was written |
| Node / Angular | Angular `22.1`, npm `11.16.0`, Vitest 4 + jsdom 28 |
| Ports | dev API `5033`, dev client `4200`; published frontend `8081:80`, API `8080` inside `app-net` |
| SQLite | named volume `printinghub-data` → `/data/printinghub.db`; migrations auto-applied at boot by `Program.cs:62`, then `SettingsSeeder.SeedAsync` (`Program.cs:64`) |
| Identity | `AddIdentityApiEndpoints<IdentityUser>()` (`Program.cs:24`), routes from `MapIdentityApi<IdentityUser>()` (`Program.cs:78`) |
| Client URL derivation | `environment.apiUrl` is `http://localhost:5033/api` (dev) or `/api` (prod); `auth.service.ts:23` strips a trailing `/api` |
| Route/template convention | `features/auth/pages/login-page.component.{ts,html,css}` — standalone, `inject()`, `signal()` state, `nonNullable` reactive form, hand-rolled CSS, no UI library |
| Files this phase touches | `README.md`, `nginx.conf`, `docker-compose.yml`, `.github/workflows/build-publish.yml`, `src/3DPrintingHub.Api/Program.cs`, `src/3DPrintingHub.Client/src/app/{app.routes.ts, core/auth/auth.service.ts, features/auth/pages/*}`, `specs/*` |

### Why bash `/dev/tcp` and busybox `wget`

`mcr.microsoft.com/dotnet/aspnet:10.0` is Debian-based: `bash` is present, `curl` and `wget` are not. Adding either
would mean editing `Dockerfile.api` (an image change) purely to satisfy a probe, so the API probe is:

```sh
bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080' || exit 1
```

`nginx:alpine` ships busybox, so the frontend probe is the conventional `wget --spider -q http://localhost/`.

### Note on `UseHttpsRedirection`

`Program.cs:67` calls `app.UseHttpsRedirection()` while the container only exposes HTTP (`ASPNETCORE_URLS=http://+:8080`,
`Dockerfile.api:20` `ASPNETCORE_HTTP_PORTS=8080`). With no HTTPS port configured the middleware logs *"Failed to
determine the https port for redirect"* and passes the request through. That is why `/health` and `/login` are
expected to answer on plain HTTP inside the compose network; `validation.md` asserts it rather than assuming it.

### Traceability actions

- `roadmap.md` **Open Question 3** is answered by D2 — the file gains the answer inline and keeps its "no status
  markers" convention (a phase is complete when its Acceptance passes; evidence lives in `validation.md`).
- `tech-stack.md` Gap Register: the *"No structured logging and no health endpoint"* row loses its health half, and
  two new rows record the defects this spec fixes (identity not proxied, arm64-only publish) as resolved.
- `CHANGELOG.md` is date-grouped with a subject plus short SHA per bullet, generated with the `changelog` skill
  **after** the implementation commits exist (working agreement, `mission.md` §"Working agreement").

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Proxying `/login`, `/register` … at nginx **shadows** the Angular routes with the same names, and any Identity path missing from the list (a new route in a future .NET version) silently falls back to the SPA. | The regex location is anchored to exactly the current Identity surface, cross-checked against the ASP.NET Core 10 endpoint list (Group 3.2), and `proxy_intercept_errors on` + `error_page 405 =200 /index.html` keeps browser `GET`s on the SPA so deep links and refreshes still work. The comment in `nginx.conf` states that a future Identity route must be added to the list. |
| The register page duplicates form/regex logic instead of sharing it with the login page. | Accepted deliberately: Phase 6 is the DRY phase and Phase 8 introduces the shared table/form building blocks. Sharing now would front-run a spec the roadmap already scheduled, and D8 keeps this phase dependency-free. |
| `start_period: 30s` is tuned to a cold SQLite migration on a slow machine; too short makes `docker compose up` report `unhealthy` on first boot. | 30 s plus `retries: 5` at `interval: 10s` gives ~80 s of grace before a failure is final, and `validation.md` measures the real first-boot time. The value is data, not taste: if V10 measures longer, the value changes in the same branch. |
| A `healthcheck` with `condition: service_healthy` makes the frontend wait for the API, so a genuinely broken API now yields a *waiting* frontend instead of a running-but-erroring one. | That is the intended trade (roadmap: the endpoint is for readiness) and the failure is louder: `docker compose ps` shows the API `unhealthy`. Troubleshooting in the README names it. |
| Adding `linux/amd64` to the workflow doubles the build cost of every push to `main`. | QEMU emulation is already in use for arm64 on `ubuntu-latest`; both platforms build through the same `build-push-action@v5` step. If it becomes slow, moving to native runners or a matrix is a CI-only change Phase 4 can make. |
| The README's five-minute claim is measured on a machine with a warm Docker cache, which is dishonest evidence. | `validation.md` V9 mandates `docker compose down -v` (cold volume) and a timed stopwatch run whose number is pasted as evidence, warm or cold. |
| Someone follows the README on Windows/Linux and hits port `8081` already in use. | The troubleshooting block documents the symptom and the fix (edit the `8081:80` mapping, since only the host side is configurable), and V11 checks the README names it. |

---

## 7. Done means

The roadmap's own acceptance sentence, quoted:

> **Phase 2 —** *"Following only the README on a clean machine yields a usable, logged-in instance in under 5
> minutes."*

Every deliverable line of the roadmap phase is covered:

| Roadmap deliverable | Where it lands |
|---|---|
| README "Getting started": clone → copy `.env.example` to `.env` → `docker compose up` → open `http://localhost:8081` | Task Group 6 |
| Note explaining first-run account creation via the Identity `/register` route | Task Groups 5 and 6 (D2) |
| A health endpoint the compose file can use for readiness | Task Groups 2 and 4 (D3, D5) |

`validation.md` turns the acceptance sentence into reproducible commands with pasted evidence, including the two
defects that had to be fixed for it to be true at all (D1, D4).
