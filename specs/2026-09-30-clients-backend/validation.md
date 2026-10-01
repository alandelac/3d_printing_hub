# Validation — Clients Backend

## 1. Automated Tests

### Domain and Application
- [x] `Client` accepts valid required data and represents the supported contact-platform values.
- [x] Create and update validators accept valid input.
- [x] Validators reject a missing or blank name.
- [x] Validators reject a missing or unsupported contact platform.
- [x] Validators accept omitted phone and email values.
- [x] Validators reject malformed email and overlong phone/email/name values according to the defined contract.

### Infrastructure and API
- [x] The EF Core migration creates the clients table with required columns and applies to temporary SQLite.
- [x] `POST /api/clients` returns the created client and persists it.
- [x] `GET /api/clients` returns persisted clients in a stable order.
- [x] `GET /api/clients/{id}` returns the requested client.
- [x] `PUT /api/clients/{id}` updates the client while preserving its id.
- [x] Missing-client reads and updates return HTTP 404.
- [x] Invalid create and update requests return HTTP 400 Problem Details and do not persist partial data.
- [x] Malformed route identifiers return the existing API's standard client error response.
- [x] `dotnet test` passes for the complete solution.

## 2. Manual Verification

- [x] Start the API with the normal development configuration and confirm the clients migration applies without errors.
- [x] Create a client with only name and contact platform, then confirm it can be listed and read after an API restart.
- [x] Update the optional phone and email fields, then confirm the updated values are returned.
- [x] Submit an invalid name or contact platform and confirm the response is a readable Problem Details payload.
- [x] Confirm no delete endpoint, frontend change or unrelated migration is required for this phase.

## 3. CI Gates

- [x] GitHub Actions build and backend test checks pass on the branch.
- [x] The temporary SQLite integration tests pass in the same environment used by CI.
- [x] No new package or external service is introduced without a tech-stack dependency decision.

## 4. Merge Readiness Checklist

- [x] All Phase 11a acceptance criteria from `specs/roadmap.md` are covered.
- [x] Domain, Application, Infrastructure and Api responsibilities remain in their documented layers.
- [x] No credentials, personal data or machine-specific paths are added.
- [x] The changes are uncommitted until the repository owner explicitly requests a commit.