# Validation — Repo hygiene & developer scripts

How to know the implementation succeeded and this branch can be merged.
Run every command from the repository root unless stated otherwise.

---

## 1. Acceptance, mapped to the roadmap's own words

| Roadmap phase | Acceptance sentence (quoted) | Covered by |
|---|---|---|
| Phase 0 | *"`git ls-files` shows no `.env` and no `*.db`; a fresh clone contains only `.env.example`."* | V1, V2, V3, V4 |
| Phase 1 | *"`./scripts/update-db.ps1` applies migrations against SQLite with no connection errors."* | V5, V6, V7 |

Every item in §1 must pass. An item that passes "by accident" (for example because `.env` was never tracked)
still counts — the acceptance criterion is about the state of the repository, not about who changed what.

---

## 2. Checks

### V1 — No secrets or databases tracked (Phase 0 acceptance)

```powershell
git ls-files | Select-String -Pattern '\.env$|\.db$|\.db-wal$|\.db-shm$'
```

**Expected:** no output. In particular `.env`, `src/3DPrintingHub.Api/printinghub.db` and any `*.db` file are
absent, while `.env.example` **is** present (it must not match the `\.env$` pattern — check the filename, not a
substring).

```powershell
git ls-files | Select-String -Pattern '\.env'
```

**Expected:** exactly one line, `.env.example`.

### V2 — The template exists, is complete and contains no real values

```powershell
Test-Path .env.example
Select-String -Path .env.example -Pattern 'OPENROUTERKEY|DB_PASSWORD|sk-|Password='
```

**Expected:** `True`, then **no matches** — the stale Postgres-era keys and any credential-shaped value must be
absent (D2, D5).

### V3 — Every documented key has a consumer (no aspirational config)

```powershell
git grep -n 'GetConnectionString("DefaultConnection")' -- src/3DPrintingHub.Api/Program.cs
git grep -n 'AllowedOrigin' -- src/3DPrintingHub.Api/Program.cs docker-compose.yml
git grep -n -E 'FRONTEND_URL|ASPNETCORE_ENVIRONMENT|ASPNETCORE_URLS' -- docker-compose.yml
```

**Expected:** each command prints at least one match — `Program.cs:15`, `Program.cs:38` plus
`docker-compose.yml:13`, and `docker-compose.yml:11-12` respectively — matching the anchors recorded in
`requirement.md` D2. A documented key with no match means the template is lying and must be corrected.

### V4 — Local secrets stay ignored, and nothing else got exposed

```powershell
git check-ignore -v .env
git check-ignore -v src/3DPrintingHub.Api/printinghub.db
git status --short
```

**Expected:**
- `.env` → matched by `.gitignore:7` (the file is untouched and still not tracked).
- `printinghub.db` → matched by `.gitignore:487:*.db` (the line number moved because Group 2 removed nine lines).
- `git status --short` shows only the intended spec, `.env.example`, `.gitignore` and script changes. **No**
  `.db`, `.db-wal`, `.db-shm` or `appsettings.Development.json` entries.

### V5 — The migration script runs against SQLite (Phase 1 acceptance)

```powershell
./scripts/update-db.ps1
```

**Expected:**
- Prints `Applying migrations to SQLite database: <repo>\src\3DPrintingHub.Api\printinghub.db`.
- `dotnet ef` reports **"No migrations were applied. The database is up to date."** (or applies pending ones)
  and exits 0.
- **No** connection error, no mention of `Npgsql`, `5432`, `Host=`, `Username=postgres`, and no
  `supersecretpassword`.

```powershell
git grep -n -E '5432|supersecretpassword|Username=postgres' -- scripts
```

**Expected:** no output.

### V6 — The script is working-directory independent (D1)

```powershell
Push-Location $env:TEMP; & "$(git rev-parse --show-toplevel)\scripts\update-db.ps1"; Pop-Location
```

**Expected:** identical output to V5, and no new `printinghub.db` appears in `$env:TEMP`:

```powershell
Test-Path (Join-Path $env:TEMP 'printinghub.db')
```

**Expected:** `False` — a stray database next to the caller's working directory is the exact failure this
decision prevents.

### V7 — The script fails loudly instead of silently

Non-destructive: copy the script to a scratch file, point it at a folder that does not exist, run it, delete it.

```powershell
$scratch = Join-Path $env:TEMP 'update-db-failcheck.ps1'
(Get-Content ./scripts/update-db.ps1) -replace "src/3DPrintingHub.Api'", "src/NoSuchProject'" |
    Set-Content -LiteralPath $scratch
& $scratch
Remove-Item -LiteralPath $scratch
```

**Expected:** the run ends with `Project folder not found: <repo>\src\NoSuchProject` and **never** prints
`Applying migrations to SQLite database:`. The failure must be loud and named, not a silent success or a raw
stack trace. (The same standard applies to the non-zero `dotnet ef` exit path: it must throw
`dotnet ef database update failed with exit code <n>.` rather than let the script report success.)

### V8 — All four scripts are tracked

```powershell
git ls-files scripts
```

**Expected:** exactly four lines — `scripts/run-all.ps1`, `scripts/run-front.ps1`, `scripts/run-program.ps1`,
`scripts/update-db.ps1`.

### V9 — The ignore file is no longer corrupted

```powershell
"contains NUL: " + ([IO.File]::ReadAllBytes('.gitignore') -contains 0)   # today: True  -> expect False
"lines: " + (Get-Content .gitignore).Count                               # today: 496   -> expect ~492
Select-String -Path .gitignore -Pattern "^scripts/" | Select-Object LineNumber, Line
```

**Expected:** `contains NUL: False`, no line starts with `scripts/`, and the line count has dropped by the four
garbage lines removed in Group 2 (the two duplicated `context.tar` entries and two empty NUL lines) plus the
two `scripts/` entries and the bare `.db` entry — i.e. **490 or fewer**. Note that a plain
`Select-String -Pattern 'context\.tar'` is *not* a useful check: the corrupted text is NUL-interleaved
(`c\0o\0n\0t...`), so it never matched as a literal string even before the fix. The NUL-byte test above is the
real assertion.

**Measured after implementation:** `contains NUL: False`, `lines: 487`, no line starts with `scripts/`. The nine
removed lines are the five corrupted ones (two NUL-interleaved `context.tar` lines plus three NUL-only lines),
the two accidental `scripts/*.ps1` exclusions, and the stray bare `.db` entry together with its orphan blank
line. The `.gitignore` commit records exactly `0 insertions / 9 deletions`.

---

## 3. Regression checks (nothing else broke)

| # | Command | Expected |
|---|---|---|
| R1 | `dotnet build src/3DPrintingHub.slnx` | Succeeds. The two dead references (`3DPrintingHub.DataMigration`, `3DPrintingHub.Client`) were removed under D6, so the solution-wide build that used to fail with MSB3202 now passes. `dotnet build src/3DPrintingHub.Api/3DPrintingHub.Api.csproj` must pass too. Both require the locally running API dev server to be stopped first: it locks `src/3DPrintingHub.Api/bin/Debug/net10.0/*.dll`, and MSBuild then fails with MSB3021/MSB3027 — an environment condition, not a code defect. |
| R2 | `Push-Location src/3DPrintingHub.Client; npm test; Pop-Location` | Green, same as before the change (the `app.spec.ts` baseline). |
| R3 | `./scripts/run-all.ps1` | Two windows open; API answers on `http://localhost:5033`, client on `http://localhost:4200`; the login page loads and an authenticated page still renders. |
| R4 | `git diff --stat` | Only `specs/2026-09-16-repo-hygiene-and-dev-scripts/*`, `.env.example`, `.gitignore`, the four `scripts/*.ps1`, `CHANGELOG.md` and (if D6 says remove) `src/3DPrintingHub.slnx`. **No** application source files. |
| R5 | `git diff -- .github/workflows/build-publish.yml nginx.conf docker-compose.yml Dockerfile.api Dockerfile.frontend` | Empty — Phase 2/4 concerns were not smuggled into this change. |

---

## 4. Evidence to attach to the pull request

Paste the raw output of V1, V5, V6 (including the `Test-Path` line), V8 and R1-R3 into the PR description, plus
`git diff --stat`. That is enough for a reviewer to confirm both roadmap acceptance lines without re-running
anything locally.

---

## 5. Merge checklist

- [ ] V1-V9 all pass, with output pasted as evidence.
- [ ] R1-R5 pass; no `.cs`/`.ts` diff in `git diff --stat`.
- [ ] `.env` is still present locally, still ignored, and never staged at any point in the branch history
      (`git log --all -- .env` is still empty).
- [ ] `.env.example` contains placeholders only; a reviewer can read it without learning any secret.
- [ ] All four scripts are tracked and none prints a port that contradicts
      `src/3DPrintingHub.Api/Properties/launchSettings.json` (`5033`) or `docker-compose.yml` (`8081:80`).
- [ ] `specs/tech-stack.md` Gap Register no longer claims `.env` was committed, and its Postgres script row is
      closed.
- [ ] CHANGELOG entry added for the implementation SHAs.
- [x] Decision D6 is resolved: both dead `.slnx` references (`3DPrintingHub.DataMigration`,
      `3DPrintingHub.Client`) were removed, so the solution-wide build passes.

---

## 6. Rollback

Every change is additive or a script rewrite, so `git revert` of the merge commit restores the previous state
with no data consequence. The only externally visible artifact is `.env.example`, whose removal is harmless.
No migration, no schema change and no configuration consumed at runtime is produced by this branch, so there is
nothing to unwind outside version control.

---

## 7. Explicitly not validated here

- The 5-minute quickstart, the health/readiness endpoint and compose readiness — Phase 2.
- `dotnet test` (no test project exists yet) and client test coverage beyond the existing smoke spec — Phase 3.
- CI gating of image publishing — Phase 4. The workflow file is intentionally untouched (R5).
- **`.gitignore`'s stored line endings.** Its committed blob is CRLF while every other tracked blob in this
  repository is LF (`core.autocrlf=true` writes CRLF working copies on checkout). It is therefore staged with
  `git -c core.autocrlf=false add .gitignore`, so the commit carries the nine deletions and no end-of-line
  churn. Renormalizing the repository needs a `.gitattributes` policy, which is out of scope here; expect
  `git status` to list `.gitignore` as modified whenever git's stat cache is invalidated, exactly as it did
  before this branch.
- **Building while the dev servers run.** `./scripts/update-db.ps1`, R1 and the D6 solution build all need
  `src/3DPrintingHub.Api/bin/Debug/net10.0/*.dll` unlocked, so the API started by `scripts/run-all.ps1` has to be
  stopped first. MSB3021/MSB3027 while it is running is an environment condition, not a code defect.
