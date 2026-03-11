param(
  [string]$OutputDir = "C:\Users\jan26\check\play-store-assets"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$W = 1080
$H = 1920
$PhoneX = 150
$PhoneY = 150
$PhoneW = 780
$PhoneH = 1620
$Inset = 34
$ScreenX = $PhoneX + $Inset
$ScreenY = $PhoneY + $Inset
$ScreenW = $PhoneW - ($Inset * 2)
$ScreenH = $PhoneH - ($Inset * 2)

function New-Brush([string]$Hex) {
  New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($Hex))
}

function New-Pen([string]$Hex, [float]$Width = 1) {
  New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($Hex)), $Width
}

function New-Font([float]$Size, [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular) {
  New-Object System.Drawing.Font("Segoe UI", $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Round([System.Drawing.Graphics]$G, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius, [System.Drawing.Brush]$Brush, [System.Drawing.Pen]$Pen) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  try {
    $d = $Radius * 2
    $path.AddArc($X, $Y, $d, $d, 180, 90)
    $path.AddArc($X + $Width - $d, $Y, $d, $d, 270, 90)
    $path.AddArc($X + $Width - $d, $Y + $Height - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $Height - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    if ($null -ne $Brush) {
      $G.FillPath($Brush, $path)
    }

    if ($null -ne $Pen) {
      $G.DrawPath($Pen, $path)
    }
  }
  finally {
    $path.Dispose()
  }
}

function Draw-Text([System.Drawing.Graphics]$G, [string]$Text, [System.Drawing.Font]$Font, [System.Drawing.Brush]$Brush, [float]$X, [float]$Y, [float]$Width, [float]$Height, [bool]$Center = $false) {
  $rect = New-Object System.Drawing.RectangleF($X, $Y, $Width, $Height)
  $format = New-Object System.Drawing.StringFormat
  try {
    if ($Center) {
      $format.Alignment = [System.Drawing.StringAlignment]::Center
    }

    $G.DrawString($Text, $Font, $Brush, $rect, $format)
  }
  finally {
    $format.Dispose()
  }
}

function Draw-Background([System.Drawing.Graphics]$G) {
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($W, $H)),
    ([System.Drawing.ColorTranslator]::FromHtml("#F7FBF8")),
    ([System.Drawing.ColorTranslator]::FromHtml("#E3F0EA"))
  )
  $soft = New-Brush "#EDF7F2"
  $mint = New-Brush "#DCEFE6"
  try {
    $G.FillRectangle($gradient, 0, 0, $W, $H)
    $G.FillEllipse($soft, -80, -30, 380, 380)
    $G.FillEllipse($mint, 760, 120, 260, 260)
    $G.FillEllipse($soft, 790, 1500, 280, 280)
  }
  finally {
    $mint.Dispose()
    $soft.Dispose()
    $gradient.Dispose()
  }
}

function Draw-Phone([System.Drawing.Graphics]$G) {
  $shadow = New-Brush "#D4E3DB"
  $frame = New-Brush "#17362C"
  $screen = New-Brush "#EEF4F0"
  $line = New-Pen "#CFDDD6" 2
  $notch = New-Brush "#0F241D"
  try {
    Draw-Round -G $G -X ($PhoneX + 18) -Y ($PhoneY + 24) -Width $PhoneW -Height $PhoneH -Radius 72 -Brush $shadow -Pen $null
    Draw-Round -G $G -X $PhoneX -Y $PhoneY -Width $PhoneW -Height $PhoneH -Radius 72 -Brush $frame -Pen $null
    Draw-Round -G $G -X $ScreenX -Y $ScreenY -Width $ScreenW -Height $ScreenH -Radius 48 -Brush $screen -Pen $line
    Draw-Round -G $G -X 425 -Y 176 -Width 230 -Height 32 -Radius 16 -Brush $notch -Pen $null
  }
  finally {
    $notch.Dispose()
    $line.Dispose()
    $screen.Dispose()
    $frame.Dispose()
    $shadow.Dispose()
  }
}

function Draw-Overlay([System.Drawing.Graphics]$G, [string]$Title, [string]$Subtitle) {
  $titleFont = New-Font 44 ([System.Drawing.FontStyle]::Bold)
  $subFont = New-Font 22
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#5E7369"
  try {
    Draw-Text -G $G -Text $Title -Font $titleFont -Brush $dark -X 90 -Y 56 -Width 900 -Height 62 -Center $true
    Draw-Text -G $G -Text $Subtitle -Font $subFont -Brush $muted -X 120 -Y 118 -Width 840 -Height 58 -Center $true
  }
  finally {
    $muted.Dispose()
    $dark.Dispose()
    $subFont.Dispose()
    $titleFont.Dispose()
  }
}

function Draw-AppTop([System.Drawing.Graphics]$G, [string]$Title, [string]$TimeText) {
  $small = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $titleFont = New-Font 34 ([System.Drawing.FontStyle]::Bold)
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#6A7C73"
  try {
    Draw-Text -G $G -Text $TimeText -Font $small -Brush $dark -X ($ScreenX + 42) -Y ($ScreenY + 18) -Width 90 -Height 24
    Draw-Text -G $G -Text "LTE   87%" -Font $small -Brush $dark -X ($ScreenX + 540) -Y ($ScreenY + 18) -Width 120 -Height 24
    Draw-Text -G $G -Text "TAEB" -Font $small -Brush $muted -X ($ScreenX + 42) -Y ($ScreenY + 54) -Width 200 -Height 20
    Draw-Text -G $G -Text $Title -Font $titleFont -Brush $dark -X ($ScreenX + 42) -Y ($ScreenY + 84) -Width 360 -Height 42
  }
  finally {
    $muted.Dispose()
    $dark.Dispose()
    $titleFont.Dispose()
    $small.Dispose()
  }
}

function Draw-Card([System.Drawing.Graphics]$G, [float]$X, [float]$Y, [float]$Width, [float]$Height, [string]$Fill = "#FFFFFF", [string]$Border = "#D8E4DE") {
  $brush = New-Brush $Fill
  $pen = New-Pen $Border 2
  try {
    Draw-Round -G $G -X $X -Y $Y -Width $Width -Height $Height -Radius 28 -Brush $brush -Pen $pen
  }
  finally {
    $pen.Dispose()
    $brush.Dispose()
  }
}

function Draw-Button([System.Drawing.Graphics]$G, [float]$X, [float]$Y, [float]$Width, [float]$Height, [string]$Label, [string]$Fill, [string]$TextHex) {
  $brush = New-Brush $Fill
  $textBrush = New-Brush $TextHex
  $font = New-Font 23 ([System.Drawing.FontStyle]::Bold)
  try {
    Draw-Round -G $G -X $X -Y $Y -Width $Width -Height $Height -Radius 22 -Brush $brush -Pen $null
    Draw-Text -G $G -Text $Label -Font $font -Brush $textBrush -X $X -Y ($Y + 20) -Width $Width -Height 34 -Center $true
  }
  finally {
    $font.Dispose()
    $textBrush.Dispose()
    $brush.Dispose()
  }
}

function Draw-Pill([System.Drawing.Graphics]$G, [float]$X, [float]$Y, [float]$Width, [string]$Label, [string]$Fill, [string]$TextHex) {
  $brush = New-Brush $Fill
  $textBrush = New-Brush $TextHex
  $font = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  try {
    Draw-Round -G $G -X $X -Y $Y -Width $Width -Height 40 -Radius 20 -Brush $brush -Pen $null
    Draw-Text -G $G -Text $Label -Font $font -Brush $textBrush -X $X -Y ($Y + 8) -Width $Width -Height 22 -Center $true
  }
  finally {
    $font.Dispose()
    $textBrush.Dispose()
    $brush.Dispose()
  }
}

function Draw-ListRow([System.Drawing.Graphics]$G, [float]$X, [float]$Y, [string]$Top, [string]$Bottom) {
  Draw-Card -G $G -X $X -Y $Y -Width 640 -Height 96 -Fill "#F7FBF8" -Border "#DDE7E1"
  $topFont = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $bottomFont = New-Font 21 ([System.Drawing.FontStyle]::Bold)
  $muted = New-Brush "#6B7B74"
  $dark = New-Brush "#17362C"
  try {
    Draw-Text -G $G -Text $Top -Font $topFont -Brush $muted -X ($X + 22) -Y ($Y + 18) -Width 260 -Height 18
    Draw-Text -G $G -Text $Bottom -Font $bottomFont -Brush $dark -X ($X + 22) -Y ($Y + 42) -Width 560 -Height 26
  }
  finally {
    $dark.Dispose()
    $muted.Dispose()
    $bottomFont.Dispose()
    $topFont.Dispose()
  }
}

function Draw-Notification([System.Drawing.Graphics]$G, [float]$Y, [string]$Title, [string]$Body, [string]$Accent) {
  Draw-Card -G $G -X ($ScreenX + 34) -Y $Y -Width 644 -Height 148 -Fill "#FFFFFF" -Border "#CFE0D8"
  $accentBrush = New-Brush $Accent
  $small = New-Font 15 ([System.Drawing.FontStyle]::Bold)
  $titleFont = New-Font 22 ([System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Font 18
  $muted = New-Brush "#557468"
  $dark = New-Brush "#17362C"
  try {
    Draw-Round -G $G -X ($ScreenX + 56) -Y ($Y + 22) -Width 50 -Height 50 -Radius 16 -Brush $accentBrush -Pen $null
    Draw-Text -G $G -Text "TAEB" -Font $small -Brush $muted -X ($ScreenX + 122) -Y ($Y + 24) -Width 260 -Height 18
    Draw-Text -G $G -Text $Title -Font $titleFont -Brush $dark -X ($ScreenX + 122) -Y ($Y + 48) -Width 460 -Height 26
    Draw-Text -G $G -Text $Body -Font $bodyFont -Brush $muted -X ($ScreenX + 56) -Y ($Y + 92) -Width 590 -Height 40
  }
  finally {
    $dark.Dispose()
    $muted.Dispose()
    $bodyFont.Dispose()
    $titleFont.Dispose()
    $small.Dispose()
    $accentBrush.Dispose()
  }
}

function Draw-Welcome([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Daily safety check-ins" -Subtitle "A simple routine to confirm you are safe."
  Draw-AppTop -G $G -Title "Overview" -TimeText "9:41"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 164) -Width 644 -Height 260
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 462) -Width 644 -Height 96 -Fill "#F7FBF8" -Border "#DDE7E1"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 578) -Width 644 -Height 96 -Fill "#F7FBF8" -Border "#DDE7E1"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 694) -Width 644 -Height 96 -Fill "#F7FBF8" -Border "#DDE7E1"
  Draw-Button -G $G -X ($ScreenX + 34) -Y ($ScreenY + 828) -Width 644 -Height 88 -Label "Start daily check-ins" -Fill "#1A7F64" -TextHex "#FFFFFF"

  $circle = New-Brush "#E3F2EC"
  $green = New-Brush "#1A7F64"
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#65776F"
  $big = New-Font 64 ([System.Drawing.FontStyle]::Bold)
  $title = New-Font 30 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 22
  try {
    Draw-Round -G $G -X ($ScreenX + 72) -Y ($ScreenY + 206) -Width 120 -Height 120 -Radius 36 -Brush $circle -Pen $null
    Draw-Text -G $G -Text "C" -Font $big -Brush $green -X ($ScreenX + 72) -Y ($ScreenY + 226) -Width 120 -Height 70 -Center $true
    Draw-Text -G $G -Text "Check in once a day" -Font $title -Brush $dark -X ($ScreenX + 224) -Y ($ScreenY + 212) -Width 320 -Height 34
    Draw-Text -G $G -Text "Stay on schedule and keep emergency help one tap away." -Font $body -Brush $muted -X ($ScreenX + 224) -Y ($ScreenY + 258) -Width 360 -Height 78
  }
  finally {
    $body.Dispose()
    $title.Dispose()
    $big.Dispose()
    $muted.Dispose()
    $dark.Dispose()
    $green.Dispose()
    $circle.Dispose()
  }

  Draw-ListRow -G $G -X ($ScreenX + 34) -Y ($ScreenY + 462) -Top "Check-in interval" -Bottom "Every 24 hours"
  Draw-ListRow -G $G -X ($ScreenX + 34) -Y ($ScreenY + 578) -Top "Next reminder" -Bottom "Today at 7:00 PM"
  Draw-ListRow -G $G -X ($ScreenX + 34) -Y ($ScreenY + 694) -Top "Emergency contact" -Bottom "Alex Kim ready"
}

function Draw-Home([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Track your next check-in" -Subtitle "The home screen shows your deadline at a glance."
  Draw-AppTop -G $G -Title "Home" -TimeText "10:08"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 162) -Width 644 -Height 492
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 694) -Width 644 -Height 118 -Fill "#F6FAF7" -Border "#DCE7E0"
  Draw-Button -G $G -X ($ScreenX + 244) -Y ($ScreenY + 712) -Width 404 -Height 82 -Label "Emergency contacts" -Fill "#EAF3EE" -TextHex "#17362C"
  Draw-Button -G $G -X ($ScreenX + 34) -Y ($ScreenY + 836) -Width 644 -Height 86 -Label "Settings" -Fill "#EAF3EE" -TextHex "#17362C"
  Draw-Pill -G $G -X ($ScreenX + 64) -Y ($ScreenY + 728) -Width 160 -Label "Quick actions" -Fill "#E8F3EE" -TextHex "#567267"

  $small = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $hero = New-Font 38 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 20
  $count = New-Font 64 ([System.Drawing.FontStyle]::Bold)
  $hint = New-Font 22 ([System.Drawing.FontStyle]::Bold)
  $green = New-Brush "#1A7F64"
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#5C6F66"
  $white = New-Brush "#FFFFFF"
  $mint = New-Brush "#DDEEE8"
  $button = New-Brush "#1A6856"
  try {
    Draw-Text -G $G -Text "TAEB" -Font $small -Brush $green -X ($ScreenX + 66) -Y ($ScreenY + 198) -Width 190 -Height 18
    Draw-Text -G $G -Text "Check in today" -Font $hero -Brush $dark -X ($ScreenX + 66) -Y ($ScreenY + 228) -Width 320 -Height 42
    Draw-Text -G $G -Text "Leave a quick signal that you are safe today." -Font $body -Brush $muted -X ($ScreenX + 66) -Y ($ScreenY + 284) -Width 430 -Height 52
    Draw-Round -G $G -X ($ScreenX + 66) -Y ($ScreenY + 366) -Width 580 -Height 210 -Radius 32 -Brush $button -Pen $null
    Draw-Text -G $G -Text "11:52:18" -Font $count -Brush $white -X ($ScreenX + 66) -Y ($ScreenY + 426) -Width 580 -Height 80 -Center $true
    Draw-Text -G $G -Text "CHECK IN TODAY" -Font $hint -Brush $mint -X ($ScreenX + 66) -Y ($ScreenY + 508) -Width 580 -Height 26 -Center $true
  }
  finally {
    $button.Dispose()
    $mint.Dispose()
    $white.Dispose()
    $muted.Dispose()
    $dark.Dispose()
    $green.Dispose()
    $hint.Dispose()
    $count.Dispose()
    $body.Dispose()
    $hero.Dispose()
    $small.Dispose()
  }
}

function Draw-Success([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Confirm safety in one tap" -Subtitle "After check-in, the next deadline resets immediately."
  Draw-AppTop -G $G -Title "Home" -TimeText "10:09"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 154) -Width 644 -Height 126 -Fill "#F5FBF7" -Border "#D4E7DB"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 312) -Width 644 -Height 522
  Draw-Button -G $G -X ($ScreenX + 34) -Y ($ScreenY + 864) -Width 644 -Height 86 -Label "View check-in history" -Fill "#EAF3EE" -TextHex "#17362C"

  $notice = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $noticeBody = New-Font 22 ([System.Drawing.FontStyle]::Bold)
  $hero = New-Font 38 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 20
  $okFont = New-Font 92 ([System.Drawing.FontStyle]::Bold)
  $count = New-Font 54 ([System.Drawing.FontStyle]::Bold)
  $green = New-Brush "#196B57"
  $darkBody = New-Brush "#29453B"
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#5C6F66"
  $light = New-Brush "#DDEEE8"
  $white = New-Brush "#FFFFFF"
  $button = New-Brush "#1A6856"
  try {
    Draw-Text -G $G -Text "CHECK-IN COMPLETED" -Font $notice -Brush $green -X ($ScreenX + 58) -Y ($ScreenY + 188) -Width 280 -Height 18
    Draw-Text -G $G -Text "24 h left until your next check-in" -Font $noticeBody -Brush $darkBody -X ($ScreenX + 58) -Y ($ScreenY + 214) -Width 420 -Height 28
    Draw-Text -G $G -Text "Check in today" -Font $hero -Brush $dark -X ($ScreenX + 66) -Y ($ScreenY + 352) -Width 320 -Height 42
    Draw-Text -G $G -Text "Your next daily reminder is now scheduled." -Font $body -Brush $muted -X ($ScreenX + 66) -Y ($ScreenY + 406) -Width 440 -Height 48
    Draw-Round -G $G -X ($ScreenX + 66) -Y ($ScreenY + 480) -Width 580 -Height 244 -Radius 32 -Brush $button -Pen $null
    Draw-Text -G $G -Text "OK" -Font $okFont -Brush $light -X ($ScreenX + 66) -Y ($ScreenY + 508) -Width 580 -Height 90 -Center $true
    Draw-Text -G $G -Text "24:00:00" -Font $count -Brush $white -X ($ScreenX + 66) -Y ($ScreenY + 606) -Width 580 -Height 62 -Center $true
  }
  finally {
    $button.Dispose()
    $white.Dispose()
    $light.Dispose()
    $muted.Dispose()
    $dark.Dispose()
    $darkBody.Dispose()
    $green.Dispose()
    $count.Dispose()
    $okFont.Dispose()
    $body.Dispose()
    $hero.Dispose()
    $noticeBody.Dispose()
    $notice.Dispose()
  }
}

function Draw-History([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Review recent check-ins" -Subtitle "A clean list helps users verify their routine quickly."
  Draw-AppTop -G $G -Title "History" -TimeText "7:42"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 158) -Width 644 -Height 884
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 306) -Top "Today" -Bottom "March 6, 9:00 AM"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 420) -Top "Yesterday" -Bottom "March 5, 8:58 AM"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 534) -Top "Tuesday" -Bottom "March 4, 9:04 AM"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 648) -Top "Monday" -Bottom "March 3, 8:56 AM"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 762) -Top "Sunday" -Bottom "March 2, 9:01 AM"
  Draw-Button -G $G -X ($ScreenX + 54) -Y ($ScreenY + 898) -Width 604 -Height 86 -Label "Clear history" -Fill "#BA4C5D" -TextHex "#FFFFFF"

  $title = New-Font 32 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 20
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#66766E"
  try {
    Draw-Text -G $G -Text "Check-in history" -Font $title -Brush $dark -X ($ScreenX + 62) -Y ($ScreenY + 198) -Width 320 -Height 38
    Draw-Text -G $G -Text "Recent check-ins appear in time order." -Font $body -Brush $muted -X ($ScreenX + 62) -Y ($ScreenY + 244) -Width 420 -Height 28
  }
  finally {
    $muted.Dispose()
    $dark.Dispose()
    $body.Dispose()
    $title.Dispose()
  }
}

function Draw-Contacts([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Keep emergency contacts ready" -Subtitle "Quick SMS and email actions stay close when help is needed."
  Draw-AppTop -G $G -Title "Emergency Contacts" -TimeText "6:30"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 158) -Width 644 -Height 314
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 506) -Width 644 -Height 396
  Draw-Button -G $G -X ($ScreenX + 62) -Y ($ScreenY + 358) -Width 278 -Height 74 -Label "Quick SMS" -Fill "#EAF3EE" -TextHex "#17362C"
  Draw-Button -G $G -X ($ScreenX + 366) -Y ($ScreenY + 358) -Width 278 -Height 74 -Label "Quick email" -Fill "#EAF3EE" -TextHex "#17362C"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 552) -Top "Name" -Bottom "Alex Kim"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 666) -Top "Mobile number" -Bottom "+82 10-1234-5678"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 780) -Top "Email" -Bottom "alex@example.com"

  $small = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $title = New-Font 32 ([System.Drawing.FontStyle]::Bold)
  $meta = New-Font 22 ([System.Drawing.FontStyle]::Bold)
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#66766E"
  try {
    Draw-Text -G $G -Text "SAVED CONTACT" -Font $small -Brush $muted -X ($ScreenX + 62) -Y ($ScreenY + 196) -Width 160 -Height 18
    Draw-Text -G $G -Text "Alex Kim" -Font $title -Brush $dark -X ($ScreenX + 62) -Y ($ScreenY + 224) -Width 220 -Height 34
    Draw-Text -G $G -Text "+82 10-1234-5678" -Font $meta -Brush $muted -X ($ScreenX + 62) -Y ($ScreenY + 272) -Width 260 -Height 24
    Draw-Text -G $G -Text "alex@example.com" -Font $meta -Brush $muted -X ($ScreenX + 62) -Y ($ScreenY + 306) -Width 280 -Height 24
  }
  finally {
    $muted.Dispose()
    $dark.Dispose()
    $meta.Dispose()
    $title.Dispose()
    $small.Dispose()
  }
}

function Draw-Reminder([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Send reminders before deadlines" -Subtitle "The app nudges users before a check-in is due."
  Draw-AppTop -G $G -Title "Home" -TimeText "5:00"
  Draw-Notification -G $G -Y ($ScreenY + 146) -Title "Check-in time is coming up" -Body "There are 2 hours left until your scheduled check-in." -Accent "#1A7F64"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 336) -Width 644 -Height 536
  Draw-Pill -G $G -X ($ScreenX + 66) -Y ($ScreenY + 748) -Width 194 -Label "Reminder active" -Fill "#E6F4EE" -TextHex "#1A7F64"

  $title = New-Font 36 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 20
  $count = New-Font 60 ([System.Drawing.FontStyle]::Bold)
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#5C6F66"
  $white = New-Brush "#FFFFFF"
  $button = New-Brush "#1A6856"
  try {
    Draw-Text -G $G -Text "Check in today" -Font $title -Brush $dark -X ($ScreenX + 66) -Y ($ScreenY + 378) -Width 320 -Height 40
    Draw-Text -G $G -Text "You still have time to complete the safety check-in." -Font $body -Brush $muted -X ($ScreenX + 66) -Y ($ScreenY + 430) -Width 430 -Height 52
    Draw-Round -G $G -X ($ScreenX + 66) -Y ($ScreenY + 516) -Width 580 -Height 210 -Radius 32 -Brush $button -Pen $null
    Draw-Text -G $G -Text "02:00:00" -Font $count -Brush $white -X ($ScreenX + 66) -Y ($ScreenY + 582) -Width 580 -Height 70 -Center $true
  }
  finally {
    $button.Dispose()
    $white.Dispose()
    $muted.Dispose()
    $dark.Dispose()
    $count.Dispose()
    $body.Dispose()
    $title.Dispose()
  }
}

function Draw-Deadline([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Act fast when a check-in is missed" -Subtitle "Warning states highlight urgent contact options."
  Draw-AppTop -G $G -Title "Home" -TimeText "9:15"
  Draw-Notification -G $G -Y ($ScreenY + 146) -Title "Your check-in time has passed" -Body "Please open the app and record your check-in now." -Accent "#B14C59"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 336) -Width 644 -Height 578 -Fill "#FFF7F6" -Border "#F0D4D5"
  Draw-Pill -G $G -X ($ScreenX + 66) -Y ($ScreenY + 378) -Width 200 -Label "Attention needed" -Fill "#FBE9E8" -TextHex "#8C2F39"
  Draw-Button -G $G -X ($ScreenX + 66) -Y ($ScreenY + 622) -Width 580 -Height 82 -Label "Send SMS" -Fill "#1A7F64" -TextHex "#FFFFFF"
  Draw-Button -G $G -X ($ScreenX + 66) -Y ($ScreenY + 722) -Width 580 -Height 82 -Label "Send email" -Fill "#F1F5F3" -TextHex "#17362C"

  $title = New-Font 36 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 20
  $warn = New-Brush "#8C2F39"
  $muted = New-Brush "#694148"
  try {
    Draw-Text -G $G -Text "Missed check-in warning" -Font $title -Brush $warn -X ($ScreenX + 66) -Y ($ScreenY + 438) -Width 390 -Height 40
    Draw-Text -G $G -Text "The scheduled check-in time has passed. Quickly message an emergency contact if needed." -Font $body -Brush $muted -X ($ScreenX + 66) -Y ($ScreenY + 494) -Width 500 -Height 84
  }
  finally {
    $muted.Dispose()
    $warn.Dispose()
    $body.Dispose()
    $title.Dispose()
  }
}

function Draw-Settings([System.Drawing.Graphics]$G) {
  Draw-Overlay -G $G -Title "Choose your check-in interval" -Subtitle "Users can tailor reminders to 12, 24, or 48 hours."
  Draw-AppTop -G $G -Title "Settings" -TimeText "8:20"
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 164) -Width 644 -Height 278
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 476) -Width 644 -Height 196
  Draw-Card -G $G -X ($ScreenX + 34) -Y ($ScreenY + 708) -Width 644 -Height 260
  Draw-Button -G $G -X ($ScreenX + 60) -Y ($ScreenY + 334) -Width 180 -Height 76 -Label "12 h" -Fill "#EAF3EE" -TextHex "#17362C"
  Draw-Button -G $G -X ($ScreenX + 266) -Y ($ScreenY + 334) -Width 180 -Height 76 -Label "24 h" -Fill "#1A7F64" -TextHex "#FFFFFF"
  Draw-Button -G $G -X ($ScreenX + 472) -Y ($ScreenY + 334) -Width 180 -Height 76 -Label "48 h" -Fill "#EAF3EE" -TextHex "#17362C"
  Draw-Pill -G $G -X ($ScreenX + 60) -Y ($ScreenY + 516) -Width 140 -Label "Notifications" -Fill "#E8F3EE" -TextHex "#567267"
  Draw-Button -G $G -X ($ScreenX + 460) -Y ($ScreenY + 530) -Width 162 -Height 64 -Label "On" -Fill "#7FD4BE" -TextHex "#17362C"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 752) -Top "Language" -Bottom "Korean / English / Japanese / Spanish"
  Draw-ListRow -G $G -X ($ScreenX + 54) -Y ($ScreenY + 866) -Top "Privacy policy" -Bottom "Connected"

  $title = New-Font 32 ([System.Drawing.FontStyle]::Bold)
  $body = New-Font 20
  $dark = New-Brush "#17362C"
  $muted = New-Brush "#66766E"
  try {
    Draw-Text -G $G -Text "Check-in interval" -Font $title -Brush $dark -X ($ScreenX + 60) -Y ($ScreenY + 210) -Width 320 -Height 38
    Draw-Text -G $G -Text "Choose how often the app expects a safety check-in." -Font $body -Brush $muted -X ($ScreenX + 60) -Y ($ScreenY + 258) -Width 430 -Height 52
  }
  finally {
    $muted.Dispose()
    $dark.Dispose()
    $body.Dispose()
    $title.Dispose()
  }
}

function New-Shot([string]$Path, [scriptblock]$Scene) {
  $bmp = New-Object System.Drawing.Bitmap $W, $H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  try {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    Draw-Background -G $g
    Draw-Phone -G $g
    & $Scene $g

    if (-not (Test-Path $OutputDir)) {
      New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $g.Dispose()
    $bmp.Dispose()
  }
}

$files = @(
  "phone-screenshot-01-welcome.png",
  "phone-screenshot-02-home.png",
  "phone-screenshot-03-checkin-success.png",
  "phone-screenshot-04-history.png",
  "phone-screenshot-05-emergency-contacts.png",
  "phone-screenshot-06-reminder-notification.png",
  "phone-screenshot-07-deadline-warning.png",
  "phone-screenshot-08-settings.png"
)

New-Shot -Path (Join-Path $OutputDir $files[0]) -Scene ${function:Draw-Welcome}
New-Shot -Path (Join-Path $OutputDir $files[1]) -Scene ${function:Draw-Home}
New-Shot -Path (Join-Path $OutputDir $files[2]) -Scene ${function:Draw-Success}
New-Shot -Path (Join-Path $OutputDir $files[3]) -Scene ${function:Draw-History}
New-Shot -Path (Join-Path $OutputDir $files[4]) -Scene ${function:Draw-Contacts}
New-Shot -Path (Join-Path $OutputDir $files[5]) -Scene ${function:Draw-Reminder}
New-Shot -Path (Join-Path $OutputDir $files[6]) -Scene ${function:Draw-Deadline}
New-Shot -Path (Join-Path $OutputDir $files[7]) -Scene ${function:Draw-Settings}

$readme = @(
  "Generated Google Play screenshots:"
  "- phone-screenshot-01-welcome.png"
  "- phone-screenshot-02-home.png"
  "- phone-screenshot-03-checkin-success.png"
  "- phone-screenshot-04-history.png"
  "- phone-screenshot-05-emergency-contacts.png"
  "- phone-screenshot-06-reminder-notification.png"
  "- phone-screenshot-07-deadline-warning.png"
  "- phone-screenshot-08-settings.png"
  ""
  "Specs:"
  "- 1080 x 1920"
  "- PNG"
  "- Portrait 9:16"
  "- Based on the current Taeb app flow"
) -join "`r`n"

Set-Content -Path (Join-Path $OutputDir "README.txt") -Value $readme -Encoding UTF8
Write-Host "Google Play screenshots generated in $OutputDir"
