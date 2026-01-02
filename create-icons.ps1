Add-Type -AssemblyName System.Drawing

$iconsDir = "C:\Users\ramis\Desktop\visi-git\src-tauri\icons"
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

function Create-PlaceholderIcon {
    param([int]$Size, [string]$FilePath)

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)

    for ($x = 0; $x -lt $Size; $x++) {
        for ($y = 0; $y -lt $Size; $y++) {
            $r = [int](65 + ($x / $Size) * 100)
            $g = [int](105 + ($y / $Size) * 100)
            $b = 225
            $color = [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
            $bitmap.SetPixel($x, $y, $color)
        }
    }

    $bitmap.Save($FilePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Created $FilePath"
}

Create-PlaceholderIcon -Size 32 -FilePath "$iconsDir\32x32.png"
Create-PlaceholderIcon -Size 128 -FilePath "$iconsDir\128x128.png"
Create-PlaceholderIcon -Size 256 -FilePath "$iconsDir\128x128@2x.png"

# Create a simple ICO file (copy from 32x32 as base)
$iconPath = "$iconsDir\icon.ico"
$bitmap = New-Object System.Drawing.Bitmap("$iconsDir\32x32.png")
$icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
$fileStream = [System.IO.File]::Create($iconPath)
$icon.Save($fileStream)
$fileStream.Close()
$bitmap.Dispose()
Write-Host "Created $iconPath"

# Create empty placeholder for icns (macOS only, not needed on Windows)
"" | Out-File "$iconsDir\icon.icns"
Write-Host "Created placeholder icon.icns"

Write-Host "All icons created!"
