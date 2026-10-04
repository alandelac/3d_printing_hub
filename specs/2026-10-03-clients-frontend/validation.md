# Validation — Clients Frontend

## 1. Automated Tests

- [ ] Client TypeScript contracts match the API's client fields and contact-platform values.
- [ ] Repository tests cover list, read, create and update API calls, including payloads and responses.
- [ ] Route tests confirm client routes are protected by `authGuard`.
- [ ] List component tests cover loading, empty, error and populated states.
- [ ] Table tests or component tests verify client columns can be filtered and sorted.
- [ ] Form tests cover required fields, optional phone/email, create submission, edit population, successful save and API/validation errors.
- [ ] `npm test` passes and global frontend coverage remains at or above 80%.
- [ ] The Angular client production build succeeds.

## 2. Manual Verification

- [ ] Sign in and open Clients from the navbar; verify an unauthenticated user is redirected by the existing auth guard.
- [ ] Create a client with only name and contact platform, then confirm it appears in the list.
- [ ] Filter and sort the list by client details.
- [ ] Edit the client, including optional phone and email fields, and confirm the list shows the saved values.
- [ ] Reload the application and confirm created and edited values persist.
- [ ] Confirm no delete action is offered in phase 11b; deletion is delivered in phase 11c with the backend endpoint.

## 3. CI Gates

- [ ] Frontend build, frontend tests and global coverage checks pass in CI.
- [ ] The required backend checks remain green; no backend changes are expected in this phase.
- [ ] No new package or external service is introduced without a tech-stack decision.

## 4. Merge Readiness Checklist

- [ ] Phase 11b acceptance criteria from `specs/roadmap.md` are covered.
- [ ] Components do not make HTTP requests directly or contain API URLs.
- [ ] Loading, empty, error and populated states are usable and do not hide save failures.
- [ ] No credentials, personal data or machine-specific paths are added.
- [ ] Changes remain uncommitted until the repository owner explicitly requests a commit.