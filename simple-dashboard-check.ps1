Write-Host "🚀 Simple Dashboard Features Verification" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if core files exist
$dashboardJs = Test-Path "g:\GITHUB\fin_test\public\js\pages\dashboard.js"
$indexHtml = Test-Path "g:\GITHUB\fin_test\index.html"

if ($dashboardJs -and $indexHtml) {
    Write-Host "✅ Core files exist" -ForegroundColor Green
} else {
    Write-Host "❌ Core files missing" -ForegroundColor Red
}

# Check for required functions in dashboard.js
$dashboardContent = Get-Content "g:\GITHUB\fin_test\public\js\pages\dashboard.js" -Raw -ErrorAction SilentlyContinue
if ($dashboardContent) {
    $hasTrialsFn = $dashboardContent -match "getUpcomingTrials"
    $hasDeliveriesFn = $dashboardContent -match "getUpcomingDeliveries"
    $hasCalendarFn = $dashboardContent -match "updateCalendarMarkings"

    if ($hasTrialsFn -and $hasDeliveriesFn -and $hasCalendarFn) {
        Write-Host "✅ Dashboard functions implemented" -ForegroundColor Green
    } else {
        Write-Host "❌ Dashboard functions incomplete" -ForegroundColor Red
    }
}

# Check HTML for required components
$htmlContent = Get-Content "g:\GITHUB\fin_test\index.html" -Raw -ErrorAction SilentlyContinue
if ($htmlContent) {
    $hasTrialsUI = $htmlContent -match "trialsComingUp" -or $htmlContent -match "trialComingUpStat"
    $hasDeliveriesUI = $htmlContent -match "deliveriesComingUp" -or $htmlContent -match "deliveryComingUpStat"
    $hasCalendarUI = $htmlContent -match "calendar-grid" -or $htmlContent -match "calendarContainer"

    if ($hasTrialsUI -and $hasDeliveriesUI -and $hasCalendarUI) {
        Write-Host "✅ Dashboard UI components implemented" -ForegroundColor Green
    } else {
        Write-Host "❌ Dashboard UI components incomplete" -ForegroundColor Red
    }
}

Write-Host "`n📝 Deployment verification summary:" -ForegroundColor Yellow
Write-Host "- Trial Coming Up Status: $(if ($hasTrialsFn -and $hasTrialsUI) { "✅ Implemented" } else { "❌ Not implemented" })"
Write-Host "- Delivery Coming Up Status: $(if ($hasDeliveriesFn -and $hasDeliveriesUI) { "✅ Implemented" } else { "❌ Not implemented" })"
Write-Host "- Calendar Markings: $(if ($hasCalendarFn -and $hasCalendarUI) { "✅ Implemented" } else { "❌ Not implemented" })"

Write-Host "`n🔍 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open index.html in a browser to verify functionality"
Write-Host "2. Check that trial counts display correctly"
Write-Host "3. Check that delivery counts display correctly" 
Write-Host "4. Verify calendar events show with proper color coding"
Write-Host "5. Test month navigation and event details"
