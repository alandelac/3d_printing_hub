#Requires -Version 5.1
<#
.SYNOPSIS
    Builds CHANGELOG.md date sections from git history.

.DESCRIPTION
    Groups commits by author date (newest date first), skips commits that are
    already recorded in CHANGELOG.md - the dedupe key is the short SHA written
    in parentheses at the end of every bullet - and either prints the markdown
    for the new entries or updates CHANGELOG.md in place.

    Driven by the `changelog` skill; see ../SKILL.md for the full process.

.PARAMETER RepoRoot
    Repository root. Defaults to `git rev-parse --show-toplevel`.

.PARAMETER ChangelogPath
    Changelog file to read and update. Defaults to CHANGELOG.md in RepoRoot.

.PARAMETER Rev
    Any git revspec: HEAD, main..HEAD, a SHA range. Defaults to HEAD.

.PARAMETER ExcludePattern
    Case-insensitive regex of subjects to skip. Defaults to commits that mention
    the changelog itself, so the bookkeeping commit never records itself.
    Pass an empty string to disable.

.PARAMETER IncludeMerges
    Also record merge commits (skipped by default).

.PARAMETER Order
    newest-first (default, the repository convention) or oldest-first.

.PARAMETER Write
    Rewrite CHANGELOG.md instead of printing the new entries.

.OUTPUTS
    New entries as markdown, or a one line summary when -Write is used.

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/get-changelog-entries.ps1 -Rev "main..HEAD"

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .cline/skills/changelog/scripts/get-changelog-entries.ps1 -Write
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
    [switch]$Write
)

$ErrorActionPreference = 'Stop'

$headerLines = @(
    '# Changelog'
    ''
    'All notable changes to **3D Printing Hub** are recorded here, grouped by the date the work'
    'landed. Every bullet keeps its commit subject and short SHA, so any line can be traced back'
    'to the commit that produced it.'
)

function Resolve-RepoRoot {
    param([string]$Explicit)

    if ($Explicit) { return (Resolve-Path -LiteralPath $Explicit).Path }

    $top = & git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $top) { return (Resolve-Path -LiteralPath $top).Path }

    return (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..\..')).Path
}

function ConvertTo-BulletSubject {
    param([string]$Subject, [int]$MaxLength = 100)

    $line = ($Subject -split "\r?\n")[0]
    $line = ($line -replace '\s+', ' ').Trim().TrimEnd('.')

    if ($line.Length -gt $MaxLength) {
        $line = $line.Substring(0, $MaxLength - 3).TrimEnd() + '...'
    }

    return $line
}

function Read-ChangelogSections {
    param([string]$Path)

    $preamble = New-Object System.Collections.Generic.List[string]
    $sections = New-Object System.Collections.Generic.List[object]

    if (Test-Path -LiteralPath $Path) {
        $text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
        $current = $null

        foreach ($line in ($text -split "\r?\n")) {
            if ($line -match '^##\s+(\d{4}-\d{2}-\d{2})\s*$') {
                $current = [pscustomobject]@{
                    DateKey = $Matches[1]
                    Heading = $line.TrimEnd()
                    Body    = New-Object System.Collections.Generic.List[string]
                }
                $sections.Add($current)
            }
            elseif ($null -ne $current) {
                $current.Body.Add($line)
            }
            else {
                $preamble.Add($line)
            }
        }
    }

    return [pscustomobject]@{ Preamble = $preamble; Sections = $sections }
}

function Get-ExistingShas {
    param([string]$Path)

    $shas = New-Object 'System.Collections.Generic.HashSet[string]' (,[StringComparer]::OrdinalIgnoreCase)

    if (Test-Path -LiteralPath $Path) {
        $text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
        foreach ($match in [regex]::Matches($text, '\(([0-9a-fA-F]{7,40})\)')) {
            [void]$shas.Add($match.Groups[1].Value)
        }
    }

    # The leading comma stops PowerShell from unrolling the (possibly empty)
    # HashSet into the pipeline, which would hand back $null.
    return , $shas
}

function Get-GitLog {
    param([string]$Root, [string]$Revspec)

    $previous = [Console]::OutputEncoding
    try {
        [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
        $output = & git --no-pager -C $Root log $Revspec --date=short --pretty=format:'%ad|%h|%s'
        if ($LASTEXITCODE -ne 0) { throw "git log failed for revspec '$Revspec'." }
    }
    finally {
        if ($previous) { [Console]::OutputEncoding = $previous }
    }

    return @($output)
}

$root = Resolve-RepoRoot -Explicit $RepoRoot
if (-not $ChangelogPath) { $ChangelogPath = Join-Path $root 'CHANGELOG.md' }

$existingShas = Get-ExistingShas -Path $ChangelogPath
$existing = Read-ChangelogSections -Path $ChangelogPath

# Collect the commits that are not recorded yet, grouped by author date.
$entries = @{}
$skipped = New-Object System.Collections.Generic.List[string]

foreach ($line in (Get-GitLog -Root $root -Revspec $Rev)) {
    if (-not $line) { continue }

    $parts = $line -split '\|', 3
    if ($parts.Count -lt 3) { continue }

    $date = $parts[0].Trim()
    $sha = $parts[1].Trim()
    $subject = $parts[2]

    if (-not $date -or -not $sha) { continue }
    if (-not $IncludeMerges -and $subject -match '^Merge ') { $skipped.Add("$sha merge commit"); continue }
    if ($ExcludePattern -and $subject -match $ExcludePattern) { $skipped.Add("$sha $subject"); continue }
    if ($existingShas.Contains($sha)) { continue }

    $clean = ConvertTo-BulletSubject -Subject $subject
    if (-not $clean) { $clean = '(no subject)' }

    if (-not $entries.ContainsKey($date)) {
        $entries[$date] = New-Object System.Collections.Generic.List[string]
    }

    # git log lists commits newest first, so inserting at the front leaves every
    # date section in oldest-first order - the repository convention.
    $entries[$date].Insert(0, ('- {0} ({1})' -f $clean, $sha))
}

Write-Verbose ("Skipped {0} commit(s) by policy:" -f $skipped.Count)
foreach ($item in $skipped) { Write-Verbose "  - $item" }

$newDates = @($entries.Keys | Sort-Object)
if ($newDates.Count -eq 0) {
    Write-Output ("No new commits to record for '{0}'." -f $Rev)
    return
}

# Merge the new bullets into the parsed sections, creating date sections as needed.
$sections = New-Object System.Collections.Generic.List[object]
foreach ($section in $existing.Sections) { $sections.Add($section) }

foreach ($date in $newDates) {
    $target = $sections | Where-Object { $_.DateKey -eq $date } | Select-Object -First 1

    if ($null -eq $target) {
        $target = [pscustomobject]@{
            DateKey = $date
            Heading = "## $date"
            Body    = New-Object System.Collections.Generic.List[string]
        }
        $sections.Add($target)
    }

    while ($target.Body.Count -gt 0 -and -not $target.Body[$target.Body.Count - 1].Trim()) {
        $target.Body.RemoveAt($target.Body.Count - 1)
    }
    foreach ($bullet in $entries[$date]) { $target.Body.Add($bullet) }
}

if ($Order -eq 'newest-first') {
    $ordered = @($sections | Sort-Object -Property DateKey -Descending)
}
else {
    $ordered = @($sections | Sort-Object -Property DateKey)
}

# Preamble: keep the heading block the file already had, otherwise use the header
# from this script. A file that exists but holds only blank lines counts as empty.
$hasPreamble = $false
foreach ($line in $existing.Preamble) {
    if ($line.Trim()) {
        $hasPreamble = $true
        break
    }
}

$preamble = New-Object System.Collections.Generic.List[string]
if ($hasPreamble) {
    foreach ($line in $existing.Preamble) { $preamble.Add($line) }
}
else {
    foreach ($line in $headerLines) { $preamble.Add($line) }
}
while ($preamble.Count -gt 0 -and -not $preamble[$preamble.Count - 1].Trim()) {
    $preamble.RemoveAt($preamble.Count - 1)
}

$output = New-Object System.Collections.Generic.List[string]
foreach ($line in $preamble) { $output.Add($line) }

foreach ($section in $ordered) {
    $body = New-Object System.Collections.Generic.List[string]
    foreach ($line in $section.Body) { $body.Add($line) }
    while ($body.Count -gt 0 -and -not $body[0].Trim()) { $body.RemoveAt(0) }
    while ($body.Count -gt 0 -and -not $body[$body.Count - 1].Trim()) { $body.RemoveAt($body.Count - 1) }

    $output.Add('')
    $output.Add($section.Heading)
    foreach ($line in $body) { $output.Add($line) }
}

$text = ($output -join "`n") + "`n"

if ($Write) {
    [System.IO.File]::WriteAllText($ChangelogPath, $text, (New-Object System.Text.UTF8Encoding($false)))
    $total = ($newDates | ForEach-Object { $entries[$_].Count } | Measure-Object -Sum).Sum
    Write-Output ("Updated {0}: +{1} entries across {2} date section(s)." -f [System.IO.Path]::GetFileName($ChangelogPath), $total, $newDates.Count)
    return
}

# Dry run: print exactly what would land in the file.
$preview = New-Object System.Collections.Generic.List[string]
foreach ($date in $newDates) {
    $preview.Add("## $date")
    foreach ($bullet in $entries[$date]) {
        $preview.Add($bullet)
    }
    $preview.Add('')
}

$preview -join "`n"
