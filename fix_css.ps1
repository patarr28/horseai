$file = "app\globals.css"
$content = Get-Content $file -Raw
$newContent = $content -replace "shadow-\[0_0_15px_rgba\(0, 255, 136, 0.1\)\]", "shadow-[0_0_15px_rgba(0,255,136,0.1)]"
Set-Content -Path $file -Value $newContent -Force
Write-Host "Fixed globals.css"
