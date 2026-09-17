# Plan — Five-minute quickstart

Roadmap Phase 2, as one change on branch `phase-2-five-minute-quickstart`.
Scope, decisions and rationale live in `requirement.md` (D1-D8); proof of success lives in `validation.md`.

Each group ends in a state where the repository builds and the app still runs, so the branch can be reviewed group
by group. **Do the groups in order** — Group 4 probes the endpoint added in Group 2, and Group 6 documents what
Groups 3 and 5 made true.

Two groups exist because the phase cannot pass without them: Group 3 (the containerised login is broken today) and
Group 7 (the published image does not exist for amd64). Both are recorded as decisions D4 and D1.

---

## Task Group 1 — Branch, spec, and baselines

| # | Task | Verify |
|---|---|---|
| 1.1 | Create the branch `phase-2-five-minute-quickstart` from `main`. | `git status --branch --short` → `## phase-2-five-minute-quickstart`. |
| 1.2 | Create `specs/2026-09-16-five-minute-quickstart/` with `requirement.md`, `plan.md`, `validation.md`. | Three files exist and `git status --short` lists them as untracked. |
| 1.3 | Record the API baseline. | `dotnet build src/3DPrintingHub.slnx` → `0 Advertencia(s)` / `0 Errores`. |
| 1.4 | Record the client baseline and confirm the *pre-existing* failure is unchanged, not newly caused. | `npm test` in `src/3DPrintingHub.Client` → 1 of 2 `app.spec.ts` assertions fails (`should render title`); `git diff main..HEAD -- src/3DPrintingHub.Client/src/app/app.spec.ts` stays empty for the whole branch. |
| 1.5 | Record the compose baseline. | `docker compose config --quiet` exits 0; `docker compose config` shows no `healthcheck` key yet. |

> Group 1.5 needs the Docker daemon. If Docker Desktop is stopped, record that as an environment note and continue;
> Groups 2, 3 and 5-8 are fully verifiable without it.

---

## Task Group 2 — Health endpoint (D3)

| # | Task | Verify |
|---|---|---|
| 2.1 | In `src/3DPrintingHub.Api/Program.cs`, register the health services next to `AddProblemDetails()` (currently line 22): `builder.Services.AddHealthChecks();` | `git grep -n 'AddHealthChecks' -- src` returns one match in `Program.cs`. |
| 2.2 | Map the endpoint next to `app.MapControllers()` (currently line 77): `app.MapHealthChecks("/health");` with a one-line comment saying it is the liveness probe used by `docker-compose.yml`. | `git grep -n 'MapHealthChecks' -- src` returns one match. |
| 2.3 | Confirm no new package was needed. | `git diff -- src/3DPrintingHub.Api/3DPrintingHub.Api.csproj` is empty; `Microsoft.AspNetCore.Diagnostics.HealthChecks.dll` resolves from the `Microsoft.AspNetCore.App` 10.0.10 shared framework. |
| 2.4 | Run the API and probe it. | `./scripts/run-program.ps1`, then `curl.exe -i http://localhost:5033/health` → `HTTP/1.1 200 OK`, body `Healthy`. |
| 2.5 | Confirm the endpoint is anonymous and unaffected by auth. | The same `curl` without an `Authorization` header returns 200 (no 401, no redirect). |
| 2.6 | Confirm existing behaviour is unchanged. | `POST http://localhost:5033/login` with a bad password still returns `401`; an unauthenticated `GET` on a domain endpoint still returns `401`. |

**Wiring note:** `MapHealthChecks` is an endpoint-routing call, so it must sit after `app.UseRouting()`; placing it
beside `app.MapControllers()`/`app.MapIdentityApi<>()` keeps the pipeline order intact and needs no
`UseHealthChecks` middleware. The type comes from the shared framework, so no `using` directive is required.

---

## Task Group 3 — Identity reachability through nginx (D4)

| # | Task | Verify |
|---|---|---|
| 3.1 | Add one anchored regex location to `nginx.conf` for the flat Identity routes, and one prefix location for `/manage/`, both proxying to `http://webapi:8080` with the same header block as `/api`. | `docker compose config` parses; `nginx -t` inside the rebuilt frontend image reports `syntax is ok` (V5). |
| 3.2 | Prove the routes the regex matches are exactly the routes `MapIdentityApi` maps. | Cross-check against the ASP.NET Core 10 Identity endpoint list: `/register`, `/login`, `/refresh`, `/confirmEmail`, `/resendConfirmationEmail`, `/forgotPassword`, `/resetPassword`, `/manage/2fa`, `/manage/info`. |
| 3.3 | Confirm no client route collides with the proxied names beyond the intended `/login`. | `git grep -n "path:" -- src/3DPrintingHub.Client/src/app/app.routes.ts` shows only `login`, `dashboard`, `filaments`, `models`, `settings`, `stocked`, `''`. |
| 3.4 | Keep the SPA fallback reachable for deep links. | Declared after `location /` for readability; nginx still matches by regex first, and `/dashboard` continues to return `index.html` (V5). |
| 3.5 | Handle the `GET` case on the proxied paths: the Identity API only answers `POST`, so a browser deep link or `F5` on `/login` would return `405` from the API unless the location intercepts it. Use `proxy_intercept_errors on;` plus `error_page 405 =200 /index.html;` so the SPA is served instead. | `curl.exe -i http://localhost:8081/login` → `200` with `index.html`; `curl.exe -i -X POST http://localhost:8081/login -H "Content-Type: application/json" -d '{"email":"x@y.z","password":"nope"}'` → `401` JSON, not HTML. |
| 3.6 | Confirm no client route collides with the proxied names beyond the intended `/login`. | `git grep -n "path:" -- src/3DPrintingHub.Client/src/app/app.routes.ts` shows only `login`, `dashboard`, `filaments`, `models`, `settings`, `stocked`, `''`. |
| 3.7 | Change nothing in the client's URL derivation. | `git diff -- src/3DPrintingHub.Client/src/environments` is empty; `auth.service.ts` still derives `identityUrl` by stripping `/api`. |

**Content to write** (inserted after the existing `location /api` block):

```nginx
    # Identity API (MapIdentityApi) is mapped at the application root, not under /api.
    # The production client derives its identity base URL by stripping "/api" from
    # environment.apiUrl, so these requests arrive same-origin on the published port.
    # Without these locations nginx answers them with index.html via the SPA fallback
    # (a 200 + HTML body), which makes signing in impossible.
    location ~ ^/(login|register|refresh|confirmEmail|resendConfirmationEmail|forgotPassword|resetPassword)$ {
        proxy_pass http://webapi:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # The same paths are Angular routes: the API only answers POST, so a browser
        # GET (deep link, or a refresh on the login page) would hit a 405. Turn that
        # single status into the SPA; every other upstream status passes through.
        proxy_intercept_errors on;
        error_page 405 =200 /index.html;
    }

    # /manage/* (2fa, info) is a distinct prefix inside the same Identity surface.
    location /manage/ {
        proxy_pass http://webapi:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

---

## Task Group 4 — Compose readiness (D3, D5)

| # | Task | Verify |
|---|---|---|
| 4.1 | Add a `healthcheck` to the `webapi` service: `test: ["CMD-SHELL", "bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080'"]`, `interval: 10s`, `timeout: 5s`, `retries: 5`, `start_period: 30s`. | `docker compose config` shows the block under `webapi`; `docker compose ps` reports `Up ... (healthy)`. |
| 4.2 | Add a `healthcheck` to the `frontend` service: `test: ["CMD", "wget", "-q", "--spider", "http://localhost/"]` with the same timings minus the long `start_period` (10 s). | Same as above; the probe is part of busybox in `nginx:alpine`, so no image change. |
| 4.3 | Gate the frontend on the API: `depends_on: webapi: condition: service_healthy` (replacing the bare list form). | `docker compose config` renders `condition: service_healthy`; `docker compose up -d` brings the frontend up only after the API is healthy. |
| 4.4 | Confirm no Dockerfile changed. | `git diff -- Dockerfile.api Dockerfile.frontend` is empty (D5: the probe tools ship with the base images). |
| 4.5 | Confirm the container still answers on plain HTTP. | From a started stack, `docker compose exec webapi bash -c "exec 3<>/dev/tcp/127.0.0.1/8080"` exits 0 and `curl.exe -i http://localhost:8081/api/...` through nginx is not redirected to HTTPS (no 307). |

**Content to write** (`webapi` gains the first block; `frontend` replaces `depends_on: - webapi` with the map form
and gains the second block):

```yaml
    healthcheck:
      test: ["CMD-SHELL", "bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080'"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

```yaml
    depends_on:
      webapi:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
```

---

## Task Group 5 — First-run account creation in the client (D2)

| # | Task | Verify |
|---|---|---|
| 5.1 | `core/auth/auth.service.ts`: add `export interface RegisterRequest { email: string; password: string; }` beside `LoginRequest`, and a `register(payload: RegisterRequest): Observable<void>` that POSTs to `` `${this.identityUrl}/register` ``. | `git grep -n 'register' -- src/3DPrintingHub.Client/src/app/core/auth/auth.service.ts` shows one method; the URL reuses the existing `identityUrl` field, so dev and prod both resolve correctly. |
| 5.2 | `features/auth/pages/register-page.component.ts`: standalone component, `inject()` for `FormBuilder`/`AuthService`/`Router`, `signal()` state for `loading` and `error`, `nonNullable` group with `email`, `password`, `confirmPassword`. | Matches the login page's conventions exactly (no constructor injection, no NgModules, no UI library). |
| 5.3 | Add the Identity password policy as a validator on `password` (min length 6, one digit, one lowercase, one uppercase, one non-alphanumeric) and a group-level match validator for `confirmPassword`. | A weak password is rejected client-side with a specific message before any HTTP call. |
| 5.4 | On submit: `register()` → `login()` → `router.navigate(['/dashboard'])`, so the operator lands **signed in** (acceptance says "logged-in", not "registered"). | Manual check in dev: registration ends on `/dashboard` with a token in `sessionStorage`. |
| 5.5 | Surface server errors: read `HttpErrorResponse.error.errors` (Identity returns ProblemDetails) and show the first message; fall back to a generic sentence when the body is not ProblemDetails. | A password that passes the client rules but fails a server rule shows the server's own message, not a blank form. |
| 5.6 | `features/auth/pages/register-page.component.html` + `.css`: mirror the login panel (eyebrow, `h1`, intro, labelled inputs, inline field errors, submit button, error region with `role="alert"`), with the CSS copying the login stylesheet's hand-rolled rules. | Rendered page is visually consistent with `/login` at 4200 in dev. |
| 5.7 | `app.routes.ts`: add `{ path: 'register', component: RegisterPageComponent }` as a public route above the `''` redirect. | `git grep -n 'register' -- src/3DPrintingHub.Client/src/app/app.routes.ts` shows the route; `/register` loads without `authGuard`. |
| 5.8 | `features/auth/pages/login-page.component.ts`/`.html`: import `RouterLink` and add a "Create an account" link to `/register` under the form. | The link is visible on `/login` and navigates without a full page reload. |
| 5.9 | Verify the client builds and the test baseline is unchanged. | `npm run build` (production) → no errors; `npm test` → same 1 pre-existing failure, no new failures. |

> Group 5.7 makes `/register` a client route *and* Group 3 makes `/register` an API route on the same origin. They do
> not collide: nginx matches the regex location first, so the API receives the `POST /register`, while a browser `GET`
> of `/register` (or `/login`) is converted back into the SPA by Group 3.5's `error_page 405 =200 /index.html`. Both
> entry points work, which is why the README can link to `http://localhost:8081` and let the client route from there.

---

## Task Group 6 — README "Getting started" (D1, D6)

| # | Task | Verify |
|---|---|---|
| 6.1 | Add `## 🚀 Getting started` immediately after the intro paragraphs, before `## ✨ Features`. | The section is the first thing a reader sees after the one-line pitch. |
| 6.2 | State the prerequisites as Docker with Compose only — no .NET SDK, no Node. | The step list contains no `dotnet`, no `npm`. |
| 6.3 | Five numbered steps: clone → `Copy-Item .env.example .env` → `docker compose up -d` → wait for `healthy` and open `http://localhost:8081` → create the account and sign in. | Each step is one command or one click; the ports match `docker-compose.yml` (`8081:80`) and the healthcheck added in Group 4. |
| 6.4 | Document first-run account creation: the **register page** behind the "Create an account" link on the login screen, which posts to the Identity `/register` endpoint. Note that registration is intentionally open because the instance serves one operator, and list the password policy. | The note mirrors D2 and answers roadmap Open Question 3 in prose. |
| 6.5 | Document the data location: the `printinghub-data` volume holds `/data/printinghub.db`; `docker compose down -v` deletes it. | The reset command is copy-pasteable. |
| 6.6 | Add a short troubleshooting block: port `8081` already in use (change the host side of `8081:80`), first boot is slower while SQLite migrations run (the API container reports `starting` then `healthy`), and `docker compose logs -f webapi` for diagnosis. | Each symptom maps to a cause and a fix. |
| 6.7 | Keep `docker compose up --build` documented as the path for forks and offline machines, explicitly marked as the slower option. | The fast path and the build path are never ambiguous. |
| 6.8 | Leave `## 🧑‍💻 Development scripts`, `## 🔄 CI/CD` and `## 📝 License` untouched apart from cross-references. | `git diff -- README.md` shows no port or script contradiction with `scripts/*.ps1` (Phase 1). |
| 6.9 | Fix the stray empty bullet (`- ` on its own line) left in the Features list. | `Select-String -Path README.md -Pattern '^- $'` returns nothing. |

---

## Task Group 7 — Make the published image exist for the quickstart platform (D1)

| # | Task | Verify |
|---|---|---|
| 7.1 | `.github/workflows/build-publish.yml`: change `platforms: linux/arm64` to `platforms: linux/amd64,linux/arm64` on the **API** build step (currently line 40). | `Select-String -Path .github/workflows/build-publish.yml -Pattern 'platforms:'` → both lines read `linux/amd64,linux/arm64`. |
| 7.2 | Make the same change on the **frontend** build step (currently line 50). | Same command shows two identical values. |
| 7.3 | Change nothing else in the workflow: no test steps, no trigger, no tag rename. | `git diff --stat -- .github/workflows/build-publish.yml` → 1 file, 2 insertions / 2 deletions. |
| 7.4 | Record in `requirement.md` why a publishing change lives in this phase (it is what makes the README's promise true) and that Phase 4 still owns CI gating. | `requirement.md` D1 cites it; this plan's intro does too. |
| 7.5 | Optional local proof of concept, only if Docker and buildx are available: build the API image for amd64 explicitly. | `docker buildx build --platform linux/amd64 --file Dockerfile.api --tag printinghub-api-amd64:local .` succeeds. |

> The workflow only runs on a push to `main`, so this file cannot be executed from the branch. `validation.md` marks
> it as verified by inspection (+7.5 if the machine allows), which is the honest limit of what a branch can prove.

---

## Task Group 8 — Traceability

| # | Task | Verify |
|---|---|---|
| 8.1 | `specs/tech-stack.md` Gap Register: the *"No structured logging and no health endpoint"* row keeps only the logging half (health ships here, liveness-only, with readiness deferred to Phase 13). | The row no longer claims there is no health endpoint. |
| 8.2 | Add a Gap Register row: *"Identity routes (`/login`, `/register`, `/manage/*`) are mapped at the API root while nginx only proxied `/api`, so containerised sign-in returned the SPA"* → **Resolved** (2026-09-16) with the nginx fix named. | Row present and marked resolved; severity column reads `Resolved`. |
| 8.3 | Add a Gap Register row: *"Images were published for `linux/arm64` only, so `docker compose up` could not pull them on amd64 hosts"* → **Resolved** (2026-09-16) with the platform matrix named. | Same. |
| 8.4 | `specs/tech-stack.md` Ops section: mention the shipped `healthcheck` blocks and the `/health` endpoint, so the stack description matches reality. | The Ops bullets list the health endpoint and the compose probes. |
| 8.5 | `specs/tech-stack.md` Dependency decisions: no row is added — D8 added no dependency — but the table's "none yet" wording is left intact only if it remains true. | `git diff` of the table is empty. |
| 8.6 | `specs/roadmap.md`: answer Open Question 3 with D2's decision (registration stays open; there is now a register page), leaving the phase/acceptance wording and the no-status-markers convention untouched. | The Open Question paragraph reads as answered; `git diff -- specs/roadmap.md` touches only that item. |
| 8.7 | `CHANGELOG.md`: add the entries with the `changelog` skill **after** the owner-declared commits exist, appending to the existing `2026-09-16` group. | A new bullet per implementation subject, each with a short SHA. |

---

## Sequencing and commit plan

1. Group 1 → `docs: spec phase 2 five-minute quickstart` (spec files only)
2. Group 2 → `feat: add a liveness health endpoint`
3. Groups 3-4 → `feat: proxy the identity routes and gate compose on health`
4. Group 5 → `feat: first-run registration page`
5. Groups 6-7 → `docs: five-minute quickstart on prebuilt images`
6. Group 8 → `docs: record phase 2 evidence and close the gaps`

Group 8.7 runs last, because the changelog records SHAs. Per `mission.md` §"Working agreement", this section is a
**proposal**: no commit is created unless the owner asks for it explicitly and per change.

## Boundaries

- **No** domain/entity, DTO, validator, service, controller or migration changes; the only API file touched is
  `Program.cs` (two lines plus a comment).
- **No** new NuGet or npm dependency, and therefore no addition to the dependency-decision table.
- **No** Dockerfile changes: the probe tools come from the existing base images (D5).
- **No** changes to `src/environments/*`, `Dockerfile.frontend`, `scripts/*.ps1`, `app.spec.ts`, `Dockerfile.api` or
  the domain feature pages.
- **No** route or nav changes beyond the public `register` route and the login page's link.
- The `.env` on this machine stays user-owned local state: read by nobody, modified by nobody, still ignored.