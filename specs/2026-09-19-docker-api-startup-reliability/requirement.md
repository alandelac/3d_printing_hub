# Requirement — Docker API Startup & Proxy Reliability

| Field | Value |
|---|---|
| **Roadmap phase** | Phase 5 (*Docker API startup and proxy reliability*) |
| **Branch** | `phase-5-docker-api-startup` |
| **Spec directory** | `specs/2026-09-19-docker-api-startup-reliability/` |
| **Date opened** | 2026-09-19 |
| **Status** | Planned |
| **Depends on** | Phases 0–4 completed; Docker compose environment available |
| **Blocks** | None (foundational for reliable deployments) |

## 1. Objective

Ensure a compose deployment does not serve a `502 Connection refused` when nginx forwards requests to the API. The API container must reach a healthy, listening state on `0.0.0.0:8080` after migrations and seeding, and nginx must correctly proxy all API routes including auth endpoints.

## 2. Why this is the next phase

Phase 5 is the lowest-numbered unfinished phase in `specs/roadmap.md`. Phases 0–4 are complete. Without this fix, the primary deployment method (Docker Compose) is unreliable, blocking all downstream work that depends on a running stack.

## 3. Scope

### In scope

1. Reproduce the 502 failure with published and locally built compose images, capturing `docker compose ps` and `docker compose logs webapi`.
2. Ensure the API container reaches a healthy, listening state on `0.0.0.0:8080` after migrations and seeding, or fails with an actionable startup error instead of appearing available to nginx.
3. Configure nginx proxy locations for `/login`, `/register`, refresh/confirmation/password routes, and `/manage/*`.
4. Verify the frontend proxy resolves `webapi:8080`, forwards `POST /register`, and only becomes reachable after the API healthcheck passes.
5. Document recovery and verification commands for stale images, failed migrations, and unhealthy containers.

### Out of scope

- Changing application behavior or business logic unrelated to startup/proxy.
- Replacing Docker, nginx, or the existing compose configuration model.
- Adding new external services or dependencies not listed in `specs/tech-stack.md`.
- Implementing new API features beyond what is needed to verify the proxy works.
- Multi-architecture build changes (those are handled in CI/Phase 4).

## 4. Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | Reproduce the failure on both published and locally built compose images before fixing. | Confirms the issue is not environment-specific and the fix works universally. |
| **D2** | Use `GET /health` as the readiness signal for both the API container and the frontend proxy chain. | Simple, testable, and consistent with existing conventions in `tech-stack.md`. |
| **D3** | Configure nginx proxy locations in a dedicated `nginx.conf` rather than hard-coding in Dockerfiles or compose. | Follows standard Docker/nginx separation of concerns; easier to maintain and review. |
| **D4** | Auth routes (`/login`, `/register`, `/manage/*`) are proxied through nginx alongside public API routes. | Aligns with Identity endpoints requirement from `tech-stack.md` and ensures the frontend can access all needed routes. |
| **D5** | Recovery commands are documented in the spec file and verified by execution, not assumed. | A recovery procedure that isn't tested isn't a recovery procedure. |

## 5. Context

From `specs/mission.md`:
- The mission requires a self-hostable product that works in ~5 minutes via Docker.
- A 502 error violates the "one command to start" principle.

From `specs/tech-stack.md`:
- API container is published on port `8080` inside the compose network.
- Frontend is published on host port `8081` via nginx.
- `GET /health` is the liveness endpoint exposed by the API.
- CORS policy `AllowFrontend` uses the `AllowedOrigin` config key (default `http://localhost:4200`).
- Identity routes (`/login`, `/register`, `/manage/*`) must be accessible through the proxy.

The failure mode is: nginx starts before the API is ready, or the API does not listen on the expected interface/port, resulting in `502 Connection refused` for any client request routed through `http://localhost:8081`.

## 6. Risks

| Risk | Mitigation |
|---|---|
| API takes longer to start than nginx waits. | Configure nginx to retry and rely on healthcheck-based startup ordering. |
| Migrations or seeding fail silently, leaving API in a broken state. | Ensure API startup fails loudly with actionable errors rather than starting in a degraded state. |
| Proxy config breaks existing frontend routing. | Test all routes end-to-end before declaring the fix complete. |
| Healthcheck passes but API isn't actually ready to serve requests. | Use `/health` endpoint that validates database connectivity and dependency readiness, not just port listening. |
| Documented recovery commands don't actually recover the failure. | Execute each recovery command during validation (see `validation.md`). |

## 7. Done means

A clean `docker compose up -d` (and after a local rebuild) results in both services being `healthy`, `POST /register` receives an API response through `http://localhost:8081`, the API logs contain no upstream-startup failure, and recovery commands are documented and verified. See `validation.md` for the full acceptance checklist.