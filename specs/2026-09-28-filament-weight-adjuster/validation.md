# Validation — Filament Weight Adjuster

## 1. Automated Tests

### Backend
- [ ] `dotnet test` passes green from a clean checkout
- [ ] Unit tests in `src/3DPrintingHub.Tests` cover: positive adjustment, negative adjustment, boundary (zero), rejection of negative result
- [ ] Integration test: weight adjustment persists correctly after page reload
- [ ] Integration test: concurrent adjustments are handled atomically
- [ ] Integration test: API endpoint returns 200 with adjusted weight, 400 on invalid input

### Frontend
- [ ] `npm test` passes green
- [ ] Frontend global coverage remains at or above 80%
- [ ] Vitest component-integration tests for the three button actions (+/−/Update)
- [ ] Error message displays on invalid operation

## 2. Manual Verification

- [ ] Each of the three UI actions (`+`, `−`, `Update`) yields the expected persisted weight after a page reload
- [ ] An invalid operation (e.g., subtracting more than available weight) surfaces an error instead of corrupting the value
- [ ] Audit log entry is created for each adjustment with timestamp, user ID, and reason
- [ ] Print job records are unaffected by weight adjustments

## 3. CI Gates

- [ ] GitHub Actions workflow `build-publish.yml` runs build + `dotnet test` + `npm test` + frontend coverage
- [ ] All required status checks (`build`, `backend-tests`, `frontend-tests`, `frontend-coverage`) pass on the branch
- [ ] Branch protection on `main` must require these checks before merge

## 4. Merge Readiness Checklist

- [ ] All acceptance criteria from roadmap Phase 10 are met
- [ ] No credentials, personal data, or machine-specific paths in the repository
- [ ] README.md updated if any new feature surface is added
- [ ] Feature is reachable from the UI (nav, route)
