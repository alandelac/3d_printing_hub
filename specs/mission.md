# Mission — 3D Printing Hub

> **One-liner:** A free, forkable, self-hostable hub that any maker can run in ~5 minutes to see whether their 3D printing actually makes money.

## The problem

Small-scale 3D printing is a business that hides its own numbers. Filament is bought in spools, consumed across many prints, and rarely tracked per job; production cost is a guess; stock is counted by eye; and sales are remembered rather than recorded — including whether the buyer actually paid.

3D Printing Hub exists to make those numbers visible, in one place, with no accountant, no spreadsheet archaeology and no paid service.

## Who it's for

**Primary audience:** hobbyist makers and solo sellers who run their own instance.

- They install it themselves: clone, configure, one command, done.
- They own their data: everything lives in a local SQLite file, on their machine or their own VPS.
- They are technical enough to run Docker and edit a config file, but they are not developers and will not read the source to learn how the app works.

**Explicitly not for:** teams and multi-user operations, and businesses wanting a hosted SaaS. The assumed unit of deployment is **one self-hosted instance for one operator**, even if it is freely forked and shared.

## What it does

Inventory and records for a 3D printing business:

- **Filaments** — brands, material types, colors, technical profiles, spool weight tracked down to the gram, purchase cost and buy-again signals.
- **Models** — a library of printable models with estimated weight/time, commercial-license flag, production cost and default sale price.
- **Product stock** — what is actually printed and on the shelf, its cost to produce, and its recommended vs. real sale price.
- **Marketplaces** — where a stocked product is published.
- **Print jobs** — what was printed, with which filament, and what it cost in material.
- **Clients** — who buys, what they bought, and who still owes money.
- **Sales** — a registry of what was sold, at what price, and whether the payment arrived.
- **Settings** — the pricing parameters driving the numbers above.

## Scope

**In scope now and near-term**

- Filament, model, stock, marketplace and settings management.
- Print job registry.
- Client registry.
- Sales registry with payment tracking.

**Out of scope**

- Multi-tenancy and per-tenant data isolation.
- Billing, subscriptions and any paid tier.
- External integrations (explicitly noted in `README.md` as a *near-future* enhancement, not a current feature).
- Automated or ML-driven pricing.

## Principles

1. **Zero external dependencies to work.** If someone clones the repo, they get a running app without signing up for anything.
2. **One command to start.** The Docker path is the blessed path and must stay current.
3. **No secrets in the repository.** Ever. Config arrives through environment variables and a documented example file.
4. **Boring, upgradeable data.** Schema changes ship as EF Core migrations that run automatically on boot.
5. **Layers are not negotiable.** Domain → Application → Infrastructure → Api, and the documented client layering, are the map for where code belongs.
6. **Discoverable features.** A feature nobody can find is not finished: it needs a route, a place in the nav, and a README line.
7. **Verified by tests.** A green `dotnet test` and `npm test` are the definition of done, not a nice-to-have.

## Success signals

- A new user reaches a working instance and registers their own account in under 5 minutes using only the README.
- `dotnet test` and `npm test` run in CI and are green on `main`.
- Adding a domain concept predictably touches Domain → Application → Infrastructure → Api, plus `domain/models` and a repository on the client.
- The repository contains no credentials, no personal data and no machine-specific paths.
- Every feature named in `README.md` exists and is reachable from the UI.
