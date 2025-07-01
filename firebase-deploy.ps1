# Dashboard Features Firebase Deployment Script
# This script deploys the new dashboard to Firebase Hosting
# Date: June 12, 2025

Write-Host "🚀 Deploying Dashboard to Firebase" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Configuration
$sourceDir = "g:\GITHUB\fin_test"

Write-Host "`n📦 Creating backup..." -ForegroundColor Yellow
$backupDir = "g:\GITHUB\fin_test\backups\$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}
Copy-Item -Path "$sourceDir\public\js\pages\dashboard.js" -Destination "$backupDir\dashboard.js" -Force
Copy-Item -Path "$sourceDir\index.html" -Destination "$backupDir\index.html" -Force
Write-Host "   ✓ Backup created at: $backupDir" -ForegroundColor Green

Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Yellow
Set-Location $sourceDir
$deployOutput = npx firebase deploy --only hosting

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "`nYour site should now be live on Firebase Hosting!" -ForegroundColor Cyan
Write-Host "Check your Firebase Console for the hosting URL" -ForegroundColor Yellow
Write-Host "`nhttps://console.firebase.google.com" -ForegroundColor Blue
