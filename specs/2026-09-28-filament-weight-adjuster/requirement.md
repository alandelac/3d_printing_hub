# Requirement — Filament Weight Adjuster

## 1. Scope

Phase 10 from `specs/roadmap.md` — "Adjust a spool's remaining weight from the filament table". The deliverables are:

- On the remaining-weight column: `+`, `−` and `update` buttons plus a numeric input
- `+` adds the entered amount, `−` subtracts it, `update` sets the total to the entered value
- The adjustment goes through the service layer atomically, and the resulting value is validated (never negative)

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Single numeric input with three buttons (+/−/Update) | Matches the roadmap deliverable; simplest interaction pattern |
| 2 | Adjustments logged with timestamp, user ID, and reason | Audit trail for traceability; user confirmed this requirement |
| 3 | Print job history remains immutable | Prevents data corruption; aligns with mission principle of "boring, upgradeable data" |
| 4 | Validation: never allow negative remaining weight | Core safeguard from roadmap acceptance criteria |
| 5 | Decimal precision: 1 decimal place (grams) | Matches the domain model's precision; prevents floating-point noise |
| 6 | Maximum weight: up to original spool weight | Prevents accidental overfilling; business-rule constraint |

## 3. Context

- **Mission**: A free, forkable, self-hostable hub for makers to track their 3D printing business numbers (mission.md)
- **Tech stack**: .NET 10 backend with EF Core + SQLite, Angular 22 standalone components frontend (tech-stack.md)
- **Dependency pattern**: Domain → Application → Infrastructure → Api (tech-stack.md layers)
- **Prerequisite phases**: Phases 0–9 must be complete (roadmap sequencing)
- **Related phases**: Phase 11a/11b (Clients), Phase 12a/12b (Sales), Phase 13 (Print Job Registry) — all use similar atomic stock-adjustment patterns
- **Existing code**: `filaments-page.component.html` already has a remaining-weight column and an `openAdjustWeightModal(f)` button; this phase upgrades it to `+`/`−`/`Update` controls

## 4. Out of Scope

- Bulk weight adjustments (one filament at a time only)
- Automatic weight recalculation from print job history
- User role restrictions on who can adjust weight (Phase 14)
- Pagination on filament list (deferred)
