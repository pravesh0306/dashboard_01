# Cache Clear and Hard Refresh Script
Write-Host "🧹 Clearing browser cache and forcing hard refresh..." -ForegroundColor Yellow

# Kill all Chrome processes (be careful with this in production)
Write-Host "Stopping Chrome processes..." -ForegroundColor Red
Get-Process "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Clear Chrome cache directory (optional - use with caution)
$chromeCacheDir = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
if (Test-Path $chromeCacheDir) {
    Write-Host "Clearing Chrome cache directory..." -ForegroundColor Yellow
    Remove-Item "$chromeCacheDir\*" -Force -Recurse -ErrorAction SilentlyContinue
}

# Clear temporary internet files
Write-Host "Clearing temporary files..." -ForegroundColor Yellow
Remove-Item "$env:TEMP\*" -Force -Recurse -ErrorAction SilentlyContinue

Write-Host "✅ Cache clearing completed!" -ForegroundColor Green
Write-Host "Opening site with cache-busting parameters..." -ForegroundColor Green

# Open the site with cache-busting parameters
$url = "https://test-fileupload-bbf7e.web.app?v=" + (Get-Date -Format "yyyyMMddHHmmss")
Start-Process "chrome.exe" "--disable-web-security --disable-features=VizDisplayCompositor --incognito --new-window $url"

Write-Host "🌐 Site opened in incognito mode with cache-busting" -ForegroundColor Green
Write-Host "If you still see old content, try Ctrl+Shift+R (hard refresh)" -ForegroundColor Yellow
