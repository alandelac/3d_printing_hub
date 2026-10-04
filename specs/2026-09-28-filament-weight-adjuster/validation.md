# Validation — Filament Weight Adjuster

## 1. Automated Tests

### Backend
- [x] `dotnet test` passes green from a clean checkout
- [x] Unit tests in `src/3DPrintingHub.Tests` cover: positive adjustment, negative adjustment, boundary (zero), rejection of negative result
- [x] Integration test: weight adjustment persists correctly after page reload
- [x] Integration test: concurrent adjustments are handled atomically
- [x] Integration test: API endpoint returns 200 with adjusted weight, 400 on invalid input

### Frontend
- [x] `npm test` passes green
- [x] Frontend global coverage remains at or above 80%
- [x] Vitest component-integration tests for the three button actions (+/−/Update)
- [x] Error message displays on invalid operation

## 2. Manual Verification

- [x] Each of the three UI actions (`+`, `−`, `Update`) yields the expected persisted weight after a page reload
- [x] An invalid operation (e.g., subtracting more than available weight) surfaces an error instead of corrupting the value
- [x] Audit log entry is created for each adjustment with timestamp, user ID, and reason
- [x] Print job records are unaffected by weight adjustments

## 3. CI Gates

- [x] GitHub Actions workflow `build-publish.yml` runs build + `dotnet test` + `npm test` + frontend coverage
- [x] All required status checks (`build`, `backend-tests`, `frontend-tests`, `frontend-coverage`) pass on the branch
- [x] Branch protection on `main` must require these checks before merge

## 4. Merge Readiness Checklist

- [x] All acceptance criteria from roadmap Phase 10 are met
- [x] No credentials, personal data, or machine-specific paths in the repository
- [x] README.md updated if any new feature surface is added
- [x] Feature is reachable from the UI (nav, route)
