# reset-password.ps1
<#
.SYNOPSIS
    Resets the password for a user account directly via the backend.

.DESCRIPTION
    Executes the .NET API with `--reset-password <email> <newPassword>` to securely
    hash and update the user credentials using ASP.NET Core Identity.
    Useful for self-hosted instances when an operator is locked out.

.PARAMETER Email
    The email address of the account to reset.

.PARAMETER NewPassword
    The new password for the account. If omitted, prompts securely.

.EXAMPLE
    ./scripts/reset-password.ps1 -Email "operator@example.com" -NewPassword "P@ssword123"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Email,

    [Parameter(Mandatory = $false, Position = 1)]
    [string]$NewPassword
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($NewPassword)) {
    $secPass = Read-Host -Prompt "Enter new password for $Email" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secPass)
    $NewPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($NewPassword)) {
    throw "A new password must be provided."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiProject = Join-Path $repoRoot 'src/3DPrintingHub.Api/3DPrintingHub.Api.csproj'

Write-Host "Resetting password for: $Email" -ForegroundColor Cyan

$dockerRunning = $false
try {
    $containerId = docker compose ps -q webapi 2>$null
    if ($containerId) {
        $dockerRunning = $true
    }
} catch { }

if ($dockerRunning) {
    Write-Host "Executing password reset inside active Docker container (webapi)..." -ForegroundColor Cyan
    docker compose exec webapi dotnet _3DPrintingHub.Api.dll --reset-password "$Email" "$NewPassword"
} else {
    $env:DOTNET_CLI_TELEMETRY_OPTOUT = "1"
    $env:DOTNET_ROLL_FORWARD = "Major"
    dotnet run --project "$apiProject" --no-restore -- --reset-password "$Email" "$NewPassword"
}

if ($LASTEXITCODE -ne 0) {
    throw "Password reset failed with exit code $LASTEXITCODE."
}

Write-Host "Done. You can now log in at http://localhost:4200 (or http://localhost:8081) with your new password." -ForegroundColor Green
