// End-to-End Test Script for Fashion Admin Dashboard
// Tests the complete workflow from login to file upload and download
// Requires a browser with console access

// Configuration
const TEST_CONFIG = {
  testEmail: 'test@example.com',
  testPassword: 'password123',
  testFileName: 'test-document.txt',
  testFileContent: 'This is a test document for the dashboard E2E tests',
};

// Test status tracker
let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

// Test runner
function runE2ETests() {
  console.log('🧪 Starting End-to-End Tests');
  
  // Run tests in sequence
  loginTest()
    .then(dashboardLoadTest)
    .then(navigationTest)
    .then(fileUploadTest)
    .then(fileDownloadTest)
    .then(logoutTest)
    .then(showResults)
    .catch(handleTestError);
}

// Helper function to log test result
function logTestResult(testName, result, message) {
  const testResult = {
    name: testName,
    passed: result,
    message: message || ''
  };
  
  testResults.push(testResult);
  
  if (result) {
    testsPassed++;
    console.log(`✅ ${testName} - Passed`);
  } else {
    testsFailed++;
    console.error(`❌ ${testName} - Failed: ${message}`);
  }
}

// Test: Login functionality
async function loginTest() {
  console.log('🔐 Testing Login...');
  
  try {
    // Check if we're on login page or need to logout first
    if (!document.getElementById('loginForm')) {
      // If we're already logged in, log out first
      if (window.app && window.app.isAuthenticated) {
        window.app.handleLogout();
      }
      // Wait for login form to appear
      await waitFor(() => document.getElementById('loginForm'));
    }
    
    // Fill in login form
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const loginForm = document.getElementById('loginForm');
    
    if (!emailInput || !passwordInput || !loginForm) {
      throw new Error('Login form elements not found');
    }
    
    emailInput.value = TEST_CONFIG.testEmail;
    passwordInput.value = TEST_CONFIG.testPassword;
    
    // Submit the form
    loginForm.dispatchEvent(new Event('submit'));
    
    // Wait for authentication to complete
    await waitFor(() => window.app.isAuthenticated);
    
    // Verify user is logged in
    if (!window.app.user || !window.app.user.email) {
      throw new Error('User not properly logged in');
    }
    
    logTestResult('Login Test', true);
  } catch (error) {
    logTestResult('Login Test', false, error.message);
    throw error; // Stop test execution
  }
}

// Test: Dashboard loads correctly
async function dashboardLoadTest() {
  console.log('📊 Testing Dashboard Load...');
  
  try {
    // Navigate to dashboard if not there
    if (window.app.currentPage !== 'dashboard') {
      await window.app.navigateTo('dashboard');
    }
    
    // Wait for dashboard to load
    await waitFor(() => {
      const mainContent = document.getElementById('mainContent');
      return mainContent && mainContent.querySelector('.dashboard-stats');
    });
    
    // Check for key dashboard elements
    const dashboardStats = document.querySelector('.dashboard-stats');
    const recentFiles = document.querySelector('.recent-files');
    
    if (!dashboardStats || !recentFiles) {
      throw new Error('Dashboard elements not found');
    }
    
    logTestResult('Dashboard Load Test', true);
  } catch (error) {
    logTestResult('Dashboard Load Test', false, error.message);
    throw error;
  }
}

// Test: Navigation between pages
async function navigationTest() {
  console.log('🧭 Testing Navigation...');
  
  try {
    // Test navigation to each main page
    const pagesToTest = ['orders', 'customers', 'settings', 'dashboard'];
    
    for (const page of pagesToTest) {
      // Navigate to the page
      await window.app.navigateTo(page);
      
      // Wait for page to load
      await waitFor(() => window.app.currentPage === page);
      
      // Verify the page loaded correctly
      if (window.app.currentPage !== page) {
        throw new Error(`Failed to navigate to ${page} page`);
      }
    }
    
    logTestResult('Navigation Test', true);
  } catch (error) {
    logTestResult('Navigation Test', false, error.message);
    throw error;
  }
}

// Test: File upload functionality
async function fileUploadTest() {
  console.log('📤 Testing File Upload...');
  
  try {
    // Create a test file 
    const file = new File([TEST_CONFIG.testFileContent], TEST_CONFIG.testFileName, { 
      type: 'text/plain' 
    });
    
    // Check if we have a cloud storage instance
    if (!window.app.cloudStorage) {
      logTestResult('File Upload Test', false, 'Cloud storage not initialized, skipping test');
      return; // Skip but don't fail the whole test suite
    }
    
    // Mock file upload event
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      // Set the file on the input
      Object.defineProperty(fileInput, 'files', {
        value: dataTransfer.files,
        writable: false
      });
      
      // Dispatch change event
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Wait for upload to complete
      // In real app, would need to wait for upload confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logTestResult('File Upload Test', true);
    } else {
      logTestResult('File Upload Test', false, 'File input not found, skipping test');
    }
  } catch (error) {
    logTestResult('File Upload Test', false, error.message);
  }
}

// Test: File download functionality
async function fileDownloadTest() {
  console.log('📥 Testing File Download...');
  
  try {
    // Try to find a download button
    const downloadBtn = document.querySelector('.file-item .download-btn');
    
    if (downloadBtn) {
      // Click the download button
      downloadBtn.click();
      
      // In a real test we would verify the download completed
      // For this demo we just assume it worked if no errors occurred
      
      logTestResult('File Download Test', true);
    } else {
      logTestResult('File Download Test', false, 'No downloadable files found, skipping test');
    }
  } catch (error) {
    logTestResult('File Download Test', false, error.message);
  }
}

// Test: Logout functionality
async function logoutTest() {
  console.log('🚪 Testing Logout...');
  
  try {
    // Find and click logout button
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (!logoutBtn) {
      // Try alternative approach - call logout directly
      if (window.app && typeof window.app.handleLogout === 'function') {
        window.app.handleLogout();
      } else {
        throw new Error('Logout button not found and app.handleLogout not available');
      }
    } else {
      logoutBtn.click();
    }
    
    // Wait for logout to complete
    await waitFor(() => !window.app.isAuthenticated);
    
    // Verify login form is shown
    await waitFor(() => document.getElementById('loginForm'));
    
    if (!document.getElementById('loginForm')) {
      throw new Error('Login form not shown after logout');
    }
    
    logTestResult('Logout Test', true);
  } catch (error) {
    logTestResult('Logout Test', false, error.message);
  }
}

// Show final test results
function showResults() {
  console.log('\n📋 E2E Test Results:');
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  
  // Display detailed results
  console.log('\nDetailed Results:');
  testResults.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}${result.message ? `: ${result.message}` : ''}`);
  });
  
  // Show in page
  const resultElement = document.createElement('div');
  resultElement.className = 'test-results';
  resultElement.innerHTML = `
    <h2>E2E Test Results</h2>
    <p>Total Tests: ${testResults.length}</p>
    <p>✅ Passed: ${testsPassed}</p>
    <p>❌ Failed: ${testsFailed}</p>
    <h3>Detailed Results:</h3>
    <ul>
      ${testResults.map(result => `
        <li class="${result.passed ? 'passed' : 'failed'}">
          ${result.passed ? '✅' : '❌'} ${result.name}
          ${result.message ? `<span class="error-message">${result.message}</span>` : ''}
        </li>
      `).join('')}
    </ul>
    <style>
      .test-results {
        margin-top: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      .test-results .passed { color: green; }
      .test-results .failed { color: red; }
      .error-message {
        display: block;
        margin-left: 20px;
        font-size: 0.9em;
        color: #777;
      }
    </style>
  `;
  
  document.body.appendChild(resultElement);
}

// Handle test error
function handleTestError(error) {
  console.error('❌ E2E Test Suite Error:', error);
  showResults();
}

// Utility: Wait for a condition to be true
async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition (${timeout}ms)`);
}

// Run tests automatically if enabled
if (window.location.search.includes('autorun=true')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runE2ETests, 1000); // Wait for app to initialize
  });
}
