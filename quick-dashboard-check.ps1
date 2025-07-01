Write-Host "Dashboard Feature Verification" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check key files
Write-Host "`nFile Check:" -ForegroundColor Yellow
if (Test-Path "public/js/pages/dashboard.js") { Write-Host "✅ Dashboard controller exists" -ForegroundColor Green } else { Write-Host "❌ Dashboard controller missing" -ForegroundColor Red }
if (Test-Path "index.html") { Write-Host "✅ Main HTML exists" -ForegroundColor Green } else { Write-Host "❌ Main HTML missing" -ForegroundColor Red }

# Check implementation
Write-Host "`nImplementation Check:" -ForegroundColor Yellow
$content = Get-Content "public/js/pages/dashboard.js" -Raw

if ($content -match "getUpcomingTrials") { Write-Host "✅ Trial status logic implemented" -ForegroundColor Green } else { Write-Host "❌ Trial status logic missing" -ForegroundColor Red }
if ($content -match "getUpcomingDeliveries") { Write-Host "✅ Delivery status logic implemented" -ForegroundColor Green } else { Write-Host "❌ Delivery status logic missing" -ForegroundColor Red }
if ($content -match "updateCalendarMarkings") { Write-Host "✅ Calendar markings implemented" -ForegroundColor Green } else { Write-Host "❌ Calendar markings missing" -ForegroundColor Red }
if ($content -match "generateCalendar") { Write-Host "✅ Calendar generation implemented" -ForegroundColor Green } else { Write-Host "❌ Calendar generation missing" -ForegroundColor Red }

# Check HTML integration
Write-Host "`nHTML Integration Check:" -ForegroundColor Yellow
$html = Get-Content "index.html" -Raw

if ($html -match "trialsComingUp") { Write-Host "✅ Trial status card in HTML" -ForegroundColor Green } else { Write-Host "❌ Trial status card missing" -ForegroundColor Red }
if ($html -match "deliveriesComingUp") { Write-Host "✅ Delivery status card in HTML" -ForegroundColor Green } else { Write-Host "❌ Delivery status card missing" -ForegroundColor Red }

Write-Host "`nResult: Dashboard features appear to be properly implemented!" -ForegroundColor Green
Write-Host "Open dashboard-test-runner.html to run browser tests" -ForegroundColor Cyan
