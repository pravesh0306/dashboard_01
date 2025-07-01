# Dashboard Integration Test PowerShell Script
# This script helps verify the dashboard implementation

Write-Host "🧪 Dashboard Integration Test Suite" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Test 1: Check if all required files exist
Write-Host "`n📁 Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "public/js/pages/dashboard.js",
    "public/pages/dashboard.html", 
    "index.html",
    "dashboard-test-runner.html",
    "dashboard-integration-test-plan.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Test 2: Check dashboard.js for required functions
Write-Host "`n🔍 Checking dashboard.js implementation..." -ForegroundColor Yellow

$dashboardJs = Get-Content "public/js/pages/dashboard.js" -Raw

$requiredFunctions = @(
    "getUpcomingTrials",
    "getUpcomingDeliveries", 
    "renderUpcomingTrials",
    "renderUpcomingDeliveries",
    "updateCalendarMarkings",
    "generateCalendar",
    "navigateCalendar",
    "formatDate",
    "getDaysUntilDate",
    "animateCountUp"
)

foreach ($func in $requiredFunctions) {
    if ($dashboardJs -match $func) {
        Write-Host "✅ Function $func implemented" -ForegroundColor Green
    } else {
        Write-Host "❌ Function $func missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Test 3: Check HTML for required elements
Write-Host "`n🔍 Checking HTML elements..." -ForegroundColor Yellow

$indexHtml = Get-Content "index.html" -Raw

$requiredElements = @(
    "trialsComingUp",
    "deliveriesComingUp", 
    "calendar-grid",
    "prevMonthBtn",
    "nextMonthBtn",
    "currentMonthLabel"
)

foreach ($element in $requiredElements) {
    if ($indexHtml -match $element) {
        Write-Host "✅ Element $element found in HTML" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Element $element not found in main HTML" -ForegroundColor Yellow
    }
}

# Test 4: Check for proper CSS styling
Write-Host "`n🎨 Checking CSS styling..." -ForegroundColor Yellow

$cssClasses = @(
    "border-\[#f59e0b\]",
    "border-\[#10b981\]",
    "bg-gradient-to-br",
    "animate-pulse"
)

foreach ($class in $cssClasses) {
    if ($indexHtml -match [regex]::Escape($class)) {
        Write-Host "✅ CSS class $class found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CSS class $class not found" -ForegroundColor Yellow
    }
}

# Test 5: Validate test data structure
Write-Host "`n📊 Checking test data..." -ForegroundColor Yellow

$dataJs = Get-Content "public/js/data.js" -Raw

if ($dataJs -match "trialDate") {
    Write-Host "✅ Trial date field found in data" -ForegroundColor Green
} else {
    Write-Host "❌ Trial date field missing from data" -ForegroundColor Red
}

if ($dataJs -match "deliveryDate") {
    Write-Host "✅ Delivery date field found in data" -ForegroundColor Green
} else {
    Write-Host "❌ Delivery date field missing from data" -ForegroundColor Red
}

# Summary
Write-Host "`n📋 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

if ($allFilesExist) {
    Write-Host "✅ All core files and functions are present" -ForegroundColor Green
    Write-Host "✅ Dashboard features appear to be properly implemented" -ForegroundColor Green
    Write-Host "`n🚀 Ready for browser testing!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Open dashboard-test-runner.html in browser" -ForegroundColor White
    Write-Host "2. Click 'Run All Tests' button" -ForegroundColor White
    Write-Host "3. Verify all tests pass" -ForegroundColor White
    Write-Host "4. Test on mobile devices" -ForegroundColor White
} else {
    Write-Host "❌ Some issues found - please review above" -ForegroundColor Red
}

Write-Host "`n🌐 Test URLs:" -ForegroundColor Cyan
Write-Host "- Main Dashboard: index.html" -ForegroundColor White
Write-Host "- Test Runner: dashboard-test-runner.html" -ForegroundColor White
Write-Host "- Dedicated Dashboard: public/pages/dashboard.html" -ForegroundColor White
