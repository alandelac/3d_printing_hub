# run-all.ps1
<#
.SYNOPSIS
    Runs the whole 3D Printing Hub stack for local development.

.DESCRIPTION
    Starts the .NET API with `dotnet run` from src/3DPrintingHub.Api and the
    Angular client with `npm start` from src/3DPrintingHub.Client. Each one runs
    in its own PowerShell window so both keep running in parallel and you can
    read their logs independently.

.PARAMETER Wait
    Keeps this console attached and waits until both development windows are
    closed, instead of returning as soon as they are launched.

.EXAMPLE
    ./scripts/run-all.ps1

.EXAMPLE
    ./scripts/run-all.ps1 -Wait
#>
[CmdletBinding()]
param(
    [switch] $Wait
)

$ErrorActionPreference = 'Stop'

# Resolve the repository root (the parent of this scripts folder) so the script
# works no matter which directory it is invoked from.
$repoRoot      = Split-Path -Parent $PSScriptRoot
$apiProject    = Join-Path $repoRoot 'src/3DPrintingHub.Api'
$clientProject = Join-Path $repoRoot 'src/3DPrintingHub.Client'

foreach ($project in @($apiProject, $clientProject)) {
    if (-not (Test-Path -LiteralPath $project -PathType Container)) {
        throw "Project folder not found: $project"
    }
}

function Start-DevWindow {
    param(
        [Parameter(Mandatory)] [string] $Title,
        [Parameter(Mandatory)] [string] $WorkingDirectory,
        [Parameter(Mandatory)] [string] $Command
    )

    Write-Host "Starting $Title ($Command) in $WorkingDirectory" -ForegroundColor Cyan

    $arguments = @(
        '-NoExit'
        '-NoProfile'
        '-Command'
        "`$Host.UI.RawUI.WindowTitle = '$Title'; Set-Location -LiteralPath '$WorkingDirectory'; & $Command"
    )

    Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -PassThru
}

$api    = Start-DevWindow -Title '3DPrintingHub API'    -WorkingDirectory $apiProject    -Command 'dotnet run'
$client = Start-DevWindow -Title '3DPrintingHub Client' -WorkingDirectory $clientProject -Command 'npm start'

Write-Host ''
Write-Host 'API    -> http://localhost:5033 (see src/3DPrintingHub.Api/Properties/launchSettings.json)' -ForegroundColor Green
Write-Host 'Client -> http://localhost:4200' -ForegroundColor Green

if ($Wait) {
    Wait-Process -Id @($api.Id, $client.Id) -ErrorAction SilentlyContinue
    Write-Host 'Both development processes have stopped.' -ForegroundColor Yellow
}
