---
name: changelog
description: >-
  Maintain the repository-root CHANGELOG.md by recording git commits under date
  headings. Use when the user asks to update, bootstrap or refresh the
  changelog, or invokes /changelog before merging a branch (for example "update
  the changelog", "record what changed before the merge", "add a changelog
  entry").
---

# Changelog

`CHANGELOG.md` lives in the repository root. It is the human-readable history of
landed work, grouped by date, and it is written from git commits - never from the
working tree and never from imagination.

Invoke it explicitly with `/changelog` in the Cline chat, or just ask to update
the changelog before a merge.

## Layout

```markdown
# Changelog

<intro paragraph>

## 2026-09-16
- Add login (41b8345)
- Create the constitution of the project (802c887)

## 2026-09-06
- fix: indices en tablas que no tenian (d847611)
```

## Rules

1. **One file, one location:** `CHANGELOG.md` in the repository root. Nothing under `specs/` or `src/`.
2. **Headings are dates:** exactly `## YYYY-MM-DD`. No version numbers, no titles, no `###` subsections.
3. **Newest first:** the most recent date is the first section of the file.
4. **One bullet per commit:** `- <commit subject> (<short-sha>)`. The `(sha)` is the dedupe key - never drop it, and never reword a bullet in a way that loses it.
5. **Append-only history:** do not rewrite, reorder or "clean up" sections for dates that are already in the file.
6. **Commits only:** if the work is not committed yet, say so and ask the user to commit before recording it. Never invent an entry and never record uncommitted changes.
7. **No secrets:** if a bullet would expose a credential, host name or personal datum, replace that fragment with `[redacted]` and keep the SHA.

## Process

### 1. Pick the range

- **Bootstrap (no `CHANGELOG.md` yet):** all of `HEAD` (the script default).
- **Before merging a feature branch:** the commits the branch adds on top of `main`, so `-Rev "main..HEAD"`. Substitute the real base branch when it is not `main`.

### 2. Generate

The script groups commits by author date, drops merge commits, drops commits that
mention the changelog itself (so the bookkeeping commit never records itself) and
skips every SHA already present in the file.

```powershell
# dry run - prints only the markdown that would be added
powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/get-changelog-entries.ps1 -Rev "main..HEAD"

# audit what was deliberately skipped
powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/get-changelog-entries.ps1 -Rev "main..HEAD" -Verbose
```

### 3. Review before writing

Read the dry-run output and check that:

- there are no merge commits and no `update changelog` noise;
- every bullet is a real commit subject (truncation at 100 characters is expected, invented text is not);
- the dates are right (author dates, not the merge date).

A subject that is uninformative (`wip`, `fix typo`) may be replaced by a clearer
phrase describing the same commit - keep the SHA. Never add a bullet that has no
commit behind it; if you cannot describe a commit, leave its original subject.

### 4. Write

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/get-changelog-entries.ps1 -Rev "main..HEAD" -Write
git --no-pager diff -- CHANGELOG.md
```

The script creates `CHANGELOG.md` with the standard header when the file does not
exist, appends bullets to an existing date section, and inserts brand-new date
sections in the correct position.

### 5. Validate

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/test-changelog.ps1 -Rev "main..HEAD"
```

It must print `OK: ...`. It fails when a heading is not `## YYYY-MM-DD`, when
headings are not newest first, when a bullet has no trailing `(sha)`, when a SHA
appears twice, or when a commit in the range is missing from the file.

### 6. Hand back

Do not commit the changelog unless the user asks. Report the entries added, the
dates touched and the file path, and suggest a commit message such as
`docs: update CHANGELOG.md for YYYY-MM-DD`.

## Scripts

| Script | Purpose |
| --- | --- |
| `scripts/get-changelog-entries.ps1` | Builds the date sections from git history. Dry run by default; `-Write` updates the file. |
| `scripts/test-changelog.ps1` | Validates structure and commit coverage. Exits non-zero on failure. |

Parameters shared by both scripts: `-Rev <revspec>`, `-ChangelogPath <path>`,
`-RepoRoot <path>`, `-ExcludePattern <regex>`, `-IncludeMerges`.
`get-changelog-entries.ps1` also takes `-Order newest-first|oldest-first`
(`newest-first` is the repository convention) and `-Write`.
`test-changelog.ps1` also takes `-Order` (match it to the file being checked) and
`-SkipCommitCoverage`.

## Notes

- Dates come from the commit author date (`%ad` with `--date=short`).
- Sections run newest date first; inside one date the bullets run oldest commit first, matching `git log` history. A fork that prefers the opposite passes `-Order oldest-first` to both scripts.
- Subjects are taken from the first line of the commit message, whitespace-collapsed, stripped of a trailing period and truncated to 100 characters with `...`.
- The scripts are Windows PowerShell 5.1 compatible and ASCII-only. They write `CHANGELOG.md` as UTF-8 without BOM and LF line endings.
- Dedupe relies on the `(sha)` marker: if a bullet loses its SHA, the next run records the commit a second time.
