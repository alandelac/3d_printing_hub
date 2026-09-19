# Requirement — CI gates

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 4 (*CI gates*) |
| **Branch** | `phase-4-ci-gates` |
| **Spec directory** | `specs/2026-09-17-ci-gates/` |
| **Date opened** | 2026-09-17 |
| **Status** | Planned |
| **Depends on** | Phases 0–3 completed; local backend and frontend test foundations are available |
| **Blocks** | Reliable merges to `main` and image publication from `main` |

## 1. Objective

Prevent broken or insufficiently tested changes from reaching the container registry or merging to `main`. The existing GitHub Actions workflow publishes both images, but currently has no build, backend-test, frontend-test, or frontend-coverage gates.

## 2. Why this is the next phase

Phase 4 is the lowest-numbered unfinished roadmap phase. Phase 3 established the test foundation that this phase must enforce. Without CI gates, the repository's local quality requirements are advisory and a failing change can still publish images.

## 3. Scope

### In scope

1. Update `.github/workflows/build-publish.yml` with build, `dotnet test`, `npm test`, and frontend coverage checks.
2. Enforce the existing global frontend coverage requirement of at least 80%.
3. Ensure image build/publish waits for all required checks and cannot publish after a failure.
4. Run checks for pull requests and preserve image publication only for successful pushes to `main`.
5. Harden workflow inputs with stable action versions, appropriate permissions, and caching where useful and compatible with the current stack.
6. Document the required GitHub branch-protection status checks and any manual repository settings.

### Out of scope

- Changing application behavior or adding business features.
- Replacing xUnit, Vitest, jsdom, Angular, .NET, SQLite, Docker, or the existing GHCR deployment model.
- Deploying images after publication.
- Automatically changing GitHub repository branch-protection settings when they are not represented in tracked repository files.
- Adding external services or dependencies not listed in `specs/tech-stack.md`.

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | Keep the existing workflow as the single CI/publish entry point unless splitting jobs is required for clear gating. | This minimizes operational drift while making the current publication path trustworthy. |
| **D2** | Run backend tests with the repository's .NET solution and frontend tests with the existing npm/Vitest configuration. | The mission and tech-stack documents define these as the required verification tools. |
| **D3** | Enforce frontend coverage at the existing 80% global threshold rather than lowering it for CI. | The roadmap and Phase 3 acceptance criteria already establish 80% as the project quality bar. |
| **D4** | Pull requests run validation but never publish images; successful pushes to `main` may publish. | Review should prove a change is safe before merge, while registry publication remains tied to the existing release trigger. |
| **D5** | Use least privilege: read-only permissions for validation jobs and package write permission only for publishing. | Tests do not need registry credentials, and narrower permissions reduce workflow risk. |
| **D6** | Treat branch protection as a documented repository setting, not as something the workflow can guarantee alone. | Required checks must be enabled in GitHub settings to block merges; YAML can provide the checks but cannot configure repository policy here. |

## 5. Context

The mission requires verified changes and a one-command, self-hostable product. The tech-stack document requires .NET 10, Angular 22, Vitest 4 with jsdom, and global frontend coverage of at least 80%. The current workflow only reacts to pushes to `main`, logs into GHCR, and builds/pushes both multi-architecture images. It has no test or coverage jobs and grants package-write permission to the whole job.

The feature should preserve the existing Dockerfiles, GHCR naming, `linux/amd64` and `linux/arm64` targets, and the repository's local commands. Workflow hardening may improve action pinning, caching, and permission boundaries, but it must remain a small CI-focused phase.

## 6. Risks

| Risk | Mitigation |
|---|---|
| CI commands differ from local commands and fail for environmental reasons. | Reuse documented project commands and runtime versions; validate locally before merge. |
| Coverage passes locally but is not enforced in CI. | Make the coverage threshold an explicit failing condition and require that job. |
| A failed test still allows image publication. | Put publishing behind explicit job dependencies and verify failure behavior. |
| Pull requests accidentally gain registry write access. | Separate validation permissions from the publish job and avoid login/push on pull-request events. |
| Required checks are reported under unstable names. | Define stable job names and document the exact names for branch protection. |
| Workflow-only changes are structurally valid but operationally untested. | Perform local command validation plus workflow review or syntax validation, and record any GitHub-only checks as manual evidence. |

## 7. Done means

A pull request runs the backend build/tests, frontend tests, and frontend coverage gate. Any failure, including coverage below 80%, prevents the publish job from running. A successful `main` run builds and publishes both existing multi-architecture images. The required status checks are documented and configured on `main`, and local plus workflow validation evidence is recorded in `validation.md`.
