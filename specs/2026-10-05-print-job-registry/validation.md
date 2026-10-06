# Validation — Print Job Registry

## 1. Automated Tests

### Backend behavior
- [ ] A valid completion persists a print job with the requested model, filament, grams, produced quantity, timestamp, calculated material cost and notes.
- [ ] Material cost is calculated from the selected filament's current cost per gram and remains stored on the completed job.
- [ ] Completion increases the matching model/filament stock quantity by the produced quantity and decreases filament remaining weight by grams used.
- [ ] Invalid or non-positive produced quantity, invalid grams, a missing matching stock row, or insufficient filament is rejected without changing the job history, stock or filament weight.
- [ ] Concurrent or failed operations cannot leave only some of the job, stock and filament changes persisted.
- [ ] The authenticated API supports recording a completed job and listing history; DTO validation and error responses follow existing conventions.

### Frontend behavior
- [ ] The print-job history renders persisted records and an appropriate empty state using the shared table and timestamp formatter.
- [ ] The create form submits a valid completed job through the repository and displays the persisted result.
- [ ] Invalid input and rejected API operations show useful feedback without presenting a successful completion.
- [ ] Vitest unit/component tests cover history and submission success, validation, empty and error states.

## 2. Manual Verification

- [ ] In the authenticated app, open the print-job registry and confirm existing jobs load; verify the empty state when there are none.
- [ ] Record a completed job for a model/filament pair with an existing stock row; confirm history, stock quantity, filament remaining weight and material cost after reload.
- [ ] Attempt a job using more filament than remains; confirm it is rejected and neither stock nor filament nor job history changes.
- [ ] Confirm jobs cannot be edited or deleted and no in-progress status workflow is exposed.

## 3. CI Gates

- [ ] Relevant backend unit and integration tests pass with the repository's xUnit conventions.
- [ ] Relevant frontend tests pass and global frontend coverage remains at or above 80%.
- [ ] Required CI checks (`build`, `backend-tests`, `frontend-tests`, `frontend-coverage`) pass.
- [ ] No new package or external service is introduced without a documented dependency decision.

## 4. Merge Readiness

- [ ] The feature is reachable through an authenticated route and navigation entry.
- [ ] Job creation, stock increase, filament consumption and cost persistence satisfy Phase 13 acceptance as one atomic operation.
- [ ] The implementation follows the documented backend and frontend architecture and adds no unrelated behavior.
- [ ] No credentials, personal data or machine-specific paths are introduced.
