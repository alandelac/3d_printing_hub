# Validation — CI gates

Roadmap Phase 4 acceptance:

> A workflow run with a failing test or insufficient frontend coverage stops before publishing images and cannot merge to `main`.

## Execution summary

This repository does not yet meet the CI gate acceptance criteria. I executed the local backend and frontend checks directly and confirmed the project passes those quality gates locally, but the current GitHub Actions workflow does not implement the required CI gating and branch protection controls.

## Local checks executed

Run from the repository root unless noted:

1. [x] `dotnet test src/3DPrintingHub.slnx`
   - Result: passed.
   - Evidence: exit code 0; 5/5 tests passed.
2. [x] From `src/3DPrintingHub.Client`, run the repository's npm test command with coverage.
   - Result: passed.
   - Evidence: 4 test files passed, 9/9 tests passed, global coverage was 98.5% statements, 96.55% branches, 97.61% lines, above the 80% threshold.
3. [x] Build the API and client using the commands or workflow setup used by CI.
   - Result: passed.
   - Evidence: `dotnet build src/3DPrintingHub.slnx` succeeded; frontend bundle generation completed successfully during `npm test`.

## Workflow checks executed by review of `.github/workflows/build-publish.yml`

- [ ] Failed: Pull requests trigger validation jobs.
  - Evidence: the workflow only listens to `push` on `main`, with no `pull_request` trigger.
- [ ] Failed: Successful pushes to `main` can reach the publish job; pull requests cannot publish.
  - Evidence: the workflow publishes directly on `push` without any required job dependencies or PR guard.
- [ ] Failed: Backend build/test, frontend test, and frontend coverage are separate visible checks or clearly named equivalent steps.
  - Evidence: there is one `build-and-push` job with no backend/frontend/coverage jobs.
- [ ] Failed: The coverage job fails below the global 80% threshold.
  - Evidence: the current workflow has no coverage gate at all; local coverage is above 80%, but it is not enforced in CI.
- [ ] Failed: The image build/publish job has explicit dependencies on every required quality job.
  - Evidence: the workflow has no `needs` references and publishes immediately after checkout.
- [ ] Failed: A failed required job prevents registry login and both image pushes.
  - Evidence: there is no dedicated quality job to fail before login/push.
- [x] Passed by static review: API and frontend images retain the existing GHCR tags and `linux/amd64,linux/arm64` platforms.
  - Evidence: both Docker build-push steps still use the expected GHCR tags and multi-arch platforms.
- [ ] Failed: Package-write permission is limited to the publishing job.
  - Evidence: the workflow grants `packages: write` to the whole `build-and-push` job without separate validation and publish scopes.
- [x] Passed by static review: Action versions and runtime setup are stable and reviewable.
  - Evidence: the workflow uses maintained action versions (`checkout@v4`, `docker/setup-buildx-action@v3`, `docker/login-action@v3`, `docker/build-push-action@v5`).

## Failure-path evidence

- [ ] Not demonstrated in GitHub Actions: a failing backend or frontend test makes its job fail and leaves the publish job skipped.
  - Reason: no CI job currently exists to fail before publish; this repository-level gate is missing.
- [ ] Not demonstrated in GitHub Actions: a coverage result below 80% makes the coverage job fail and leaves the publish job skipped.
  - Reason: the workflow does not implement a coverage gate or publish dependency.
- [ ] Not demonstrated in GitHub Actions: a pull-request workflow has no registry push operation.
  - Reason: there is no `pull_request` workflow branch in the repository.

## Branch protection / repository settings

- [ ] Not executable from this local workspace: configure `main` to require the exact successful CI checks produced by the workflow.
  - Reason: GitHub branch protection is a repository setting in the GitHub UI and requires maintainer/admin access.
- [ ] Not executable from this local workspace: record the protected-branch workflow URL and required check names.
  - Reason: this requires an authenticated GitHub repository configuration and a successful protected-branch run.

## Merge checklist status

- [x] `dotnet test` passes locally.
- [x] Frontend tests pass locally with coverage.
- [x] Frontend global coverage is at least 80%.
- [ ] Workflow syntax and dependencies are valid.
  - Status: failed by review; current workflow does not meet the CI gate specification.
- [ ] Pull-request validation does not publish images.
  - Status: failed by review; current workflow lacks PR validation and publishes directly on push.
- [ ] Main-branch publication is gated by all required checks.
  - Status: failed by review; no required checks or gating dependencies exist.
- [ ] Failure-path behavior has been demonstrated.
  - Status: not executable in this environment without creating a temporary GitHub Action or workflow branch.
- [ ] Required checks are enabled in `main` branch protection.
  - Status: manual GitHub configuration required.
- [x] No new dependency or external service was added without a tech-stack decision.
  - Status: no new dependency was introduced during this validation run.
