# Plan — Docker API Startup & Proxy Reliability

## Overview
This phase ensures that a Docker Compose deployment reliably starts the API and that nginx can forward requests without returning `502 Connection refused` errors.

## Task Group 1 — Reproduce and diagnose the failure

| # | Task | Description |
|---|------|-------------|
| 1.1 | Capture failure state | Run `docker compose up -d` and capture `docker compose ps` and `docker compose logs webapi` to reproduce the 502 error. |
| 1.2 | Identify root cause | Examine API logs for upstream-startup failures, check container health, and verify the API container is listening on `0.0.0.0:8080`. |
| 1.3 | Document reproduction steps | Write down the exact commands and observations needed to reproduce the issue for future debugging. |

## Task Group 2 — Fix API startup and health checks

| # | Task | Description |
|---|------|-------------|
| 2.1 | Health endpoint | Ensure the API exposes a reliable `/health` endpoint that reports the service is ready. |
| 2.2 | Container startup verification | After migrations and seed data, confirm the API container reaches a healthy, listening state on `0.0.0.0:8080`. |
| 2.3 | Recovery procedure | Document commands to rebuild stale images, re-seed the database, and bring the API back online. |

## Task Group 3 — Configure nginx proxy

| # | Task | Description |
|---|------|-------------|
| 3.1 | Proxy configuration | Add nginx proxy locations for `/login`, `/register`, refresh/confirmation/password routes, and `/manage/*` under `nginx.conf`. |
| 3.2 | Forwarding verification | Confirm that `http://localhost:8081` (frontend) correctly forwards `POST /register` and other API calls through the API at `http://localhost:8080`. |
| 3.3 | Readiness probe | Ensure the frontend health check (`/health`) is accessible only after the API healthcheck passes. |

## Task Group 4 — Verification and documentation

| # | Task | Description |
|---|------|-------------|
| 4.1 | Acceptance criteria | Both services become `healthy`, `POST /register` responds through `http://localhost:8081`, and API logs contain no upstream-startup failures. |
| 4.2 | Test the flow | End-to-end test: register a user via the frontend, then call the API to confirm the registration succeeded. |
| 4.3 | Documentation | Record the recovery and verification commands for stale images, failed migrations, and unhealthy containers. |

## Timeline
- **Day 1**: Reproduce failure, diagnose root cause, fix API startup
- **Day 2**: Implement nginx proxy configuration, verify end-to-end flow
- **Day 3**: Finalize documentation, run acceptance tests, prepare for merge

## Success Criteria
- Clean `docker compose up -d` results in a healthy API container on port 8080
- Frontend proxy correctly forwards API requests and handles auth flows
- All Phase 5 acceptance criteria met (see `validation.md`)