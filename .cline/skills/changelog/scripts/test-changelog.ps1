#Requires -Version 5.1
<#
.SYNOPSIS
    Validates the structure of CHANGELOG.md and its commit coverage.

.DESCRIPTION
    Checks that CHANGELOG.md starts with '# Changelog', that every section heading
    is '## YYYY-MM-DD' and that headings run newest first, that every bullet ends
    with its short commit SHA '(abc1234)' and that no SHA is recorded twice.
    Unless -SkipCommitCoverage is used, it also checks that every commit in the
    given revspec is recorded - using the same filters as
    get-changelog-entries.ps1 so both agree on what must appear.

    Driven by the `changelog` skill; see ../SKILL.md.

.PARAMETER RepoRoot
    Repository root. Defaults to `git rev-parse --show-toplevel`.

.PARAMETER ChangelogPath
    Changelog file to validate. Defaults to CHANGELOG.md in RepoRoot.

.PARAMETER Rev
    Revspec used for the coverage check. Defaults to HEAD.

.PARAMETER ExcludePattern
    Case-insensitive regex of subjects excluded from the coverage check. Must
    match the pattern used by get-changelog-entries.ps1.

.PARAMETER IncludeMerges
    Expect merge commits to be recorded as well.

.PARAMETER Order
    Section order the file is expected to use: newest-first (default) or
    oldest-first. Match it to whatever get-changelog-entries.ps1 used.

.PARAMETER SkipCommitCoverage
    Only validate the file structure, do not look at git history.

.OUTPUTS
    'OK: ...' when the file is valid, otherwise the list of problems.

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/test-changelog.ps1
#>
[CmdletBinding()]
param(
    [string]$RepoRoot,
    [string]$ChangelogPath,
    [string]$Rev = 'HEAD',
    [string]$ExcludePattern = '(?i)\bchangelog\b',
    [switch]$IncludeMerges,
    [ValidateSet('newest-first', 'oldest-first')]
    [string]$Order = 'newest-first',
    [switch]$SkipCommitCoverage
)

$ErrorActionPreference = 'Stop'

function Resolve-RepoRoot {
    param([string]$Explicit)

    if ($Explicit) { return (Resolve-Path -LiteralPath $Explicit).Path }

    $top = & git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $top) { return (Resolve-Path -LiteralPath $top).Path }

    return (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..\..')).Path
}

$root = Resolve-RepoRoot -Explicit $RepoRoot
if (-not $ChangelogPath) { $ChangelogPath = Join-Path $root 'CHANGELOG.md' }
$name = [System.IO.Path]::GetFileName($ChangelogPath)

$problems = New-Object System.Collections.Generic.List[string]

if (-not (Test-Path -LiteralPath $ChangelogPath)) {
    Write-Output ("FAIL: {0} not found at {1}" -f $name, $ChangelogPath)
    exit 1
}

$text = [System.IO.File]::ReadAllText($ChangelogPath, [System.Text.Encoding]::UTF8)
$lines = @($text -split "\r?\n")

if ($lines.Count -eq 0 -or $lines[0] -ne '# Changelog') {
    $first = ''
    if ($lines.Count -gt 0) { $first = $lines[0] }
    $problems.Add("$name must start with '# Changelog' (found '$first').")
}

$dateKeys = New-Object System.Collections.Generic.List[string]
$shas = New-Object System.Collections.Generic.List[string]
$entryCount = 0

foreach ($line in $lines) {
    if ($line -match '^##(?!#)\s*(.+?)\s*$') {
        if ($line -match '^##\s+(\d{4}-\d{2}-\d{2})\s*$') {
            $dateKeys.Add($Matches[1])
        }
        else {
            $problems.Add("Invalid date heading '$($line.Trim())' - expected '## YYYY-MM-DD'.")
        }
        continue
    }

    if ($line -match '^[-*]\s+') {
        $entryCount++
        if ($line -match '\(([0-9a-fA-F]{7,40})\)\s*$') {
            $shas.Add($Matches[1])
        }
        else {
            $problems.Add("Bullet without a trailing short SHA: '$($line.Trim())'.")
        }
    }
}

for ($i = 1; $i -lt $dateKeys.Count; $i++) {
    $comparison = [string]::CompareOrdinal($dateKeys[$i], $dateKeys[$i - 1])

    if ($Order -eq 'newest-first' -and $comparison -gt 0) {
        $problems.Add("Date headings must run newest first: '$($dateKeys[$i])' appears after '$($dateKeys[$i - 1])'.")
    }
    elseif ($Order -eq 'oldest-first' -and $comparison -lt 0) {
        $problems.Add("Date headings must run oldest first: '$($dateKeys[$i])' appears after '$($dateKeys[$i - 1])'.")
    }
}

foreach ($duplicate in ($shas | Group-Object | Where-Object { $_.Count -gt 1 })) {
    $problems.Add("Commit $($duplicate.Name) is recorded more than once.")
}

if (-not $SkipCommitCoverage) {
    $previous = [Console]::OutputEncoding
    try {
        [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
        $log = @(& git --no-pager -C $root log $Rev --pretty=format:'%h|%s')
        if ($LASTEXITCODE -ne 0) { throw "git log failed for revspec '$Rev'." }
    }
    finally {
        if ($previous) { [Console]::OutputEncoding = $previous }
    }

    foreach ($line in $log) {
        if (-not $line) { continue }

        $parts = $line -split '\|', 2
        $sha = $parts[0].Trim()
        $subject = ''
        if ($parts.Count -gt 1) { $subject = $parts[1] }

        if (-not $sha) { continue }
        if (-not $IncludeMerges -and $subject -match '^Merge ') { continue }
        if ($ExcludePattern -and $subject -match $ExcludePattern) { continue }

        $recorded = $false
        foreach ($recordedSha in $shas) {
            if ($recordedSha.StartsWith($sha, [StringComparison]::OrdinalIgnoreCase) -or
                $sha.StartsWith($recordedSha, [StringComparison]::OrdinalIgnoreCase)) {
                $recorded = $true
                break
            }
        }

        if (-not $recorded) {
            $problems.Add("Commit $sha is missing from $name`: $subject")
        }
    }
}

if ($problems.Count -eq 0) {
    Write-Output ("OK: {0} has {1} date section(s) and {2} entries." -f $name, $dateKeys.Count, $entryCount)
    return
}

Write-Output ("FAIL: {0} problem(s) found in {1}." -f $problems.Count, $name)
foreach ($problem in $problems) { Write-Output "  - $problem" }
exit 1
