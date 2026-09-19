# Plan — CI gates

Roadmap Phase 4, branch `phase-4-ci-gates`.
Scope and decisions live in `requirement.md`; merge proof lives in `validation.md`.

## Task Group 1 — Inspect and define workflow boundaries

| # | Task | Verify |
|---|---|---|
| 1.1 | Confirm the existing publish workflow, repository commands, and required .NET and Angular runtimes. | The implementation targets the commands and versions documented in `specs/tech-stack.md`. |
| 1.2 | Define stable required-check names for backend tests, frontend tests, frontend coverage, and image builds. | The names are suitable for branch-protection configuration and documented in the workflow/spec. |
| 1.3 | Keep publishing limited to pushes to `main`; pull requests validate without publishing images. | A pull-request run has no registry push permission or push step. |

## Task Group 2 — Add backend and frontend quality jobs

| # | Task | Verify |
|---|---|---|
| 2.1 | Add a backend job that restores, builds and runs `dotnet test` against the solution. | The job fails on a compilation or test failure. |
| 2.2 | Add a frontend job that installs the client dependencies and runs `npm test` with the configured Vitest/jsdom suite. | The job fails when frontend tests fail. |
| 2.3 | Add a separate coverage gate using the existing frontend coverage configuration and enforce the 80% global threshold. | The job fails when global coverage is below 80%. |
| 2.4 | Use pinned, maintained action versions and dependency caching where it improves repeatability without adding a new service. | Workflow lint/review shows deterministic setup and no unrecorded dependency. |

## Task Group 3 — Gate image build and publish

| # | Task | Verify |
|---|---|---|
| 3.1 | Make image build/publish depend on the backend, frontend, and coverage jobs. | The publish job cannot start when any required job fails. |
| 3.2 | Keep Docker build validation separate from registry publishing where practical, while avoiding duplicate expensive builds without a clear benefit. | A failing application check stops before any image is pushed. |
| 3.3 | Preserve the existing multi-architecture API and frontend image tags and GHCR destination. | A successful main run still publishes both expected images. |
| 3.4 | Scope package-write permissions only to the publish job. | Test jobs retain read-only repository permissions. |

## Task Group 4 — Document merge protection

| # | Task | Verify |
|---|---|---|
| 4.1 | Document the required status checks and the `main` branch protection expectation. | A maintainer can configure branch protection without inferring check names from YAML. |
| 4.2 | Document that CI is the enforcement point and that local validation remains available before opening a pull request. | The workflow and validation spec agree on commands and thresholds. |
| 4.3 | Record any GitHub repository settings that cannot be applied from tracked files as an operator action. | No claim is made that YAML alone blocks merges. |

## Task Group 5 — Full validation and handoff

| # | Task | Verify |
|---|---|---|
| 5.1 | Run `dotnet test` from `src` or the repository command documented by the project. | Backend tests pass locally. |
| 5.2 | Run the client test command with coverage from `src/3DPrintingHub.Client`. | Frontend tests pass and global coverage is at least 80%. |
| 5.3 | Validate workflow syntax, job dependencies, permissions, triggers, and publish ordering. | Review or a workflow validation tool finds no structural defect. |
| 5.4 | Record deferred work and the exact acceptance evidence. | `validation.md` can be used as the merge checklist. |
