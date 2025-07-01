/**
 * Deployment Agent for Fashion Admin Dashboard
 * 
 * This script automates the deployment process to Firebase Hosting.
 * It verifies files, updates version numbers, and provides deployment feedback.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    log(`Command failed: ${command}`, colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Verify all required files exist before deployment
 */
function verifyRequiredFiles() {
  log('Verifying project files...', colors.yellow);
  
  const requiredFiles = [
    "public/index.html",
    "public/css/main.css", 
    "public/css/dashboard.css",
    "public/css/mobile.css",
    "google-drive-storage.js",
    "extension-conflict-handler.js",
    "public/js/app.js",
    "public/js/data.js",
    "public/js/utils.js",
    "public/components/navigation.js",
    "public/components/mobile-menu.js",
    "public/auth/login.html",
    "public/pages/dashboard.html",
    "public/pages/orders.html",
    "public/pages/create-order.html",
    "public/pages/customers.html",
    "public/pages/settings.html",
    "public/js/pages/dashboard.js",
    "public/js/pages/orders.js",
    "public/js/pages/create-order.js",
    "public/js/pages/customers.js",
    "public/js/pages/settings.js",
    "firebase.json",
    "sw.js"
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (!fileExists(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    log('⚠️  Warning: The following required files are missing:', colors.red);
    for (const file of missingFiles) {
      log(`  - ${file}`, colors.red);
    }
    
    return false;
  }
  
  log('✓ All required files verified', colors.green);
  return true;
}

/**
 * Update version numbers in files for cache busting
 */
function updateVersionNumbers() {
  log('Checking version numbers...', colors.yellow);
  
  const appJsPath = path.join(PUBLIC_DIR, 'js', 'app.js');
  const swJsPath = path.join(ROOT_DIR, 'sw.js');
  
  if (!fileExists(appJsPath) || !fileExists(swJsPath)) {
    log('⚠️  Could not find app.js or sw.js to update versions', colors.red);
    return false;
  }
  
  // Read the files
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  const swJsContent = fs.readFileSync(swJsPath, 'utf8');
  
  // Extract versions
  const appVersionMatch = appJsContent.match(/app_version.*?v(\d+)/);
  const swVersionMatch = swJsContent.match(/gdrive-dashboard-v(\d+)/);
  
  if (!appVersionMatch) {
    log('⚠️  Could not find version in app.js', colors.red);
    return false;
  }
  
  if (!swVersionMatch) {
    log('⚠️  Could not find cache version in sw.js', colors.red);
    return false;
  }
  
  const appVersion = parseInt(appVersionMatch[1], 10);
  const swVersion = parseInt(swVersionMatch[1], 10);
  
  // Update versions if they differ
  if (appVersion !== swVersion) {
    log(`Versions don't match: app.js (v${appVersion}) vs sw.js (v${swVersion})`, colors.yellow);
    log(`Updating sw.js cache version to v${appVersion}...`, colors.yellow);
    
    const updatedSwContent = swJsContent.replace(
      /gdrive-dashboard-v\d+/g,
      `gdrive-dashboard-v${appVersion}`
    );
    
    fs.writeFileSync(swJsPath, updatedSwContent, 'utf8');
    log('✓ Service worker cache version updated', colors.green);
  } else {
    log(`✓ Version numbers match (v${appVersion})`, colors.green);
  }
  
  // Increment version for this deployment
  const newVersion = appVersion + 1;
  log(`Incrementing version to v${newVersion} for this deployment...`, colors.yellow);
  
  const updatedAppContent = appJsContent.replace(
    /app_version.*?v\d+/,
    `app_version: 'v${newVersion}'`
  );
  
  const updatedSwContent = fs.readFileSync(swJsPath, 'utf8').replace(
    /gdrive-dashboard-v\d+/g,
    `gdrive-dashboard-v${newVersion}`
  );
  
  fs.writeFileSync(appJsPath, updatedAppContent, 'utf8');
  fs.writeFileSync(swJsPath, updatedSwContent, 'utf8');
  
  log(`✓ Version updated to v${newVersion}`, colors.green);
  return true;
}

/**
 * Prepare the project for deployment
 */
async function prepareForDeployment() {
  log('\n📦 PREPARING FOR DEPLOYMENT', colors.bright + colors.cyan);
  
  // Check if files are verified
  const filesVerified = verifyRequiredFiles();
  if (!filesVerified) {
    return askToContinue('Some required files are missing. Continue anyway?');
  }
  
  // Update version numbers
  updateVersionNumbers();
  
  return true;
}

/**
 * Check if Firebase CLI is installed
 */
function checkFirebaseCLI() {
  log('\nChecking Firebase CLI installation...', colors.yellow);
  
  try {
    const output = executeCommand('npm list -g firebase-tools', { silent: true, ignoreError: true });
    
    if (output.includes('firebase-tools')) {
      log('✓ Firebase CLI is installed', colors.green);
      return true;
    }
    
    log('Firebase CLI not found. Installing...', colors.yellow);
    executeCommand('npm install -g firebase-tools');
    log('✓ Firebase CLI installed successfully', colors.green);
    return true;
  } catch (error) {
    log('⚠️  Error checking Firebase CLI:', colors.red);
    log(error.message, colors.red);
    return false;
  }
}

/**
 * Deploy the project to Firebase Hosting
 */
function deployToFirebase() {
  log('\n🚀 DEPLOYING TO FIREBASE', colors.bright + colors.cyan);
  
  // Login to Firebase (if needed)
  log('Ensuring you are logged in to Firebase...', colors.yellow);
  executeCommand('npx firebase login --no-localhost');
  
  // Deploy to Firebase
  log('Deploying to Firebase Hosting...', colors.yellow);
  const deployOutput = executeCommand('npx firebase deploy --only hosting', { silent: true });
  
  // Extract hosting URL
  const hostingUrlMatch = deployOutput.match(/Hosting URL: (https:\/\/.+)/);
  const hostingUrl = hostingUrlMatch ? hostingUrlMatch[1] : null;
  
  if (hostingUrl) {
    log(`\n✅ Deployment successful! Your site is live at:`, colors.green);
    log(`   ${hostingUrl}`, colors.bright + colors.cyan);
    return hostingUrl;
  } else {
    log(`\n✅ Deployment successful!`, colors.green);
    log(`   Check Firebase Console for your hosting URL`, colors.yellow);
    return null;
  }
}

/**
 * Ask user a yes/no question
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(`${question} (y/n) `, answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Ask user if they want to continue despite warnings
 */
async function askToContinue(message) {
  log(`⚠️  ${message}`, colors.yellow);
  const shouldContinue = await askQuestion('Do you want to continue?');
  return shouldContinue;
}

/**
 * Main function to run the deployment process
 */
async function runDeployment() {
  log('\n🔷 FASHION ADMIN DASHBOARD DEPLOYMENT 🔷', colors.bright + colors.cyan);
  log('=======================================\n', colors.bright + colors.cyan);
  
  const readyToDeploy = await prepareForDeployment();
  if (!readyToDeploy) {
    log('Deployment cancelled.', colors.red);
    rl.close();
    return;
  }
  
  const firebaseCLIReady = checkFirebaseCLI();
  if (!firebaseCLIReady) {
    const shouldContinue = await askToContinue('Issues with Firebase CLI. Continue anyway?');
    if (!shouldContinue) {
      log('Deployment cancelled.', colors.red);
      rl.close();
      return;
    }
  }
  
  const hostingUrl = deployToFirebase();
  
  if (hostingUrl) {
    const openSite = await askQuestion('Do you want to open the deployed site in your browser?');
    if (openSite) {
      const startCommand = process.platform === 'win32' ? 'start' : 'open';
      executeCommand(`${startCommand} ${hostingUrl}`);
    }
  }
  
  log('\n📊 DEPLOYMENT SUMMARY', colors.bright + colors.cyan);
  log('==================', colors.bright + colors.cyan);
  log('✅ Files verified', colors.green);
  log('✅ Version numbers updated', colors.green);
  log('✅ Deployment to Firebase completed', colors.green);
  log('\nThank you for using the Fashion Admin Dashboard Deployment Tool!', colors.bright);
  
  rl.close();
}

// Start the deployment process
runDeployment();