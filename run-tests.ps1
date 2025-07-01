# Run tests for Fashion Admin Dashboard
param(
    [string]$TestType = "unit",  # Options: unit, e2e, upload, all
    [switch]$Headless = $false
)

Write-Host "Fashion Admin Dashboard Test Runner" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Define test paths
$unitTestPath = Join-Path -Path $PSScriptRoot -ChildPath "tests\test-runner.html"
$e2eTestPath = Join-Path -Path $PSScriptRoot -ChildPath "tests\e2e-runner.html"
$uploadTestPath = Join-Path -Path $PSScriptRoot -ChildPath "tests\upload-component-test.html"

# Function to open browser
function Open-Browser {
    param (
        [string]$Url
    )
    
    Write-Host "Opening test runner in default browser: $Url" -ForegroundColor Yellow
    
    if ($env:OS -eq "Windows_NT") {
        # Use Start-Process on Windows
        Start-Process $Url
    } else {
        # Use xdg-open on Linux or open on macOS
        if (Get-Command "xdg-open" -ErrorAction SilentlyContinue) {
            xdg-open $Url
        } elseif (Get-Command "open" -ErrorAction SilentlyContinue) {
            open $Url
        } else {
            Write-Error "Cannot find a browser opener command. Please open $Url manually."
            return $false
        }
    }
    
    return $true
}

# Run the appropriate tests
switch ($TestType.ToLower()) {
    "unit" {
        Write-Host "Starting Unit Tests (QUnit)..." -ForegroundColor Green
        $success = Open-Browser -Url $unitTestPath
    }
    
    "e2e" {
        Write-Host "Starting End-to-End Tests..." -ForegroundColor Green
        $e2eUrl = if ($Headless) { "$e2eTestPath?autorun=true" } else { $e2eTestPath }
        $success = Open-Browser -Url $e2eUrl
    }
    
    "upload" {
        Write-Host "Starting Upload Component Tests..." -ForegroundColor Green
        $success = Open-Browser -Url $uploadTestPath
    }
    
    "all" {
        Write-Host "Starting All Tests..." -ForegroundColor Green
        $success1 = Open-Browser -Url $unitTestPath
        Start-Sleep -Seconds 2  # Short pause between opening browsers
        $success2 = Open-Browser -Url $e2eTestPath
        Start-Sleep -Seconds 2
        $success3 = Open-Browser -Url $uploadTestPath
        $success = $success1 -and $success2 -and $success3
    }
    
    default {
        Write-Host "Invalid test type: $TestType" -ForegroundColor Red
        Write-Host "Valid options are: unit, e2e, upload, all" -ForegroundColor Red
        exit 1
    }
}

if ($success) {
    Write-Host "Test runner(s) opened in browser. Check the browser for test results." -ForegroundColor Green
}
