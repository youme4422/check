param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$ApiKey
)

$base = $BaseUrl.TrimEnd('/')

Write-Host "Checking health: $base/health"
$health = Invoke-RestMethod -Method Get -Uri "$base/health" -TimeoutSec 20
$health | ConvertTo-Json -Depth 5

Write-Host ""
Write-Host "Checking config status: $base/api/config/status"
$status = Invoke-RestMethod -Method Get -Uri "$base/api/config/status" -Headers @{ "x-api-key" = $ApiKey } -TimeoutSec 20
$status | ConvertTo-Json -Depth 10

if (-not $status.ok) {
  throw "Config status returned ok=false"
}

if (-not $status.dbConfigured) {
  throw "Database is not configured."
}

if (-not $status.channels.telegram.configured) {
  throw "Telegram is not configured."
}

if (-not $status.channels.line.configured) {
  throw "LINE is not configured."
}

Write-Host ""
Write-Host "Production checks passed." -ForegroundColor Green
