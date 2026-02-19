param(
  [int]$BulkPages = 40,
  [int]$BulkDelayMs = 2500,
  [int]$EnrichPages = 6,
  [int]$EnrichLookups = 20,
  [int]$EnrichDelayMs = 1800,
  [int]$MinIntervalMinutes = 30,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$refreshPath = Join-Path $PSScriptRoot "refresh-scriptblox-feed.ps1"
if (-not (Test-Path $refreshPath)) {
  throw "Could not find refresh-scriptblox-feed.ps1 in $PSScriptRoot"
}

Write-Host "Pass 1/2: bulk refresh (fast, no owner detail lookups)..."
& $refreshPath `
  -MaxPages $BulkPages `
  -DelayMs $BulkDelayMs `
  -MaxDetailLookupsPerRun 0 `
  -MinIntervalMinutes $MinIntervalMinutes `
  -Force:$Force

Write-Host "Pass 2/2: owner enrichment refresh (small, controlled detail lookups)..."
& $refreshPath `
  -MaxPages $EnrichPages `
  -DelayMs $BulkDelayMs `
  -MaxDetailLookupsPerRun $EnrichLookups `
  -DetailDelayMs $EnrichDelayMs `
  -MinIntervalMinutes 0 `
  -Force

Write-Host "Two-pass refresh completed."
