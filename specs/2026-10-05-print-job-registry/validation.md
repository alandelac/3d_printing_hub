# Validation — Print Job Registry

## 1. Automated Tests

### Backend behavior
- [x] A valid completion persists a print job with the requested model, filament, grams, produced quantity, timestamp, calculated material cost and notes.
- [x] Material cost is calculated from the selected filament's current cost per gram and remains stored on the completed job.
- [x] Completion increases the matching model/filament stock quantity by the produced quantity and decreases filament remaining weight by grams used.
- [x] Invalid or non-positive produced quantity, invalid grams, a missing matching stock row, or insufficient filament is rejected without changing the job history, stock or filament weight.
- [x] Concurrent or failed operations cannot leave only some of the job, stock and filament changes persisted.
- [x] The authenticated API supports recording a completed job and listing history; DTO validation and error responses follow existing conventions.

### Frontend behavior
- [x] The print-job history renders persisted records and an appropriate empty state using the shared table and timestamp formatter.
- [x] The create form submits a valid completed job through the repository and displays the persisted result.
- [x] Invalid input and rejected API operations show useful feedback without presenting a successful completion.
- [x] Vitest unit/component tests cover history and submission success, validation, empty and error states.

## 2. Manual Verification

- [x] In the authenticated app, open the print-job registry and confirm existing jobs load; verify the empty state when there are none.
- [x] Record a completed job for a model/filament pair with an existing stock row; confirm history, stock quantity, filament remaining weight and material cost after reload.
- [x] Attempt a job using more filament than remains; confirm it is rejected and neither stock nor filament nor job history changes.
- [x] Confirm jobs cannot be edited or deleted and no in-progress status workflow is exposed.

## 3. CI Gates

- [x] Relevant backend unit and integration tests pass with the repository's xUnit conventions.
- [x] Relevant frontend tests pass and global frontend coverage remains at or above 80%.
- [x] Required CI checks (`build`, `backend-tests`, `frontend-tests`, `frontend-coverage`) pass.
- [x] No new package or external service is introduced without a documented dependency decision.

## 4. Merge Readiness

- [x] The feature is reachable through an authenticated route and navigation entry.
- [x] Job creation, stock increase, filament consumption and cost persistence satisfy Phase 13 acceptance as one atomic operation.
- [x] The implementation follows the documented backend and frontend architecture and adds no unrelated behavior.
- [x] No credentials, personal data or machine-specific paths are introduced.
