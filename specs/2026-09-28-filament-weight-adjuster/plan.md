# Plan — Filament Weight Adjuster

## Task Group 1 — Domain Layer: AdjustRemainingWeight Method
- [ ] Add `AdjustRemainingWeight(decimal amount, string reason)` method to the Filament entity in Domain
- [ ] Method rejects negative resulting weight (throw domain exception)
- [ ] Unit tests in `src/3DPrintingHub.Tests` covering: positive adjustment, negative adjustment, boundary case (zero), rejection of negative result

## Task Group 2 — Application Layer: Service and DTOs
- [ ] Create `AdjustFilamentWeightDto` with `Amount` and `Reason` fields
- [ ] Add `IFilamentService.AdjustWeightAsync` method signature in Application
- [ ] Implement `FilamentService.AdjustWeightAsync` with atomic adjustment via EF Core transaction
- [ ] Add FluentValidation validator for the DTO
- [ ] Unit tests for service logic and validation

## Task Group 3 — Infrastructure Layer: Persistence
- [ ] Ensure EF Core migration handles the adjustment (no schema change needed — just atomic update)
- [ ] Integration test: verify weight adjustment persists correctly after reload
- [ ] Integration test: verify concurrent adjustments are handled atomically

## Task Group 4 — API Layer: Controller Endpoint
- [ ] Add `PUT api/filaments/{id}/adjust-weight` endpoint in `FilamentsController`
- [ ] Wire up DTO, service call, and problem-detail error response
- [ ] Integration test: endpoint returns 200 with adjusted weight, 400 on invalid input

## Task Group 5 — Frontend: Weight Adjuster Controls
- [ ] Add `+`, `−`, and `Update` buttons plus numeric input to the remaining-weight column in `filaments-page.component.html`
- [ ] Wire up component methods to call the API endpoint
- [ ] Display error message on invalid operation (negative result)
- [ ] Vitest component-integration tests for the three button actions

## Task Group 6 — Audit Logging
- [ ] Add `WeightAdjustmentLog` entity in Domain with `Timestamp`, `UserId`, `Reason`, `OldWeight`, `NewWeight`
- [ ] Log each adjustment in the service layer
- [ ] Verify audit log is immutable and print job records are unaffected
- [ ] Unit/integration tests for audit logging

## Task Group 7 — Final Validation
- [ ] `dotnet test` passes green
- [ ] `npm test` passes green, frontend coverage ≥ 80%
- [ ] Manual verification: each of the three UI actions yields expected persisted weight after page reload
- [ ] Manual verification: invalid operation surfaces error without corrupting the value
