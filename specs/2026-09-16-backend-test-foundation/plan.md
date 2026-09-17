# Plan — Backend test foundation

Roadmap Phase 3, branch `phase-3-backend-test-foundation`.
Scope, decisions and rationale live in `requirement.md`; proof of success lives in `validation.md`.

Each task group ends in a reviewable checkpoint so the work can be checked in small steps without losing the
Phase 3 goal: a working backend test foundation and a green frontend test baseline.

---

## Task Group 1 — Backend test project scaffold

| # | Task | Verify |
|---|---|---|
| 1.1 | Create the shared backend test project at `src/3DPrintingHub.Tests` using xUnit and the .NET test SDK. | `dotnet test src/3DPrintingHub.Tests/3DPrintingHub.Tests.csproj` runs and discovers zero tests without project errors. |
| 1.2 | Add the test project to the solution or make the repository structure explicit so a clean checkout can run `dotnet test` from the repo root. | `dotnet test src/3DPrintingHub.slnx` starts the test project and reports results instead of failing on a missing project. |
| 1.3 | Keep the project focused on the repository's stack: .NET 10, SQLite-backed EF Core, and ASP.NET Core integration patterns already described in `specs/tech-stack.md`. | No new framework is introduced without a decision recorded in `tech-stack.md` and no extra infrastructure is introduced. |

---

## Task Group 2 — First meaningful unit tests

| # | Task | Verify |
|---|---|---|
| 2.1 | Pick a stable domain or application behavior that is already implemented and free from external dependencies. | The test targets pure logic with no filesystem, network or database dependencies. |
| 2.2 | Add at least one unit test covering domain rules or application validation that already exists. | `dotnet test` reports the test as passing and it exercises a real behavior instead of a mock-only assertion. |
| 2.3 | Add a second meaningful backend test for the same layer or a closely related one to prove the test project is not a placeholder. | Test output shows multiple real assertions in the backend suite. |
| 2.4 | Do not invent new business logic solely to satisfy test coverage; the task is to prove existing behavior. | The tests describe current contracts, not speculative features. |

---

## Task Group 3 — Integration-test support for EF Core and API boundaries

| # | Task | Verify |
|---|---|---|
| 3.1 | Build the integration harness around a temporary SQLite database, matching the repository's declared backend approach. | The test fixture creates a disposable DB and cleans up without mutating tracked files. |
| 3.2 | Add one API or service-integration test that exercises the app through the real EF Core + SQLite path. | A request or service call runs against the temporary DB and returns the expected result. |
| 3.3 | Keep the configuration aligned with the repo's `Program.cs` and `AddApplicationServices()` patterns instead of swapping in a different stack. | The integration path exercises the same app wiring the project already uses in development. |
| 3.4 | Document the pattern so future feature work can reuse it rather than discovering the test harness by accident. | The next backend change can follow the same temporary DB pattern without major setup work. |

---

## Task Group 4 — Frontend test repair and coverage baseline

| # | Task | Verify |
|---|---|---|
| 4.1 | Repair the stale `src/3DPrintingHub.Client` baseline test that currently expects an `h1` which the shell does not render. | `npm test` no longer fails on the stale UI assertion. |
| 4.2 | Add or fix real component/integration tests for existing client behavior instead of just asserting a mock shell. | The client test suite exercises actual routes, rendered output or component interaction. |
| 4.3 | Ensure the frontend test command can run with jsdom and the existing Vitest configuration without additional framework drift. | `npm test` executes in the repository as configured, and the suite reports passing tests. |
| 4.4 | Establish the coverage baseline required by the roadmap: global frontend coverage at or above 80%. | Coverage output is at least 80% and the threshold is enforced in the project’s test command. |

---

## Task Group 5 — Merge readiness and branch closure

| # | Task | Verify |
|---|---|---|
| 5.1 | Run the full validation commands from the repo root: `dotnet test` and `npm test`. | Both commands exit successfully with no failing fixtures. |
| 5.2 | Confirm the repo is not shipping a broken or untested foundation: no backend test project is missing, no stale frontend spec remains, and coverage is met. | Output from the validation steps matches the acceptance language in `validation.md`. |
| 5.3 | Record any follow-up work that is intentionally deferred rather than silently skipped. | Any future work is clearly described as out-of-scope or a later phase. |

---
