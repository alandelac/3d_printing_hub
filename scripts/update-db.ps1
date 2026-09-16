# update-db.ps1
<#
.SYNOPSIS
    Applies the EF Core migrations to the local SQLite database.

.DESCRIPTION
    Runs `dotnet ef database update` against the SQLite database used by the API
    (src/3DPrintingHub.Api/printinghub.db). The connection string is resolved from
    the repository root, so the script behaves identically no matter which
    directory it is invoked from.

    The API already applies migrations on boot; this script exists to author and
    apply new migrations during development, and to inspect the SQLite file.

.EXAMPLE
    ./scripts/update-db.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot     = Split-Path -Parent $PSScriptRoot
$apiFolder    = Join-Path $repoRoot 'src/3DPrintingHub.Api'
$infraFolder  = Join-Path $repoRoot 'src/3DPrintingHub.Infrastructure'
$apiProject   = Join-Path $apiFolder '3DPrintingHub.Api.csproj'
$infraProject = Join-Path $infraFolder '3DPrintingHub.Infrastructure.csproj'
$databasePath = Join-Path $apiFolder 'printinghub.db'

foreach ($folder in @($apiFolder, $infraFolder)) {
    if (-not (Test-Path -LiteralPath $folder -PathType Container)) {
        throw "Project folder not found: $folder"
    }
}

Write-Host "Applying migrations to SQLite database: $databasePath" -ForegroundColor Cyan

dotnet ef database update `
    --project $infraProject `
    --startup-project $apiProject `
    --connection "Data Source=$databasePath"

if ($LASTEXITCODE -ne 0) {
    throw "dotnet ef database update failed with exit code $LASTEXITCODE."
}

Write-Host 'Migrations applied. API -> http://localhost:5033' -ForegroundColor Green
