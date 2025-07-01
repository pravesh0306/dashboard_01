#!/usr/bin/env node

/**
 * Fashion Admin Dashboard Deployment Tool
 * 
 * This script provides a complete workflow for testing and deploying 
 * the Fashion Admin Dashboard application to Firebase Hosting.
 */

const path = require('path');
const readline = require('readline');
const { runAllTests } = require('./test-agent');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
 * Main function to orchestrate the deployment process
 */
async function main() {
  log('\n🚀 FASHION ADMIN DASHBOARD DEPLOYMENT WORKFLOW 🚀', colors.bright + colors.cyan);
  log('=================================================\n', colors.bright + colors.cyan);
  
  log('This tool will guide you through testing and deploying the Fashion Admin Dashboard.', colors.bright);
  
  // Step 1: Run tests
  log('\n📋 STEP 1: Testing the application', colors.bright + colors.yellow);
  const runTests = await askQuestion('Do you want to run tests before deploying?');
  
  let testsPassed = true;
  if (runTests) {
    testsPassed = runAllTests();
    
    if (!testsPassed) {
      const continueAnyway = await askQuestion('Tests failed. Do you still want to proceed with deployment?');
      if (!continueAnyway) {
        log('\n❌ Deployment cancelled due to test failures.', colors.red);
        rl.close();
        return;
      }
      log('\n⚠️  Proceeding with deployment despite test failures.', colors.yellow);
    }
  } else {
    log('Skipping tests...', colors.yellow);
  }
  
  // Step 2: Deploy
  log('\n📋 STEP 2: Deploying to Firebase', colors.bright + colors.yellow);
  const deploy = await askQuestion('Do you want to deploy the application now?');
  
  if (deploy) {
    log('\nStarting deployment process...', colors.green);
    require('./deploy-agent'); // This will run the deployment process
  } else {
    log('\n❌ Deployment cancelled by user.', colors.red);
    rl.close();
  }
}

// Start the main process
main().catch(error => {
  log(`\n❌ An error occurred: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});
