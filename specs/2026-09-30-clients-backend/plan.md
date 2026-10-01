# Plan — Clients Backend

## Task Group 1 — Domain Model
- [ ] Add the `Client` entity under `src/3DPrintingHub.Domain/Entities`.
- [ ] Add required `Name` and `ContactPlatform` properties, plus optional `Phone` and `Email` properties.
- [ ] Use the repository's `Guid Id` convention and define the contact-platform values used by the API.
- [ ] Add domain-level tests for the entity's required data and supported contact-platform values where behavior is enforced in the domain.

## Task Group 2 — Application Contracts and Validation
- [ ] Add create, update, list and detail DTOs under `src/3DPrintingHub.Application/Dtos`.
- [ ] Add FluentValidation validators for create and update requests.
- [ ] Validate required name and contact platform, optional phone and email formats, and the agreed length limits.
- [ ] Add unit tests covering valid requests and each validation failure exposed by the API.

## Task Group 3 — Service Layer
- [ ] Add `IClientService` with create, list, get-by-id and update operations.
- [ ] Implement `ClientService` in Infrastructure using the existing EF Core service patterns.
- [ ] Return a clear not-found result or exception for missing clients and preserve the client's identifier on update.
- [ ] Register the service through the existing application-service registration path.
- [ ] Add service tests for CRUD behavior and missing-client handling.

## Task Group 4 — Persistence and Migration
- [ ] Add the `Clients` `DbSet` and entity configuration to the existing DbContext.
- [ ] Create an EF Core SQLite migration for the clients table and its required columns.
- [ ] Confirm the migration applies through the existing startup migration path without changing unrelated tables.
- [ ] Add an integration check that creates and reloads a client from a temporary SQLite database.

## Task Group 5 — API Controller
- [ ] Add `ClientsController` using the existing MVC controller conventions and authenticated API routing.
- [ ] Implement `POST /api/clients`, `GET /api/clients`, `GET /api/clients/{id}` and `PUT /api/clients/{id}`.
- [ ] Return the repository's standard success and not-found responses, including a stable response shape for client data.
- [ ] Ensure FluentValidation failures are returned as Problem Details with HTTP 400.
- [ ] Add `WebApplicationFactory` integration tests for successful CRUD requests, validation failures, malformed identifiers and missing clients.

## Task Group 6 — Final Validation
- [ ] Run `dotnet test` for the complete solution.
- [ ] Run the relevant API/integration tests against temporary SQLite.
- [ ] Verify the generated migration is included and the API build succeeds.
- [ ] Confirm no frontend, delete endpoint, sales behavior or external dependency is introduced by this phase.