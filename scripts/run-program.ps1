# run-program.ps1
<#
.SYNOPSIS
    Starts the .NET API for local development.

.DESCRIPTION
    Runs `dotnet run` for src/3DPrintingHub.Api, which listens on
    http://localhost:5033 (see Properties/launchSettings.json).

.EXAMPLE
    ./scripts/run-program.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$apiProject = Join-Path $repoRoot 'src/3DPrintingHub.Api'

if (-not (Test-Path -LiteralPath $apiProject -PathType Container)) {
    throw "Project folder not found: $apiProject"
}

Write-Host 'API -> http://localhost:5033' -ForegroundColor Green

dotnet run --project $apiProject
