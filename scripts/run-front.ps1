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

Write-Host 'Client -> http://localhost:4200' -ForegroundColor Green

Set-Location -LiteralPath $clientProject
npm start
