/**
 * Test Agent for Fashion Admin Dashboard
 * 
 * This script performs pre-deployment tests to ensure the application is ready for production.
 * It checks for JavaScript errors, HTML validity, and critical functionality.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Define color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Log a formatted message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Execute a shell command and return the output
 */
function executeCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (options.ignoreError) {
      return error.stdout || '';
    }
    throw error;
  }
}

/**
 * Check for JavaScript syntax errors
 */
function checkJavaScriptSyntax() {
  log('\n🔍 Checking JavaScript syntax...', colors.yellow);
  
  const jsFiles = [
    path.join(PUBLIC_DIR, 'js', 'app.js'),
    path.join(PUBLIC_DIR, 'js', 'utils.js'),
    path.join(PUBLIC_DIR, 'js', 'data.js'),
    path.join(PUBLIC_DIR, 'js', 'pages', 'create-order.js'),
    path.join(PUBLIC_DIR, 'js', 'pages', 'dashboard.js'),
    path.join(PUBLIC_DIR, 'js', 'pages', 'orders.js'),
    path.join(PUBLIC_DIR, 'js', 'pages', 'customers.js'),
    path.join(PUBLIC_DIR, 'js', 'pages', 'settings.js'),
    path.join(ROOT_DIR, 'google-drive-storage.js')
  ];
  
  const errors = [];
  
  for (const file of jsFiles) {
    if (!fs.existsSync(file)) {
      errors.push(`File not found: ${file}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
        // Use node to check for syntax errors
      try {        // Create mock browser environment to handle browser-specific objects
        const mockWindow = {};
        const mockElement = {
          addEventListener: () => {},
          removeEventListener: () => {},
          click: () => {},
          focus: () => {},
          style: {},
          classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {},
            contains: () => false
          },
          innerHTML: '',
          textContent: '',
          value: '',
          appendChild: () => {},
          removeChild: () => {},
          querySelector: () => mockElement,
          querySelectorAll: () => [mockElement]
        };
        const mockDocument = {
          addEventListener: () => {},
          getElementById: () => mockElement,
          querySelector: () => mockElement,
          querySelectorAll: () => ([mockElement]),
          createElement: () => mockElement,
          readyState: 'complete'
        };
        
        // Create context with browser globals
        const context = {
          window: mockWindow,
          document: mockDocument,
          navigator: { serviceWorker: { register: () => ({}) } },
          localStorage: { getItem: () => {}, setItem: () => {} },
          location: { href: '' },
          console: console,
          setTimeout: setTimeout,
          setInterval: setInterval,
          alert: () => {}
        };
        
        // Add self-reference to window
        context.window.window = context.window;
        
        require('vm').runInNewContext(content, context, { filename: file });
        log(`✓ ${path.relative(ROOT_DIR, file)} - No syntax errors`, colors.green);
      } catch (error) {
        log(`✗ ${path.relative(ROOT_DIR, file)} - Syntax error: ${error.message}`, colors.red);
        errors.push(`${path.relative(ROOT_DIR, file)}: ${error.message}`);
      }
    } catch (error) {
      errors.push(`Error reading ${file}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    log('\n❌ JavaScript syntax check failed with errors:', colors.red);
    errors.forEach(error => log(`  - ${error}`, colors.red));
    return false;
  } else {
    log('\n✅ All JavaScript files passed syntax check', colors.green);
    return true;
  }
}

/**
 * Check HTML files for basic validity
 */
function checkHTMLValidity() {
  log('\n🔍 Checking HTML files...', colors.yellow);
  
  const htmlFiles = [
    path.join(PUBLIC_DIR, 'index.html'),
    path.join(PUBLIC_DIR, 'pages', 'dashboard.html'),
    path.join(PUBLIC_DIR, 'pages', 'orders.html'),
    path.join(PUBLIC_DIR, 'pages', 'create-order.html'),
    path.join(PUBLIC_DIR, 'pages', 'customers.html'),
    path.join(PUBLIC_DIR, 'pages', 'settings.html'),
    path.join(PUBLIC_DIR, 'auth', 'login.html')
  ];
  
  const errors = [];
  
  for (const file of htmlFiles) {
    if (!fs.existsSync(file)) {
      errors.push(`File not found: ${file}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic HTML checks
      if (!content.includes('<!DOCTYPE html>')) {
        errors.push(`${path.relative(ROOT_DIR, file)}: Missing DOCTYPE declaration`);
      }
      
      // Check for unclosed tags (very basic check)
      const openTags = (content.match(/<([a-zA-Z0-9]+)(?:\s[^>]*)?>/g) || [])
        .map(tag => tag.match(/<([a-zA-Z0-9]+)/)[1]);
      
      const closeTags = (content.match(/<\/([a-zA-Z0-9]+)>/g) || [])
        .map(tag => tag.match(/<\/([a-zA-Z0-9]+)>/)[1]);
      
      // Check if number of open and close tags match for common elements
      ['div', 'span', 'p', 'a', 'script', 'form', 'section'].forEach(tag => {
        const openCount = openTags.filter(t => t === tag).length;
        const closeCount = closeTags.filter(t => t === tag).length;
        
        if (openCount !== closeCount) {
          errors.push(`${path.relative(ROOT_DIR, file)}: Mismatched ${tag} tags (${openCount} open, ${closeCount} close)`);
        }
      });
      
      if (errors.length === 0) {
        log(`✓ ${path.relative(ROOT_DIR, file)} - Passed basic checks`, colors.green);
      }
    } catch (error) {
      errors.push(`Error reading ${file}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    log('\n❌ HTML check failed with errors:', colors.red);
    errors.forEach(error => log(`  - ${error}`, colors.red));
    return false;
  } else {
    log('\n✅ All HTML files passed basic validation', colors.green);
    return true;
  }
}

/**
 * Check critical app configuration
 */
function checkAppConfiguration() {
  log('\n🔍 Checking app configuration...', colors.yellow);
  
  const configErrors = [];
  
  // Check Firebase configuration
  const firebaseConfigPath = path.join(ROOT_DIR, 'firebase.json');
  if (!fs.existsSync(firebaseConfigPath)) {
    configErrors.push('firebase.json configuration file is missing');
  } else {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      if (!firebaseConfig.hosting || !firebaseConfig.hosting.public) {
        configErrors.push('Invalid firebase.json: missing hosting configuration');
      }
      else {
        log('✓ Firebase configuration looks valid', colors.green);
      }
    } catch (error) {
      configErrors.push(`Invalid firebase.json: ${error.message}`);
    }
  }
  
  // Check Google Drive configuration
  const googleDriveStoragePath = path.join(ROOT_DIR, 'google-drive-storage.js');
  if (fs.existsSync(googleDriveStoragePath)) {
    const content = fs.readFileSync(googleDriveStoragePath, 'utf8');
    
    // Check for Google Client ID
    const clientIdMatch = content.match(/CLIENT_ID: ['"]([^'"]+)['"]/);
    if (!clientIdMatch || clientIdMatch[1].includes('YOUR_GOOGLE_CLIENT_ID')) {
      configErrors.push('Google Drive Storage has an invalid or placeholder CLIENT_ID');
    } else {
      log('✓ Google Drive API configuration looks valid', colors.green);
    }
  } else {
    configErrors.push('google-drive-storage.js file is missing');
  }
  
  // Check service worker
  const swPath = path.join(ROOT_DIR, 'sw.js');
  if (!fs.existsSync(swPath)) {
    configErrors.push('Service Worker (sw.js) is missing');
  } else {
    log('✓ Service Worker file exists', colors.green);
  }
  
  if (configErrors.length > 0) {
    log('\n❌ App configuration check failed:', colors.red);
    configErrors.forEach(error => log(`  - ${error}`, colors.red));
    return false;
  } else {
    log('\n✅ App configuration looks good', colors.green);
    return true;
  }
}

/**
 * Run all tests and report results
 */
function runAllTests() {
  log('\n🧪 FASHION ADMIN DASHBOARD TEST SUITE 🧪', colors.bright + colors.cyan);
  log('=======================================\n', colors.bright + colors.cyan);
  
  const results = {
    jsSyntax: false,
    htmlValidity: false,
    configuration: false
  };
  
  try {
    results.jsSyntax = checkJavaScriptSyntax();
  } catch (error) {
    log(`Error during JS syntax check: ${error.message}`, colors.red);
  }
  
  try {
    results.htmlValidity = checkHTMLValidity();
  } catch (error) {
    log(`Error during HTML check: ${error.message}`, colors.red);
  }
  
  try {
    results.configuration = checkAppConfiguration();
  } catch (error) {
    log(`Error during configuration check: ${error.message}`, colors.red);
  }
  
  // Final report
  log('\n📊 TEST SUMMARY', colors.bright + colors.cyan);
  log('============\n', colors.bright + colors.cyan);
  
  log(`JavaScript Syntax Check: ${results.jsSyntax ? '✅ PASS' : '❌ FAIL'}`, results.jsSyntax ? colors.green : colors.red);
  log(`HTML Validation Check:   ${results.htmlValidity ? '✅ PASS' : '❌ FAIL'}`, results.htmlValidity ? colors.green : colors.red);
  log(`App Configuration Check: ${results.configuration ? '✅ PASS' : '❌ FAIL'}`, results.configuration ? colors.green : colors.red);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    log('\n✅ All tests passed! Your app is ready for deployment.', colors.green);
    return true;
  } else {
    log('\n❌ Some tests failed. Please fix the issues before deploying.', colors.red);
    return false;
  }
}

// Run all tests when this script is executed directly
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runAllTests,
  checkJavaScriptSyntax,
  checkHTMLValidity,
  checkAppConfiguration
};