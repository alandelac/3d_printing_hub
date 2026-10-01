# Validation — Clients Backend

## 1. Automated Tests

### Domain and Application
- [ ] `Client` accepts valid required data and represents the supported contact-platform values.
- [ ] Create and update validators accept valid input.
- [ ] Validators reject a missing or blank name.
- [ ] Validators reject a missing or unsupported contact platform.
- [ ] Validators accept omitted phone and email values.
- [ ] Validators reject malformed email and overlong phone/email/name values according to the defined contract.

### Infrastructure and API
- [ ] The EF Core migration creates the clients table with required columns and applies to temporary SQLite.
- [ ] `POST /api/clients` returns the created client and persists it.
- [ ] `GET /api/clients` returns persisted clients in a stable order.
- [ ] `GET /api/clients/{id}` returns the requested client.
- [ ] `PUT /api/clients/{id}` updates the client while preserving its id.
- [ ] Missing-client reads and updates return HTTP 404.
- [ ] Invalid create and update requests return HTTP 400 Problem Details and do not persist partial data.
- [ ] Malformed route identifiers return the existing API's standard client error response.
- [ ] `dotnet test` passes for the complete solution.

## 2. Manual Verification

- [ ] Start the API with the normal development configuration and confirm the clients migration applies without errors.
- [ ] Create a client with only name and contact platform, then confirm it can be listed and read after an API restart.
- [ ] Update the optional phone and email fields, then confirm the updated values are returned.
- [ ] Submit an invalid name or contact platform and confirm the response is a readable Problem Details payload.
- [ ] Confirm no delete endpoint, frontend change or unrelated migration is required for this phase.

## 3. CI Gates

- [ ] GitHub Actions build and backend test checks pass on the branch.
- [ ] The temporary SQLite integration tests pass in the same environment used by CI.
- [ ] No new package or external service is introduced without a tech-stack dependency decision.

## 4. Merge Readiness Checklist

- [ ] All Phase 11a acceptance criteria from `specs/roadmap.md` are covered.
- [ ] Domain, Application, Infrastructure and Api responsibilities remain in their documented layers.
- [ ] No credentials, personal data or machine-specific paths are added.
- [ ] The changes are uncommitted until the repository owner explicitly requests a commit.