# run-front.ps1
<#
.SYNOPSIS
    Starts the Angular client for local development.

.DESCRIPTION
    Changes into src/3DPrintingHub.Client and runs `npm start` (ng serve). The
    development server listens on http://localhost:4200.

.EXAMPLE
    ./scripts/run-front.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot      = Split-Path -Parent $PSScriptRoot
$clientProject = Join-Path $repoRoot 'src/3DPrintingHub.Client'

if (-not (Test-Path -LiteralPath $clientProject -PathType Container)) {
    throw "Project folder not found: $clientProject"
}

$nodeInstall = Join-Path $env:ProgramFiles 'nodejs'
if (-not (Get-Command 'npm.cmd' -ErrorAction SilentlyContinue) -and
    (Test-Path -LiteralPath (Join-Path $nodeInstall 'node.exe') -PathType Leaf) -and
    (Test-Path -LiteralPath (Join-Path $nodeInstall 'npm.cmd') -PathType Leaf)) {
    $env:Path = "$nodeInstall;$env:Path"
}

if (-not (Get-Command 'npm.cmd' -ErrorAction SilentlyContinue)) {
    throw 'npm was not found in PATH. Install Node.js or reopen PowerShell/VS Code so its PATH is refreshed.'
}

Write-Host 'Client -> http://localhost:4200' -ForegroundColor Green

Set-Location -LiteralPath $clientProject
npm.cmd start
