param(
  [string]$IconImage = "C:\Users\jan26\check\assets\images\icon.png",
  [string]$OutputDir = "C:\Users\jan26\check\play-store-assets"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-Brush([string]$Hex) {
  New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($Hex))
}

function Save-Png([System.Drawing.Bitmap]$Bitmap, [string]$Path) {
  $dir = Split-Path $Path -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Draw-ImageFit(
  [System.Drawing.Graphics]$Graphics,
  [System.Drawing.Image]$Image,
  [int]$TargetX,
  [int]$TargetY,
  [int]$TargetWidth,
  [int]$TargetHeight
) {
  $ratio = [Math]::Min($TargetWidth / $Image.Width, $TargetHeight / $Image.Height)
  $drawWidth = [int]([Math]::Round($Image.Width * $ratio))
  $drawHeight = [int]([Math]::Round($Image.Height * $ratio))
  $drawX = $TargetX + [int](($TargetWidth - $drawWidth) / 2)
  $drawY = $TargetY + [int](($TargetHeight - $drawHeight) / 2)
  $Graphics.DrawImage($Image, $drawX, $drawY, $drawWidth, $drawHeight)
}

function Draw-RoundedRect(
  [System.Drawing.Graphics]$Graphics,
  [int]$X,
  [int]$Y,
  [int]$Width,
  [int]$Height,
  [int]$Radius,
  [System.Drawing.Brush]$Brush
) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  try {
    $diameter = $Radius * 2
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $Graphics.FillPath($Brush, $path)
  }
  finally {
    $path.Dispose()
  }
}

function Draw-StoreShot(
  [string]$OutputPath,
  [string]$Header,
  [string]$Subhead,
  [string]$PrimaryLabel,
  [string]$SecondaryLabel,
  [string]$AccentHex
) {
  $shot = New-Object System.Drawing.Bitmap 1080, 1920
  $g = [System.Drawing.Graphics]::FromImage($shot)
  try {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#F3F7F5"))

    $darkBrush = New-Brush "#1C3B31"
    $mutedBrush = New-Brush "#5C6D64"
    $whiteBrush = New-Brush "#FFFFFF"
    $cardBrush = New-Brush "#FFFFFF"
    $softBrush = New-Brush "#ECF3EF"
    $accentBrush = New-Brush $AccentHex

    $titleFont = New-Object System.Drawing.Font("Segoe UI", 40, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $buttonFont = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    try {
      $g.DrawString("Check In Safe", $titleFont, $darkBrush, 80, 96)
      $g.DrawString($Header, $titleFont, $darkBrush, 80, 170)
      $subheadRect = New-Object System.Drawing.RectangleF 82, 245, 860, 80
      $g.DrawString($Subhead, $bodyFont, $mutedBrush, $subheadRect)

      Draw-RoundedRect -Graphics $g -X 80 -Y 380 -Width 920 -Height 1180 -Radius 42 -Brush $cardBrush

      $iconHolderBrush = New-Brush "#E7F0EC"
      Draw-RoundedRect -Graphics $g -X 130 -Y 440 -Width 820 -Height 230 -Radius 28 -Brush $iconHolderBrush
      Draw-ImageFit -Graphics $g -Image $icon -TargetX 160 -TargetY 468 -TargetWidth 160 -TargetHeight 160
      $g.DrawString("Daily safety check-in", $titleFont, $darkBrush, 360, 500)
      $g.DrawString("Record a check-in and keep your status current.", $bodyFont, $mutedBrush, 362, 570)
      $iconHolderBrush.Dispose()

      Draw-RoundedRect -Graphics $g -X 130 -Y 730 -Width 820 -Height 220 -Radius 28 -Brush $softBrush
      $g.DrawString("Last check-in", $bodyFont, $mutedBrush, 170, 780)
      $g.DrawString($PrimaryLabel, $titleFont, $darkBrush, 170, 825)
      $g.DrawString("Time left until next check-in", $bodyFont, $mutedBrush, 170, 900)
      $g.DrawString($SecondaryLabel, $titleFont, $darkBrush, 170, 945)

      Draw-RoundedRect -Graphics $g -X 130 -Y 1025 -Width 820 -Height 110 -Radius 22 -Brush $accentBrush
      $buttonRect = New-Object System.Drawing.RectangleF 130, 1048, 820, 60
      $format = New-Object System.Drawing.StringFormat
      try {
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString("Check in today", $buttonFont, $whiteBrush, $buttonRect, $format)
      }
      finally {
        $format.Dispose()
      }

      Draw-RoundedRect -Graphics $g -X 130 -Y 1190 -Width 395 -Height 120 -Radius 22 -Brush $softBrush
      Draw-RoundedRect -Graphics $g -X 555 -Y 1190 -Width 395 -Height 120 -Radius 22 -Brush $softBrush
      $g.DrawString("History", $buttonFont, $darkBrush, 250, 1230)
      $g.DrawString("Contacts", $buttonFont, $darkBrush, 655, 1230)
    }
    finally {
      $buttonFont.Dispose()
      $bodyFont.Dispose()
      $titleFont.Dispose()
      $accentBrush.Dispose()
      $softBrush.Dispose()
      $cardBrush.Dispose()
      $whiteBrush.Dispose()
      $mutedBrush.Dispose()
      $darkBrush.Dispose()
    }

    Save-Png -Bitmap $shot -Path $OutputPath
  }
  finally {
    $g.Dispose()
    $shot.Dispose()
  }
}

if (-not (Test-Path $IconImage)) {
  throw "Icon image not found: $IconImage"
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$icon = [System.Drawing.Image]::FromFile($IconImage)

try {
  $playIcon = New-Object System.Drawing.Bitmap 512, 512
  $g = [System.Drawing.Graphics]::FromImage($playIcon)
  try {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#F3F7F5"))
    Draw-RoundedRect -Graphics $g -X 28 -Y 28 -Width 456 -Height 456 -Radius 84 -Brush (New-Brush "#E7F0EC")
    Draw-ImageFit -Graphics $g -Image $icon -TargetX 70 -TargetY 70 -TargetWidth 372 -TargetHeight 372
    Save-Png -Bitmap $playIcon -Path (Join-Path $OutputDir "play-icon-512.png")
  }
  finally {
    $g.Dispose()
    $playIcon.Dispose()
  }

  $feature = New-Object System.Drawing.Bitmap 1024, 500
  $g = [System.Drawing.Graphics]::FromImage($feature)
  try {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#F3F7F5"))

    $darkBrush = New-Brush "#1C3B31"
    $mutedBrush = New-Brush "#5C6D64"
    $accentBrush = New-Brush "#1A7F64"
    $cardBrush = New-Brush "#FFFFFF"
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 44, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    try {
      Draw-RoundedRect -Graphics $g -X 565 -Y 55 -Width 400 -Height 390 -Radius 28 -Brush $cardBrush
      Draw-ImageFit -Graphics $g -Image $icon -TargetX 625 -TargetY 105 -TargetWidth 280 -TargetHeight 280

      $g.DrawString("Check In Safe", $titleFont, $darkBrush, 72, 120)
      $featureTextRect = New-Object System.Drawing.RectangleF 76, 200, 420, 100
      $g.DrawString("Keep a simple daily safety signal on schedule.", $bodyFont, $mutedBrush, $featureTextRect)
      Draw-RoundedRect -Graphics $g -X 76 -Y 305 -Width 250 -Height 56 -Radius 18 -Brush $accentBrush
      $buttonFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
      $whiteBrush = New-Brush "#FFFFFF"
      try {
        $g.DrawString("Daily check-in flow", $buttonFont, $whiteBrush, 112, 319)
      }
      finally {
        $whiteBrush.Dispose()
        $buttonFont.Dispose()
      }
    }
    finally {
      $bodyFont.Dispose()
      $titleFont.Dispose()
      $cardBrush.Dispose()
      $accentBrush.Dispose()
      $mutedBrush.Dispose()
      $darkBrush.Dispose()
    }

    Save-Png -Bitmap $feature -Path (Join-Path $OutputDir "feature-graphic-1024x500.png")
  }
  finally {
    $g.Dispose()
    $feature.Dispose()
  }

  Draw-StoreShot `
    -OutputPath (Join-Path $OutputDir "phone-screenshot-01.png") `
    -Header "Stay on schedule" `
    -Subhead "Review your latest check-in and the next deadline at a glance." `
    -PrimaryLabel "Today, 9:00 AM" `
    -SecondaryLabel "11 h 52 m" `
    -AccentHex "#1A7F64"

  Draw-StoreShot `
    -OutputPath (Join-Path $OutputDir "phone-screenshot-02.png") `
    -Header "Reach contacts fast" `
    -Subhead "Use emergency contact actions quickly when a check-in is missed." `
    -PrimaryLabel "Yesterday, 8:00 PM" `
    -SecondaryLabel "Check-in needed now" `
    -AccentHex "#8C2F39"

  $readme = @"
Generated files:
- play-icon-512.png
- feature-graphic-1024x500.png
- phone-screenshot-01.png
- phone-screenshot-02.png

Notes:
- These assets are aligned to the current app's check-in safety workflow.
- Replace generated screenshots with device captures before final submission if possible.
- Prepare a hosted HTTPS privacy policy URL before uploading to Play Console.
"@

  Set-Content -Path (Join-Path $OutputDir "README.txt") -Value $readme -Encoding UTF8
  Write-Host "Play Store assets generated in $OutputDir"
}
finally {
  $icon.Dispose()
}
