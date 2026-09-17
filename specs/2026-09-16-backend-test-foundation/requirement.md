# Requirement — Backend test foundation

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 3 (*Backend test foundation*) |
| **Branch** | `phase-3-backend-test-foundation` |
| **Spec directory** | `specs/2026-09-16-backend-test-foundation/` |
| **Date opened** | 2026-09-16 |
| **Status** | Planned |
| **Depends on** | Phase 0–2 completed and the stack remains aligned with `specs/mission.md` and `specs/tech-stack.md` |
| **Blocks** | Phase 4 (CI gates), and any future feature work that relies on honest automated validation |

---

## 1. Objective

Establish the repository's required automated verification layer so that future backend and frontend change work is objectively testable. This phase is intentionally foundational: it creates the shared .NET test project, proves the test harness works against the repository’s real stack, and repairs the stale frontend baseline so the project can be trusted to keep validating itself.

The mission emphasizes that a feature is not done if it is not verifiable, and the technology standards require xUnit for backend tests and Vitest + jsdom for the client. This phase turns that principle into an actual working test setup rather than a promise.

---

## 2. Why this is the next phase

The roadmap explicitly names Phase 3 as the next incomplete work item. The repo already has a functioning application stack and the earlier phases have repaired the environment and developer scripts. What is still missing is the test foundation itself:

- the backend has no shared xUnit test project,
- the frontend baseline spec is stale and fails,
- and the repository does not yet have the evidence required to enforce quality gates in CI.

This is the earliest practical feature because every later phase depends on the ability to run automated checks with consistent, reproducible conventions.

---

## 3. Scope

### In scope

1. Add a shared xUnit test project named `src/3DPrintingHub.Tests`.
2. Cover at least some real backend logic with meaningful unit tests.
3. Add integration-test support using a temporary SQLite database and ASP.NET Core test host patterns for API/service interactions.
4. Repair stale frontend tests so the client suite reflects the actual app shell and supports realistic validations.
5. Achieve or exceed the roadmap's frontend coverage target of 80%.
6. Ensure the repo-level commands `dotnet test` and `npm test` are usable from a clean checkout.

### Out of scope

- New business features unrelated to verification infrastructure.
- New external services or packages not already permitted under the stack declaration.
- Rewriting the application architecture in separate directions just to satisfy test patterns.
- Any CI blocking work that is intentionally deferred to Phase 4.

---

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | Use the repository's actual stack: xUnit for backend, SQLite for temporary integration tests, and Vitest + jsdom for frontend tests. | This matches the explicit stack guidance in `specs/tech-stack.md` and the mission's rule that verification must be real, not hypothetical. |
| **D2** | Start with existing behavior, not invented behavior. Tests must assert current domain/application contracts. | The mission requires source-of-truth behavior, and the roadmap says “first meaningful tests,” not speculative test scaffolding. |
| **D3** | Prefer a temporary SQLite database for integration tests instead of introducing another database engine or service. | The project already uses EF Core and SQLite, and the stack specification says that this is the persistence model to test against. |
| **D4** | Repair the stale frontend baseline spec first, then expand real coverage. | The existing stale spec is known to fail before any feature change, so the baseline must be corrected before incremental coverage is useful. |
| **D5** | Keep the work focused on backend foundations and the frontend baseline for validation; do not broaden into unrelated repository improvements. | The phase is intentionally narrow and should close the gap between “the app exists” and “the app is testable.” |

---

## 5. Context

- The mission states the repository is for a self-hosted maker business tool and explicitly requires verifiable features and zero external dependencies.
- The stack document says the backend is .NET 10 with EF Core SQLite, FluentValidation, and ASP.NET Core Identity. It also instructs test behavior: xUnit for backend tests, SQLite-temporary/test-host integration tests, and Vitest + jsdom for frontend tests.
- The roadmap explicitly describes this phase as the foundation for future CI gates. Without a passing local backend suite and a valid frontend suite, CI gating will be meaningless.
- This feature should be designed to remain compatible with the repository's current layering: Domain → Application → Infrastructure → Api, and the client architecture already described in `tech-stack.md`.
- The client test fix is not a UI feature enhancement; it is the restoration of a valid assertion against the actual shell in the current app.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| The test project becomes a disconnected shell without exercising real behavior. | Use real domain/application logic and a small EF Core SQLite integration path. |
| The frontend baseline repair becomes a cosmetic change and not a real assertion. | Fix the actual stale expectation against the current app shell and keep coverage above 80%. |
| Integration tests drift from the production app configuration. | Reuse the repo's existing Program.cs wiring and the same SQLite patterns already declared by `tech-stack.md`. |
| The branch expands beyond Phase 3 into unrelated cleanup. | Keep the scope to test foundation work only and defer any extra refactor to later phases. |

---

## 7. Done means

The phase is complete when the repository can credibly say:

- the backend has a proper xUnit test project,
- real backend tests pass,
- the temporary SQLite integration pattern works for the existing stack,
- the stale frontend spec is repaired,
- the client test suite passes with global coverage at or above 80%,
- and the next phase can add CI gates without needing a rewrite of the validation setup.
