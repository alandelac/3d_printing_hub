# Validation — Docker API Startup & Proxy Reliability

## Roadmap Phase 5 Acceptance

> A compose deployment does not serve a `502 Connection refused` when nginx forwards requests to the API.
> From a clean `docker compose up -d` (and after a local rebuild), both services become `healthy`, `POST /register` receives an API response through `http://localhost:8081`, and the API logs contain no upstream-startup failure.

## Execution summary

This repository does not yet meet Phase 5 acceptance criteria. The docker compose proxy chain is unreliable — nginx returns `502 Connection refused` when forwarding requests to the API before the API is ready. Validation requires running the compose stack and verifying the end-to-end flow.

## Local checks executed

Run from the repository root:

1. [ ] `docker compose up -d`
   - Result: to be executed.
   - Evidence: capture output of `docker compose ps` and `docker compose logs webapi`.
2. [ ] Verify API health endpoint
   - Run: `curl http://localhost:8080/health` (or equivalent from within the compose network)
   - Expected: HTTP 200, container status `healthy`.
   - Evidence: health endpoint returns success and API logs show readiness.
3. [ ] Verify frontend proxy forwarding
   - Run: `curl -X POST http://localhost:8081/register` with registration payload
   - Expected: API response received through proxy (not 502).
   - Evidence: successful registration response from the API through nginx.
4. [ ] Verify auth routes proxy
   - Run: `curl -X POST http://localhost:8081/login` with credentials
   - Run: `curl http://localhost:8081/register/confirm`
   - Expected: requests reach the Identity endpoints through nginx.
   - Evidence: successful proxy to `/login`, `/register`, `/manage/*` routes.
5. [ ] Verify startup ordering
   - Restart compose: `docker compose down && docker compose up -d`
   - Expected: nginx does not return 502 while API is starting.
   - Evidence: no upstream-startup errors in `docker compose logs webapi`.
6. [ ] Verify recovery commands
   - Run documented recovery commands (stale image rebuild, migration re-run).
   - Expected: service recovers without manual intervention.
   - Evidence: recovery steps documented in `plan.md` Task Group 2.3 and verified.

## Failure-path evidence

| Check | Expected Failure Evidence |
|---|---|
| `docker compose up -d` | Both services should eventually show `healthy` status, not `502`. |
| `POST /register` through proxy | Should return API response, not connection refused. |
| `docker compose logs webapi` | Should contain no upstream-startup failure messages. |
| Restart sequence | No 502 errors during API startup window. |

## Branch protection / repository settings

- [x] Not applicable: branch protection is configured at the GitHub level and is not a code deliverable for this phase.

## Merge checklist status

- [ ] `docker compose up -d` results in both services showing `healthy` status.
- [ ] `POST /register` succeeds through `http://localhost:8081`.
- [ ] `POST /login` and other Identity routes are proxied correctly.
- [ ] `docker compose logs webapi` contains no upstream-startup failure.
- [ ] Recovery commands documented and verified.
- [ ] No new external dependencies added without tech-stack decision.
- [ ] All task groups in `plan.md` completed.
- [ ] `requirement.md` scope, decisions, and context reviewed and confirmed.
- [ ] No application behavior changed beyond startup/proxy reliability.

## Validation against mission and tech-stack

From `specs/mission.md`:
- [ ] One command to start: `docker compose up -d` works reliably.
- [ ] No secrets in repository: no credentials changed in this phase.
- [ ] Layers are not negotiable: changes respect Domain → Application → Infrastructure → Api.

From `specs/tech-stack.md`:
- [ ] API runs on port `8080`, frontend on `8081`.
- [ ] `GET /health` endpoint is the readiness signal.
- [ ] Identity routes (`/login`, `/register`, `/manage/*`) are proxied correctly.
- [ ] CORS policy `AllowFrontend` works through the proxy.