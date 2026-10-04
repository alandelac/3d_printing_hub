# Plan — Global Timestamp Formatter

## Overview
This phase standardises date rendering across the application so that ISO timestamps are displayed as `YYYY-MM-DD` in one place and reused everywhere instead of being formatted ad hoc in templates.

## Task Group 1 — Confirm the date-formatting hotspot

| # | Task | Description |
|---|------|-------------|
| 1.1 | Inventory current formatting | Search the Angular client for inline date rendering logic and identify every template or utility that currently converts ISO timestamps to display text. |
| 1.2 | Define the shared contract | Decide on the single formatting utility and pipe shape: a formatter that takes an ISO timestamp and returns `YYYY-MM-DD` consistently. |
| 1.3 | Separate presentation from data | Confirm that views only render the formatted string and never own date-formatting logic themselves. |

## Task Group 2 — Implement the shared formatter

| # | Task | Description |
|---|------|-------------|
| 2.1 | Add shared utility | Create a reusable formatter in the Angular client, outside feature components, so the pattern is defined once. |
| 2.2 | Add Angular pipe | Expose a pipe that formats timestamps for templates in a consistent, reusable API. |
| 2.3 | Preserve edge cases | Ensure invalid, null or empty values are handled gracefully without throwing or producing broken UI. |

## Task Group 3 — Replace repeated formatting

| # | Task | Description |
|---|------|-------------|
| 3.1 | Remove ad hoc template formatting | Update existing date displays that currently format values inline to use the shared formatter/pipe. |
| 3.2 | Remove duplicated logic | Delete any duplicate date-formatting helper code in feature templates or components that is no longer needed after centralisation. |
| 3.3 | Keep UI behavior stable | Check all updated screens still show the expected date text after the change. |

## Task Group 4 — Test and validation

| # | Task | Description |
|---|------|-------------|
| 4.1 | Unit coverage | Add Vitest tests covering valid timestamps, null/empty values and invalid input handling. |
| 4.2 | Template verification | Confirm rendered values in affected components use the shared formatter and match the required `YYYY-MM-DD` output. |
| 4.3 | CI and coverage | Ensure the frontend test suite still passes and global coverage remains at or above 80%. |

## Timeline
- **Day 1**: Audit existing date formatting and implement the shared formatter + pipe
- **Day 2**: Replace duplicated ad hoc formatting across templates and run focused frontend tests
- **Day 3**: Final review, validation and merge readiness

## Success Criteria
- A single shared formatter defines the app-wide date output
- No inline date formatting remains in feature templates
- Unit tests cover the formatter and the UI continues to display the expected date strings
- The frontend suite passes with coverage maintained at or above 80%