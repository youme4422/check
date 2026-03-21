param(
  [string]$ServerEnvPath = "server/.env"
)

if (-not (Test-Path $ServerEnvPath)) {
  Write-Error "Not found: $ServerEnvPath"
  exit 1
}

$lines = Get-Content $ServerEnvPath
$map = @{}
foreach ($line in $lines) {
  if ([string]::IsNullOrWhiteSpace($line)) { continue }
  if ($line.Trim().StartsWith("#")) { continue }
  $idx = $line.IndexOf("=")
  if ($idx -lt 1) { continue }
  $k = $line.Substring(0, $idx).Trim()
  $v = $line.Substring($idx + 1).Trim()
  $map[$k] = $v
}

$required = @(
  "SERVER_API_KEY",
  "PGHOST",
  "PGPORT",
  "PGDATABASE",
  "PGUSER",
  "PGPASSWORD",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET"
)

$missing = @()
foreach ($k in $required) {
  if (-not $map.ContainsKey($k) -or [string]::IsNullOrWhiteSpace([string]$map[$k])) {
    $missing += $k
  }
}

Write-Host "=== Server Env Check ==="
if ($missing.Count -eq 0) {
  Write-Host "OK: required server keys are set." -ForegroundColor Green
} else {
  Write-Host "Missing keys:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host ""
Write-Host "=== App(EAS) Env to set ==="
Write-Host "EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL=https://<your-domain>"
if ($map.ContainsKey("SERVER_API_KEY") -and -not [string]::IsNullOrWhiteSpace([string]$map["SERVER_API_KEY"])) {
  Write-Host "EXPO_PUBLIC_MESSENGER_SERVER_API_KEY=<SERVER_API_KEY is ready>"
} else {
  Write-Host "EXPO_PUBLIC_MESSENGER_SERVER_API_KEY=<missing: SERVER_API_KEY>"
}

Write-Host ""
Write-Host "=== Next ==="
Write-Host "1) Deploy server (Render) and get https domain"
Write-Host "2) Set EAS env vars above"
Write-Host "3) Run: npm run build:android"
