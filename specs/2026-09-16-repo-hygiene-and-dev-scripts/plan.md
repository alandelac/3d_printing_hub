# Plan — Repo hygiene & developer scripts

Roadmap Phase 0 (remainder) + Phase 1, as one change on branch `phase-1-repo-hygiene-dev-scripts`.
Scope, decisions and rationale live in `requirement.md` (D1-D8); proof of success lives in `validation.md`.

Each group ends in a state where the repository builds and the scripts still work, so the branch can be
reviewed group by group. **Do the groups in order** — Group 5 (tracking) only makes sense after Groups 2-4.

---

## Task Group 1 — Environment template (`.env.example`)

| # | Task | Verify |
|---|---|---|
| 1.1 | Create `.env.example` at the repository root using the content below. Placeholder values only — no real key, no personal path. | `Test-Path .env.example` → `True`; the file contains no key-looking string. |
| 1.2 | Confirm each documented key has a consumer (D2): `ConnectionStrings__DefaultConnection` → `Program.cs:15`; `AllowedOrigin` → `Program.cs:38`; `FRONTEND_URL`, `ASPNETCORE_ENVIRONMENT`, `ASPNETCORE_URLS` → `docker-compose.yml:11-13`. | Grep each name in `src/**/*.cs` and `docker-compose.yml`. |
| 1.3 | Confirm `.env` itself is **not** created, copied over or modified by this task. | `git check-ignore -v .env` still reports `.gitignore:7`. |

**Content to write** (D8: double-underscore separators; D2: nothing stale):

```dotenv
# 3D Printing Hub — environment template
#
# Copy this file to `.env` and adjust the values:
#     Copy-Item .env.example .env        # PowerShell
#     cp .env.example .env               # POSIX shells
#
# `.env` is git-ignored and must never be committed. Only keys that the
# application or docker-compose.yml actually read are listed here.

# --- Local development (dotnet run / npm start) ---------------------------

# SQLite connection string used by the API (Program.cs -> GetConnectionString).
# Default in src/3DPrintingHub.Api/appsettings.json: "Data Source=printinghub.db"
ConnectionStrings__DefaultConnection=Data Source=printinghub.db

# Origins allowed by the API CORS policy "AllowFrontend".
# Only relevant when the Angular dev server on http://localhost:4200 calls the
# API directly; under docker compose the browser is same-origin via nginx.
AllowedOrigin=http://localhost:4200

# --- Docker Compose (docker compose up) ----------------------------------

# Public origin of the containerised frontend; feeds AllowedOrigin in
# docker-compose.yml. The frontend is published on host port 8081 behind nginx.
FRONTEND_URL=http://localhost

# Hosting settings the API container relies on.
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

> Implementation note: `FRONTEND_URL` keeps the compose default (`http://localhost`) so that copying the
> template cannot change runtime behaviour. Requests from the published frontend arrive at `/api` through nginx
> on the same origin, so they are not subject to CORS.

---

## Task Group 2 — `.gitignore` hygiene

| # | Task | Verify |
|---|---|---|
| 2.1 | Delete the corrupted tail block: the NUL-byte lines and the two duplicated `context.tar` lines (currently ~486-490). | `Select-String -Path .gitignore -Pattern "`0"` matches **5** lines before the change and **0** after. |
| 2.2 | Delete the accidental exclusions `scripts/update-db.ps1` and `scripts/run-program.ps1` (currently lines 491-492) — this is what makes Group 5 possible. | `git check-ignore -v scripts/update-db.ps1` → no output. |
| 2.3 | Delete the stray bare `.db` entry (line 9). Keep `*.db`. | `git check-ignore -v src/3DPrintingHub.Api/printinghub.db` still reports `.gitignore:496:*.db`. |
| 2.4 | Leave untouched, deliberately: `.env` (line 7), `/src/3DPrintingHub.Api/appsettings.Development.json`, the `*.db-wal` / `*.db-shm` / `/src/3DPrintingHub.Api/printinghub.db` rules, and the standard `dotnet new gitignore` content. | `git diff .gitignore` shows removals only, in the two blocks named above. |

**Must remain true after this group:** `git status --short` lists no `.db`, no `.db-wal`, no `.db-shm` and no
`appsettings.Development.json`.

---

## Task Group 3 — `scripts/update-db.ps1` rewritten for SQLite

| # | Task | Verify |
|---|---|---|
| 3.1 | Replace the single-line Postgres command with the script below (D1, D7). No PostgreSQL-era connection string and no hard-coded password may survive anywhere in `scripts/`. | `git grep -n -E '5432\|supersecretpassword' -- scripts` → no matches. |
| 3.2 | Resolve the repo root from `$PSScriptRoot` and target the API and Infrastructure **project files** explicitly, so the script is working-directory independent. | Run it once from the repo root and once from `$env:TEMP`. |
| 3.3 | Fail loudly: throw when either project folder is missing, and throw when `dotnet ef` returns a non-zero exit code. | Temporarily rename a project folder and confirm a clear message instead of a silent success. |
| 3.4 | Keep the SQLite target at `src/3DPrintingHub.Api/printinghub.db`, the path the existing ignore rule already protects. | Compare with `Select-String -Path .gitignore -Pattern 'printinghub.db'`. |

**Content to write:**

```powershell
# update-db.ps1
<#
.SYNOPSIS
    Applies the EF Core migrations to the local SQLite database.

.DESCRIPTION
    Runs `dotnet ef database update` against the SQLite database used by the API
    (src/3DPrintingHub.Api/printinghub.db). The connection string is resolved from
    the repository root, so the script behaves identically no matter which
    directory it is invoked from.

    The API already applies migrations on boot; this script exists to author and
    apply new migrations during development, and to inspect the SQLite file.

.EXAMPLE
    ./scripts/update-db.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot     = Split-Path -Parent $PSScriptRoot
$apiFolder    = Join-Path $repoRoot 'src/3DPrintingHub.Api'
$infraFolder  = Join-Path $repoRoot 'src/3DPrintingHub.Infrastructure'
$apiProject   = Join-Path $apiFolder '3DPrintingHub.Api.csproj'
$infraProject = Join-Path $infraFolder '3DPrintingHub.Infrastructure.csproj'
$databasePath = Join-Path $apiFolder 'printinghub.db'

foreach ($folder in @($apiFolder, $infraFolder)) {
    if (-not (Test-Path -LiteralPath $folder -PathType Container)) {
        throw "Project folder not found: $folder"
    }
}

Write-Host "Applying migrations to SQLite database: $databasePath" -ForegroundColor Cyan

dotnet ef database update `
    --project $infraProject `
    --startup-project $apiProject `
    --connection "Data Source=$databasePath"

if ($LASTEXITCODE -ne 0) {
    throw "dotnet ef database update failed with exit code $LASTEXITCODE."
}

Write-Host 'Migrations applied. API -> http://localhost:5033' -ForegroundColor Green
```

---

## Task Group 4 — Developer script consistency

| # | Task | Verify |
|---|---|---|
| 4.1 | Fix `scripts/run-front.ps1`: the current `npm start src/3DPrintingHub.Client` passes a path to a script that takes none. Resolve the client folder, change into it, then run `npm start` (D7). | Script content uses `Set-Location -LiteralPath` + bare `npm start`. |
| 4.2 | Align `scripts/run-program.ps1` with the same conventions (`$PSScriptRoot`, `-LiteralPath`, exit-code check) instead of the bare one-liner. | File matches the same shape as `run-front.ps1`. |
| 4.3 | Both scripts state the real ports on stdout, matching `run-all.ps1`: API `5033`, client `4200`. | Output of `./scripts/run-program.ps1` shows `http://localhost:5033`. |
| 4.4 | Cross-check the ports against `src/3DPrintingHub.Api/Properties/launchSettings.json` (`5033`), `docker-compose.yml` (`8081:80`, internal `8080`) and `README.md` where mentioned. | No script prints a port that contradicts launch settings or compose. |
| 4.5 | **No change** to `scripts/run-all.ps1` — it is already correct and is the reference for style. | `git diff -- scripts/run-all.ps1` is empty. |

**Content to write — `run-front.ps1`:**

```powershell
# run-front.ps1
<#
.SYNOPSIS
    Starts the Angular client for local development.

.DESCRIPTION
    Changes into src/3DPrintingHub.Client and runs `npm start` (ng serve). The
    development server listens on http://localhost:4200.

.EXAMPLE
    ./scripts/run-front.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot      = Split-Path -Parent $PSScriptRoot
$clientProject = Join-Path $repoRoot 'src/3DPrintingHub.Client'

if (-not (Test-Path -LiteralPath $clientProject -PathType Container)) {
    throw "Project folder not found: $clientProject"
}

Write-Host 'Client -> http://localhost:4200' -ForegroundColor Green

Set-Location -LiteralPath $clientProject
npm start
```

**Content to write — `run-program.ps1`:**

```powershell
# run-program.ps1
<#
.SYNOPSIS
    Starts the .NET API for local development.

.DESCRIPTION
    Runs `dotnet run` for src/3DPrintingHub.Api, which listens on
    http://localhost:5033 (see Properties/launchSettings.json).

.EXAMPLE
    ./scripts/run-program.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$apiProject = Join-Path $repoRoot 'src/3DPrintingHub.Api'

if (-not (Test-Path -LiteralPath $apiProject -PathType Container)) {
    throw "Project folder not found: $apiProject"
}

Write-Host 'API -> http://localhost:5033' -ForegroundColor Green

dotnet run --project $apiProject
```

---

## Task Group 5 — Track the scripts in git

Depends on Group 2 (the ignore rules must be gone first).

| # | Task | Verify |
|---|---|---|
| 5.1 | Stage the previously ignored files so all four scripts are tracked: `git add scripts/update-db.ps1 scripts/run-program.ps1`. | `git status --short` shows them as `A` (added), not silently absent. |
| 5.2 | Confirm nothing unintended is now stageable: check that `.env`, `*.db`, `*.db-wal`, `*.db-shm` and `appsettings.Development.json` are still ignored. | `git status --short` output contains none of those paths. |
| 5.3 | Confirm the four-script inventory is complete. | `git ls-files scripts` → `run-all.ps1`, `run-front.ps1`, `run-program.ps1`, `update-db.ps1`. |

---

## Task Group 6 — Traceability and documentation

| # | Task | Verify |
|---|---|---|
| 6.1 | Update `specs/tech-stack.md` Gap Register: correct the `.env` row (it was never committed — see D5), and mark the `scripts/update-db.ps1` Postgres row as resolved. | Rows no longer claim something false; the Postgres row is removed or annotated as done. |
| 6.2 | Update `specs/roadmap.md` only if the owner wants a status convention added; by default **leave it untouched** and rely on `validation.md` for evidence. | `git diff -- specs/roadmap.md` empty unless explicitly requested. |
| 6.3 | Optional: a short "Development scripts" note in `README.md` listing the four scripts and the real ports (`5033` / `4200`). Keep it to the script table; the full Getting-started walkthrough stays a Phase 2 deliverable. | If added, `README.md` mentions all four scripts and both ports. |
| 6.4 | Add the changelog entry with the `changelog` skill once the implementation commits exist, appending to the existing `2026-09-16` group. | `CHANGELOG.md` has a new bullet with the short SHA. |

---

## Task Group 7 — *(optional, gated on decision D6)* Remove the dead solution reference

| # | Task | Verify |
|---|---|---|
| 7.1 | Only if D6 resolves to "remove": delete the `3DPrintingHub.DataMigration` project entry from `src/3DPrintingHub.slnx`. | `dotnet build src/3DPrintingHub.slnx` no longer fails with MSB3202. |
| 7.2 | If instead the project is to be restored, do **not** touch the `.slnx` here — open a follow-up spec and record the breakage in `requirement.md` §2 as a known blocker for Phases 3-4. | `requirement.md` carries the finding either way. |

---

## Sequencing and commit plan

1. Groups 1-2 → `chore: env template and gitignore hygiene`
2. Groups 3-4 → `fix: developer scripts on SQLite and the real ports`
3. Group 5 → `chore: track the developer scripts`
4. Group 6 (and 7 if chosen) → `docs: close phase 0 and 1 gaps in the register`

Group 6.4 runs after the implementation commits exist, because the changelog records SHAs.

## Boundaries

- No application code (`.cs`, `.ts`, templates, styles) changes.
- No route, nav or UI changes, so no client rebuild is required beyond the smoke test in `validation.md`.
- No new dependency, so nothing is added to the `tech-stack.md` dependency-decision table.
- `.env` on this machine is read by nobody after this change (no code consumes its keys) but is **not** deleted;
  it is user-owned local state.
