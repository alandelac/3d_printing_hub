# Validation — Backend test foundation

How to know the implementation succeeded and this branch can be merged.
Run every command from the repository root unless stated otherwise.

---

## 1. Acceptance, mapped to the roadmap's own words

| Roadmap phase | Acceptance sentence (quoted) | Covered by |
|---|---|---|
| Phase 3 | *"`dotnet test` and `npm test` run green from a clean checkout, and frontend coverage is at least 80%."* | V1, V2, V3, V4 |

Every item in §1 must pass. If a command fails because of an absent test project or stale client spec, the feature is not ready.

---

## 2. Checks

### V1 — Backend test project exists and runs

```powershell
dotnet test src/3DPrintingHub.slnx
```

**Expected:**
- the shared `src/3DPrintingHub.Tests` project is discovered,
- backend tests execute with xUnit,
- the run exits successfully,
- no project-not-found errors or missing test SDK issues appear.

### V2 — Backend tests are meaningful

```powershell
dotnet test src/3DPrintingHub.Tests/3DPrintingHub.Tests.csproj --logger "console;verbosity=minimal"
```

**Expected:**
- at least one real unit test passes,
- at least one additional meaningful backend assertion exists,
- the suite is not empty and is not just a placeholder `Fact` with no substantive behavior.

### V3 — Integration-test pattern works with SQLite

```powershell
dotnet test src/3DPrintingHub.Tests/3DPrintingHub.Tests.csproj --filter "Integration"
```

**Expected:**
- the temporary SQLite-based integration path runs successfully,
- no external database service is required,
- the app-level integration harness executes against the repo’s real EF Core / SQLite configuration.

### V4 — Frontend tests run and coverage is at least 80%

```powershell
Push-Location src/3DPrintingHub.Client
npm test -- --run
Pop-Location
```

**Expected:**
- the stale baseline spec no longer fails,
- the client suite passes under Vitest + jsdom,
- the output includes coverage reporting and the global threshold is at least 80%.

If coverage is below 80%, the branch is not merge-ready.

---

## 3. Regression checks

| # | Command | Expected |
|---|---|---|
| R1 | `dotnet test src/3DPrintingHub.slnx` | Passes with the added test project included in solution execution. |
| R2 | `Push-Location src/3DPrintingHub.Client; npm test -- --run; Pop-Location` | Passes and report coverage at or above 80%. |
| R3 | `git diff --stat` | Shows only the expected backend test project, test files, and any small, targeted infrastructure change required for the test foundation. No unrelated application refactors. |

---

## 4. Merge checklist

- [ ] V1-V4 all pass from a clean checkout.
- [ ] The backend suite is real xUnit coverage, not a placeholder.
- [ ] The temporary SQLite integration path is operating correctly.
- [ ] The stale frontend spec issue is resolved.
- [ ] Coverage is at least 80% globally.
- [ ] `dotnet test` and `npm test` are both green before merge.
