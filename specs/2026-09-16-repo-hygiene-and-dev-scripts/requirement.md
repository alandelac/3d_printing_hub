# Requirement — Repo hygiene & developer scripts

| Field | Value |
|---|---|
| **Roadmap phases** | Phase 0 (*Purge secrets and repo hygiene*) — remainder, plus Phase 1 (*Fix the developer scripts*) |
| **Branch** | `phase-1-repo-hygiene-dev-scripts` |
| **Spec directory** | `specs/2026-09-16-repo-hygiene-and-dev-scripts/` |
| **Date opened** | 2026-09-16 |
| **Status** | Spec agreed — implementation not started |
| **Depends on** | Nothing |
| **Blocks** | Phase 2 (quickstart), Phase 3 (test foundation), Phase 4 (CI gates) — all assume a buildable, honestly-documented repository |

---

## 1. Objective

Make the repository truthful about how it is configured and how it is run locally: a documented environment
template that exists, an ignore file that is not corrupted, and developer scripts that speak **SQLite + the real
ports** instead of the retired PostgreSQL era.

Two roadmap phases are deliberately merged here. Phase 0 is *almost* finished — every deliverable except
`.env.example` is already true on `main` (see §3) — and Phase 1's three script defects are the same class of
problem: stale leftovers that mislead the next person. One spec, one branch, one review.

---

## 2. Why this is the next phase (audit evidence)

The roadmap says the next feature spec is the lowest-numbered phase that is not done. Verified on `main` at
`e8a5895`:

### Phase 0 — `git log --all -- .env` returns **nothing**

- `.env` exists on disk but has **never been committed**: `git check-ignore -v .env` →
  `.gitignore:7:.env`. The Gap Register row "`.env` committed with a live `OPENROUTERKEY`" is therefore
  **stale** and needs correcting.
- No `*.db` path is tracked: `git ls-files` returns 218 entries and **zero** of them match `\.env` or `\.db`
  (`git ls-files | Select-String -Pattern '\\.env|\\.db'` → empty).
- `.gitignore` already covers `.env` (line 7), `*.db` (line 496), `*.db-wal` and `*.db-shm` (lines 493-494).
- **Missing deliverable:** `.env.example` does not exist (`Test-Path .env.example` → `False`). Because the
  Phase 0 acceptance line reads "a fresh clone contains only `.env.example`", Phase 0 cannot be closed until the
  template exists.

### Phase 1 — the Postgres fossil is still in place

- `scripts/update-db.ps1` is a single line passing
  `Host=localhost;Port=5432;Database=printinghub;Username=postgres;Password=supersecretpassword`. The app has
  been SQLite since `77d4cac`, so this script cannot work.
- **Both `scripts/update-db.ps1` and `scripts/run-program.ps1` are themselves git-ignored**
  (`git check-ignore -v` → `.gitignore:491` and `.gitignore:492`). Fixing them without un-ignoring them would
  produce work that never lands: `git ls-files scripts` currently lists only `run-all.ps1` and `run-front.ps1`.
- `scripts/run-front.ps1` is broken in a second way: `npm start src/3DPrintingHub.Client` passes a path to a
  script that takes no arguments and must be executed from the client directory.
- `scripts/run-all.ps1` is already correct (prints `API -> http://localhost:5033`,
  `Client -> http://localhost:4200`) and is the house style for all script work here.

### Root cause of the ignore-file damage

`.gitignore` lines ~486-492 are corrupted: raw NUL bytes and two doubled `c o n t e x t . t a r` lines sit
directly above the two accidental `scripts/*.ps1` exclusions. A garbled write is the likely origin. Cleaning
those lines is in scope because the accidental exclusions are part of the same block.

### Findings that belong to other phases (recorded, not fixed here)

- `src/3DPrintingHub.slnx` line 6 references `3DPrintingHub.DataMigration/3DPrintingHub.DataMigration.csproj`,
  which **does not exist** on disk. Solution-wide `dotnet build` / `dotnet test` therefore fail, blocking
  Phase 3's "`dotnet test` runs green from a clean checkout" and Phase 4's CI gates. See decision D6.
- `src/3DPrintingHub.Api/printinghub.db` exists locally, matching the deliberate
  `/src/3DPrintingHub.Api/printinghub.db` ignore rule — it must stay ignored.

---

## 3. Scope

### In scope

1. **`.env.example`** at the repository root, documenting every key the application and the compose file
   actually read, with placeholder values only.
2. **`.gitignore` hygiene:** remove the NUL-byte garbage, remove the accidental exclusions of
   `scripts/update-db.ps1` and `scripts/run-program.ps1`, drop the stray bare `.db` entry while keeping `*.db`,
   and keep `.env`, `*.db`, `*.db-wal`, `*.db-shm`.
3. **`scripts/update-db.ps1` rewritten for SQLite**, following `run-all.ps1`'s conventions.
4. **`scripts/run-front.ps1` fixed** and **`scripts/run-program.ps1` aligned**, both stating the real ports.
5. **All four scripts tracked by git.**
6. **Traceability:** the Gap Register rows this work closes updated in `tech-stack.md`; a CHANGELOG entry.

### Out of scope (explicitly deferred)

- README "Getting started" walkthrough and the health/readiness endpoint — Phase 2.
- The `dotnet` test project and client Vitest coverage — Phase 3.
- CI build/test gating of image publishing — Phase 4.
- Rotating the `OPENROUTERKEY` on the provider side: a manual, non-repository action (see D5).
- Restoring or deleting the `3DPrintingHub.DataMigration` project itself (see D6 — only the *reference* may be
  addressed, and only if decided).
- Any refactor of the application itself. No `.cs` or client `.ts` file changes are expected from this spec.

---

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | `update-db.ps1` passes an explicit, repo-root-resolved absolute SQLite path: `Data Source=<repoRoot>/src/3DPrintingHub.Api/printinghub.db`. | Deterministic regardless of the caller's working directory, and it points at the same file the existing ignore rule (`/src/3DPrintingHub.Api/printinghub.db`) already protects, so local dev and the script share one database. *Rejected alternative:* omit `--connection` and let `appsettings.json`'s `ConnectionStrings:DefaultConnection` (`Data Source=printinghub.db`) apply — that depends on implicit EF design-time host configuration resolution and on the working directory, which is exactly the class of fragility being fixed. |
| **D2** | `.env.example` documents only keys that something actually reads: `ConnectionStrings__DefaultConnection` (`Program.cs:15`), `AllowedOrigin` (`Program.cs:38`), `FRONTEND_URL` (`docker-compose.yml:13`), `ASPNETCORE_ENVIRONMENT` and `ASPNETCORE_URLS` (`docker-compose.yml:11-12`). | The roadmap requires documenting "every key the app reads" — not every key that ever existed. `OPENROUTERKEY` and `DB_PASSWORD` are referenced **nowhere** in code, compose, Dockerfiles or workflows, so listing them would preserve a lie. |
| **D3** | The local dev database stays ignored (`*.db`, `*.db-wal`, `*.db-shm`, `/src/3DPrintingHub.Api/printinghub.db`). | Roadmap Phase 0 asks for exactly this; it is machine state, not source. |
| **D4** | `/src/3DPrintingHub.Api/appsettings.Development.json` stays ignored. | Local override file; keeping it out of git is intended and it is unrelated to the corrupted block. |
| **D5** | No git-history rewrite and no code change for the key. The Gap Register wording is corrected and rotation is recommended as a manual operator action. | `git log --all -- .env` is empty, so nothing leaked through this repository's history; the residual risk is that the key was shared out-of-band. Rotation cannot be performed from inside the repo. |
| **D6** | **Open — needs owner decision.** The dead `3DPrintingHub.DataMigration` reference in `src/3DPrintingHub.slnx` is either removed now or left with the breakage documented. | Removing it makes solution-wide builds possible, clearing the way for Phase 3/4 acceptance. But if the project is meant to be restored, deleting the reference is churn. Task Group 6 is therefore marked optional and gated on this answer. |
| **D7** | All script work follows the existing `run-all.ps1` conventions: comment-based help, `$ErrorActionPreference = 'Stop'`, repo root resolved as `Split-Path -Parent $PSScriptRoot`, `-LiteralPath` on every path test. | Consistency with the one script in the repository that is already correct — the mission's "layers are not negotiable" applied to tooling. |
| **D8** | `.env.example` uses ASP.NET Core's double-underscore section separators. | Matches how `docker-compose.yml` already supplies `ConnectionStrings__DefaultConnection`; environment variables are the delivery mechanism for configuration (mission principle 3). |

---

## 5. Context

- **Stack:** .NET SDK `10.0.302`, `dotnet ef` `10.0.10`, EF Core with SQLite; Angular 22.1 with npm 11.16.
  Verified on the development machine while writing this spec.
- **Ports:** API `5033` (dev, `src/3DPrintingHub.Api/Properties/launchSettings.json`), client `4200`; published
  containers: frontend `8081` on the host, API `8080` internally.
- **Migrations** live in `src/3DPrintingHub.Infrastructure/Migrations`; the latest is
  `20260906042509_AddUniqueCatalogAndSettingsIndexes`. They are applied automatically at boot
  (`dbContext.Database.Migrate()` in `Program.cs`), which is why the script exists mainly to author and apply
  *new* migrations during development.
- **`nginx.conf`** proxies `/api` to `http://webapi:8080`; it is untouched by this spec.
- **Changelog:** `CHANGELOG.md` is date-grouped with a commit subject plus short SHA per bullet, generated with
  the `changelog` skill. This work appends to the existing `2026-09-16` group.
- **Roadmap has no status markers** — a phase is "complete when its Acceptance check passes". This spec
  therefore does not edit `roadmap.md`; it satisfies the acceptance lines and records evidence in
  `validation.md`.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| A relative SQLite path in `update-db.ps1` silently creates a second, empty database next to the caller's working directory. | D1: absolute, repo-root-resolved path; validation runs the script from `$env:TEMP` as well as the repo root. |
| Un-ignoring `scripts/update-db.ps1` accidentally commits something secret. | The files are short PowerShell scripts reviewed in the same diff; `.env` stays ignored and is explicitly re-checked during validation. |
| Documenting keys in `.env.example` that nothing reads re-creates today's confusion. | D2, plus a validation step that greps every documented key back to its consumer. |
| Touching `.gitignore` re-exposes `*.db` or `appsettings.Development.json`. | D3/D4 keep those rules intact; validation asserts `git status --short` stays clean afterwards. |
| Task Group 6's `slnx` edit could be judged out of scope. | It is optional and gated on D6. |

---

## 7. Done means

The roadmap's own acceptance sentences, quoted:

- Phase 0 — *"`git ls-files` shows no `.env` and no `*.db`; a fresh clone contains only `.env.example`."*
- Phase 1 — *"`./scripts/update-db.ps1` applies migrations against SQLite with no connection errors."*

`validation.md` turns both into reproducible commands and records the evidence.
