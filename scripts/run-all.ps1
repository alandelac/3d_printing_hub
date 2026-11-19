# run-all.ps1
<#
.SYNOPSIS
    Runs the whole 3D Printing Hub stack for local development.

.DESCRIPTION
    Starts the .NET API (when the .NET SDK is installed) and the Angular client.
    Each one runs in its own PowerShell window. Without the .NET SDK, only the
    client is started.

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

    $escapedTitle = $Title.Replace("'", "''")
    $escapedWorkingDirectory = $WorkingDirectory.Replace("'", "''")
    $childScript = "`$Host.UI.RawUI.WindowTitle = '$escapedTitle'; Set-Location -LiteralPath '$escapedWorkingDirectory'; $Command"
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($childScript))

    Start-Process -FilePath 'powershell.exe' -ArgumentList @(
        '-NoExit'
        '-NoProfile'
        '-EncodedCommand'
        $encodedCommand
    ) -PassThru
}

$nodeInstall = Join-Path $env:ProgramFiles 'nodejs'
if (-not (Get-Command 'node.exe' -ErrorAction SilentlyContinue) -or
    -not (Get-Command 'npm.cmd' -ErrorAction SilentlyContinue)) {
    if ((Test-Path -LiteralPath (Join-Path $nodeInstall 'node.exe') -PathType Leaf) -and
        (Test-Path -LiteralPath (Join-Path $nodeInstall 'npm.cmd') -PathType Leaf)) {
        $env:Path = "$nodeInstall;$env:Path"
    }
}

$node = Get-Command 'node.exe' -ErrorAction SilentlyContinue
$npm = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
    throw 'Node.js and npm were not found in PATH. Install Node.js or reopen PowerShell/VS Code so its PATH is refreshed.'
}

$angularCli = Join-Path $clientProject 'node_modules/.bin/ng.cmd'
if (-not (Test-Path -LiteralPath $angularCli -PathType Leaf)) {
    throw "Angular dependencies are missing. Run 'npm ci' in $clientProject, then run this script again."
}

$api = $null
if (Get-Command 'dotnet.exe' -ErrorAction SilentlyContinue) {
    $api = Start-DevWindow -Title '3DPrintingHub API' -WorkingDirectory $apiProject -Command 'dotnet run'
    Write-Host 'API -> http://localhost:5033' -ForegroundColor Green
}
else {
    Write-Warning 'The .NET SDK was not found; starting the client only. API-backed features will not work until the API is started (with .NET or Docker).'
}

$client = Start-DevWindow -Title '3DPrintingHub Client' -WorkingDirectory $clientProject -Command 'npm.cmd start'

Write-Host ''
Write-Host 'Client -> http://localhost:4200' -ForegroundColor Green

if ($Wait) {
    $processIds = @($client.Id)
    if ($api) {
        $processIds += $api.Id
    }

    Wait-Process -Id $processIds -ErrorAction SilentlyContinue
    Write-Host 'Development processes have stopped.' -ForegroundColor Yellow
}
