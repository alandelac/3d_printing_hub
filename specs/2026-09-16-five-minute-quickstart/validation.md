# Validation — Five-minute quickstart

How to know the implementation succeeded and this branch can be merged.
Run every command from the repository root unless stated otherwise.
`<user>` and `<password>` below are placeholders for the operator's own values; the password must satisfy the
Identity policy (min 6 chars with a digit, a lowercase, an uppercase and a non-alphanumeric character).

---

## 1. Acceptance, mapped to the roadmap's own words

| Roadmap deliverable / acceptance (quoted) | Covered by |
|---|---|
| *"README 'Getting started': clone → copy `.env.example` to `.env` → `docker compose up` → open `http://localhost:8081`."* | V9, V11, V13 |
| *"Note explaining first-run account creation via the Identity `/register` route."* | V8, V11 |
| *"A health endpoint the compose file can use for readiness."* | V1, V2, V3, V4, V10 |
| *"Following only the README on a clean machine yields a usable, logged-in instance in under 5 minutes."* | V8, V9, V12 |

V1-V4 and V8-V13 must pass. V5-V7 (identity routing through nginx) are required for V8-V9 to be meaningful at all:
without them the login page receives `index.html` instead of a token, which is exactly the defect this phase fixes.

> **Environment precondition:** V3-V6 and V8-V10, V13 need the Docker daemon. On this machine it was **not
> running** while the spec was written (`Docker Compose version v5.3.1`, daemon pipe absent). Start Docker Desktop
> first; if it is unavailable, record which checks were skipped rather than marking them passed.

---

## 2. Checks

### V1 — `/health` answers locally (Phase 2 deliverable 3)

```powershell
./scripts/run-program.ps1      # in a second terminal, from the repository root
curl.exe -i http://localhost:5033/health
```

**Expected:** `HTTP/1.1 200 OK`, a body of `Healthy`, and **no** `Location:` header. A `307` would mean
`UseHttpsRedirection` is redirecting in a plain-HTTP context.

### V2 — The health endpoint is anonymous and additive

```powershell
curl.exe -i http://localhost:5033/health                      # no Authorization header
curl.exe -i -X POST http://localhost:5033/login -H "Content-Type: application/json" -d "{\"email\":\"nobody@example.com\",\"password\":\"wrong\"}"
```

**Expected:** `/health` → `200`; the bad `POST /login` → `401` (unchanged). A `401` on `/health` would mean it was
registered behind authorization.

### V3 — Compose declares the probes and the dependency gate

```powershell
docker compose config | Select-String -Pattern 'healthcheck|condition|/dev/tcp|wget|start_period'
docker compose config --quiet
```

**Expected:** `docker compose config --quiet` exits 0 and the printed plan contains

- `webapi.healthcheck.test` → `bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080'` with `start_period: 30s`;
- `frontend.healthcheck.test` → `wget -q --spider http://localhost/`;
- `frontend.depends_on.webapi.condition: service_healthy` (not the bare list form).

### V4 — nginx configuration is syntactically valid

```powershell
docker compose build frontend
docker compose run --rm --no-deps frontend nginx -t
```

**Expected:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`.

### V5 — The Identity surface is proxied, not swallowed by the SPA (the fixed defect)

```powershell
docker compose up -d
# bad credentials: proves the API, not the SPA, answered
curl.exe -i -X POST http://localhost:8081/login -H "Content-Type: application/json" -d "{\"email\":\"nobody@example.com\",\"password\":\"wrong\"}"
```

**Expected:** `HTTP/1.1 401` with a JSON or empty body and **not** `text/html` / `<!doctype html>`. Before this
branch the same request returned `200` plus the Angular `index.html`, because `location /` matched it first.

### V6 — Deep links and refreshes still reach the SPA

```powershell
curl.exe -s -o $null -w "%{http_code} %{content_type}`n" http://localhost:8081/
curl.exe -s -o $null -w "%{http_code} %{content_type}`n" http://localhost:8081/login
curl.exe -s -o $null -w "%{http_code} %{content_type}`n" http://localhost:8081/register
curl.exe -s -o $null -w "%{http_code} %{content_type}`n" http://localhost:8081/dashboard
curl.exe -s -o $null -w "%{http_code} %{content_type}`n" http://localhost:8081/definitely-not-a-route
```

**Expected:** every line reports `200 text/html`. `/login` and `/register` are the interesting ones: nginx proxies
those prefixes to the API, and the API answers `405` for `GET`, which the location converts back into `index.html`.

### V7 — Client routes do not collide with the proxied Identity paths

```powershell
git grep -n 'path:' -- src/3DPrintingHub.Client/src/app/app.routes.ts
```

**Expected:** `login`, `register`, `dashboard`, `filaments`, `models`, `settings`, `stocked` and `''` only. The
`login`/`register` overlap is intentional and is what V5/V6 exercise.

### V8 — Registration and sign-in end to end (Phase 2 deliverable 2)

Through the **browser** on `http://localhost:8081` (this is the acceptance path, not a `curl` substitute):

1. Open `http://localhost:8081` → the app redirects to the login screen.
2. Follow "Create an account" → the register page renders.
3. Enter `<user>` / `<password>` (+ confirmation) → submit.
4. Expect to land on `/dashboard` **already signed in**.

Then prove the same flow at the HTTP level:

```powershell
curl.exe -i -X POST http://localhost:8081/register -H "Content-Type: application/json" -d "{\"email\":\"<user>\",\"password\":\"<password>\"}"
curl.exe -i -X POST http://localhost:8081/login    -H "Content-Type: application/json" -d "{\"email\":\"<user>\",\"password\":\"<password>\"}"
```

**Expected:** `POST /register` → `200`; `POST /login` → `200` with a JSON body containing `accessToken`,
`refreshToken` and `tokenType` (`Bearer`). A page of HTML here means V5 regressed.
A **repeat** registration of the same email must return `400` with Identity's `ProblemDetails.errors`, and the
register page must display the server's message (Task 5.5).

### V9 — The five-minute claim, measured (acceptance)

```powershell
docker compose down -v          # cold volume: no database, no cached container state
$start = Get-Date
docker compose up -d            # pulls ghcr.io images for this platform
docker compose ps               # wait until BOTH services report (healthy)
# browser: open http://localhost:8081, register, sign in
$elapsed = (Get-Date) - $start
$elapsed.TotalMinutes
```

**Expected:** both containers report `Up ... (healthy)`; the elapsed time from `up -d` to a signed-in dashboard is
**under 5 minutes** on a normal connection. Paste the actual number as evidence — if it exceeds 5 minutes on first
pull (image download dominates), say so explicitly and record the same measurement on a warm cache separately
rather than reporting only the flattering one.

### V10 — Health is reported, and `start_period` is not too tight

```powershell
docker compose ps --format 'table {{.Name}}\t{{.Status}}'
docker inspect --format '{{json .State.Health}}' 3dprintinghub-api | ConvertFrom-Json
```

**Expected:** `3dprintinghub-api` and `3dprintinghub-frontend` both `(healthy)`; the API's health log shows
`FailingStreak: 0`. If the first probe sequence fails while migrations run, `start_period` in
`docker-compose.yml` is too short and must be raised **in this branch** (`requirement.md` §6 records this as data,
not taste).

### V11 — The README works on its own (acceptance precondition)

Read `README.md` and answer mechanically:

```powershell
Select-String -Path README.md -Pattern 'Getting started|docker compose up|localhost:8081|Create an account|\.env\.example|down -v|8081:80|logs -f'
Select-String -Path README.md -Pattern 'dotnet run|npm start|dotnet ef'      # must not appear in Getting started
```

**Expected:** the walkthrough names the clone step, `.env.example` → `.env`, `docker compose up`, `8081`, the
account-creation step and the reset command; the troubleshooting block covers a busy `8081` and the first-boot
delay. The second command's matches, if any, live in the *Development scripts* section, **not** in *Getting
started*.

### V12 — The client still builds, with the register page included

```powershell
cd src/3DPrintingHub.Client
npm ci
npm run build
Select-String -Path dist/frontend-app/browser/*.js -Pattern 'Create an account' -List
```

**Expected:** `npm run build` succeeds (production configuration, which is what `Dockerfile.frontend` uses) and the
bundle contains the register copy, proving the new page is reachable in the shipped artefact.

### V13 — Data survives a restart (the volume is real)

```powershell
docker compose restart
curl.exe -i -X POST http://localhost:8081/login -H "Content-Type: application/json" -d "{\"email\":\"<user>\",\"password\":\"<password>\"}"
docker compose exec webapi ls -l /data
```

**Expected:** the same credentials still return `200` after the restart, and `/data/printinghub.db` is present and
non-empty. A `401` here means the database was recreated empty.

### V14 — The published images will exist for amd64 (D1, verified by inspection)

```powershell
Select-String -Path .github/workflows/build-publish.yml -Pattern 'platforms:|file:|tags:'
git diff --stat -- .github/workflows/build-publish.yml
```

**Expected:** both build steps read `platforms: linux/amd64,linux/arm64`; the diff is **2 insertions / 2
deletions** in that one file, with no change to triggers, tags or job structure. The workflow only runs on a push to
`main`, so "the amd64 manifest really appears in `ghcr.io`" stays unprovable from this branch and is recorded in §7.

Optional local proof, if Docker Desktop and buildx are available:

```powershell
docker buildx build --platform linux/amd64 --file Dockerfile.api -t printinghub-api-amd64:local .
```

---

## 3. Regression checks

| # | Check | Command | Expected |
|---|---|---|---|
| R1 | The solution still builds. | `dotnet build src/3DPrintingHub.slnx` | `0 Advertencia(s)` / `0 Errores` in Debug **and** Release. |
| R2 | The client test baseline is unchanged. | `npm test` in `src/3DPrintingHub.Client`; `git diff main..HEAD -- src/3DPrintingHub.Client/src/app/app.spec.ts` | Still exactly 1 failing assertion (`should render title`), and an **empty** diff for `app.spec.ts` — the failure predates this branch (Gap Register) and is Phase 3's to fix. |
| R3 | Local development still works. | `./scripts/run-all.ps1`, then `curl.exe -i http://localhost:5033/health` and `http://localhost:4200` in a browser | API `200` on `/health`; the Angular dev server renders and can sign in against `http://localhost:5033` (dev CORS path untouched — `src/environments/environment.ts` is not modified). |
| R4 | The change stayed inside the phase's boundaries. | `git diff main..HEAD --stat` | Only `README.md`, `nginx.conf`, `docker-compose.yml`, `.github/workflows/build-publish.yml`, `src/3DPrintingHub.Api/Program.cs`, `src/3DPrintingHub.Client/src/app/{app.routes.ts,core/auth/auth.service.ts,features/auth/pages/*}`, the four spec files, plus the `specs/*.md` traceability edits. **No** entity, DTO, validator, service, controller, migration, Dockerfile, `src/environments/*`, `scripts/*.ps1` or `app.spec.ts`. |
| R5 | Phase 0/1 invariants hold. | `git check-ignore -v .env`; `git ls-files | Select-String -Pattern '\.env$|\.db$'`; `git status --short` | `.env` still matched by `.gitignore`; no `.env` and no `*.db` tracked; nothing new staged that Phase 0 deliberately excluded. |
| R6 | No dependency was added. | `git diff main..HEAD -- src/3DPrintingHub.Api/3DPrintingHub.Api.csproj src/3DPrintingHub.Client/package.json` | Empty. |

---

## 4. Evidence log

Fill this in as the checks run; a row is not evidence until its actual output is pasted.

| # | Result | Evidence (output / number) |
|---|---|---|
| V1 | | |
| V2 | | |
| V3 | | |
| V4 | | |
| V5 | | |
| V6 | | |
| V7 | | |
| V8 | | |
| V9 | | elapsed minutes from cold volume to signed-in dashboard |
| V10 | | |
| V11 | | |
| V12 | | |
| V13 | | |
| V14 | | |
| R1 | | |
| R2 | | |
| R3 | | |
| R4 | | |
| R5 | | |
| R6 | | |

---

## 5. Merge checklist

- [ ] V1-V14 pass, or the skipped ones are listed with the reason (for example "Docker daemon unavailable").
- [ ] V5 was run before and after in the same session where possible, so the fix is demonstrated, not just claimed.
- [ ] V9's measured minute count is recorded, warm or cold, without rounding in the phase's favour.
- [ ] R1-R6 pass; `git diff --stat` matches the boundary list in R4 with no stray file.
- [ ] `README.md`'s walkthrough was followed literally, in order, without consulting any other file.
- [ ] `specs/tech-stack.md` no longer claims there is no health endpoint, and carries the two new resolved rows.
- [ ] `specs/roadmap.md` Open Question 3 reads as answered; phase text and acceptance lines are untouched.
- [ ] `CHANGELOG.md` has an entry per implementation commit, produced with the `changelog` skill **after** the
      owner-declared commits exist.
- [ ] No commit was created by the assistant; the owner declared each one (`mission.md` §"Working agreement").

---

## 6. Rollback

- **Code:** every change is additive or configuration-only. `git revert` of the merge commit restores the previous
  state with no data consequence: `nginx.conf`, `docker-compose.yml` and `build-publish.yml` are declarative, and
  `Program.cs` gains an endpoint nothing else depends on.
- **Runtime:** `docker compose down` stops the stack; `docker compose down -v` additionally deletes
  `printinghub-data`. **The volume holds the operator's only copy of the database** — it is a deliberate reset, not
  a repair step, and the README says so.
- **Client:** the register page is self-contained; reverting it removes a route and a link, with no effect on the
  login flow other than the disappearance of the link.
- **Publishing:** the workflow change only adds a platform to an existing manifest list; reverting it restores the
  arm64-only behaviour that blocks the amd64 quickstart.

---

## 7. Explicitly not validated here

- **That `ghcr.io` really serves an amd64 manifest.** The workflow runs on push to `main`; V14 proves the file, not
  the registry. Re-check after the merge with
  `docker buildx imagetools inspect ghcr.io/alandelac/3d_printing_hub_api:latest`.
- **CI gating of the publish jobs.** Phase 4 adds `dotnet test` / `npm test` as gates; this branch deliberately
  leaves the workflow free of test steps (Group 7.3).
- **Automated API tests.** No backend test project exists (Gap Register); V1-V2 are manual `curl` checks, and
  Phase 3 is where they become assertions.
- **Deep readiness.** `/health` is liveness only (D3). It does **not** prove SQLite is readable; a database that
  fails to open makes migrations throw at boot instead. Readiness is Phase 13.
- **Browser automation.** There is no Playwright/e2e runner in the client (Vitest + jsdom only), so V8's browser
  half is a documented manual step with a screenshot or pasted response as evidence.
- **Non-`localhost` deployment.** HTTPS termination, a real domain, `FRONTEND_URL` pointing elsewhere and reverse
  proxies other than the shipped nginx are out of scope; `AllowedOrigin` keeps its Phase 1 semantics.
- **Platforms other than the machine's.** V9 measures the host's architecture; the other half of V14's matrix is
  only proven once CI publishes and a machine of that architecture pulls it.
- **`/manage/*` behaviour beyond proxy reachability.** The paths are proxied for completeness; no UI uses them and
  no check exercises authenticated `2fa`/`info` calls.
- **Running the checks at all while Docker is stopped.** The daemon was unavailable when this spec was written, so
  §4's rows stay empty until it is started; an empty evidence table is an unfinished validation, not a pass.