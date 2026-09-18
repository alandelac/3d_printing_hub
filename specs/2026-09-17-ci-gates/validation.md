# Validation — CI gates

Roadmap Phase 4 acceptance:

> A workflow run with a failing test or insufficient frontend coverage stops before publishing images and cannot merge to `main`.

## Local checks

Run from the repository root unless noted:

1. `dotnet test src/3DPrintingHub.slnx`
   - Expected: exit code 0; all discovered backend tests pass.
2. From `src/3DPrintingHub.Client`, run the repository's npm test command with coverage.
   - Expected: exit code 0; all tests pass; global coverage is at least 80%.
3. Build the API and client using the commands or workflow setup used by CI.
   - Expected: both builds complete without compilation errors.

## Workflow checks

Review or execute `.github/workflows/build-publish.yml` and confirm:

- Pull requests trigger validation jobs.
- Successful pushes to `main` can reach the publish job; pull requests cannot publish.
- Backend build/test, frontend test, and frontend coverage are separate visible checks or clearly named equivalent steps.
- The coverage job fails below the global 80% threshold.
- The image build/publish job has explicit dependencies on every required quality job.
- A failed required job prevents registry login and both image pushes.
- API and frontend images retain the existing GHCR tags and `linux/amd64,linux/arm64` platforms.
- Package-write permission is limited to the publishing job.
- Action versions, runtime setup, cache keys, and lockfile usage are stable and reviewable.

## Failure-path evidence

The phase is not accepted until at least one controlled failure path is demonstrated or otherwise evidenced:

- A failing backend or frontend test makes its job fail and leaves the publish job skipped.
- A coverage result below 80% makes the coverage job fail and leaves the publish job skipped.
- A pull-request workflow has no registry push operation.

The failure-path test may use a temporary branch or workflow change during verification, but it must not leave intentionally failing code or secrets in the repository.

## Branch protection

Configure `main` to require the exact successful CI checks produced by the workflow, including backend tests, frontend tests, frontend coverage, and any required build check. Require branches to be up to date if that is enabled for the repository's merge policy, and prevent bypassing required checks for ordinary pull requests.

Record the configured check names and a successful protected-branch workflow URL in the implementation handoff or pull request. GitHub repository settings are operational evidence and are not represented solely by tracked files.

## Merge checklist

- [ ] `dotnet test` passes locally.
- [ ] Frontend tests pass locally with coverage.
- [ ] Frontend global coverage is at least 80%.
- [ ] Workflow syntax and dependencies are valid.
- [ ] Pull-request validation does not publish images.
- [ ] Main-branch publication is gated by all required checks.
- [ ] Failure-path behavior has been demonstrated.
- [ ] Required checks are enabled in `main` branch protection.
- [ ] No new dependency or external service was added without a tech-stack decision.
