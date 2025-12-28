#!/usr/bin/env node

/**
 * Deploy Script for FreeSetu
 * 
 * Usage:
 *   npm run deploy "Your commit message"
 *   
 * Or directly:
 *   node scripts/deploy.js "Your commit message"
 * 
 * This script:
 * 1. Disables DEV_BYPASS modes for production
 * 2. Stages all changes (git add .)
 * 3. Commits with your message
 * 4. Pushes to origin main
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} - Done!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Failed!`, 'red');
    return false;
  }
}

function updateFile(filePath, searchValue, replaceValue, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes(searchValue)) {
      content = content.replace(searchValue, replaceValue);
      fs.writeFileSync(fullPath, content, 'utf8');
      log(`✅ ${description} - Done!`, 'green');
      return true;
    } else if (content.includes(replaceValue)) {
      log(`ℹ️  ${description} - Already set correctly`, 'yellow');
      return true;
    } else {
      log(`⚠️  ${description} - Pattern not found`, 'yellow');
      return true;
    }
  } catch (error) {
    log(`❌ ${description} - Failed: ${error.message}`, 'red');
    return false;
  }
}

// Main deploy function
async function deploy() {
  // Get commit message from arguments
  const commitMessage = process.argv.slice(2).join(' ') || `Deploy ${new Date().toISOString().split('T')[0]}`;
  
  log('\n🚀 Starting FreeSetu Deploy Script', 'cyan');
  log('━'.repeat(50), 'cyan');
  log(`📝 Commit message: "${commitMessage}"`, 'yellow');

  // Step 1: Disable DEV_BYPASS in middleware.ts
  updateFile(
    'middleware.ts',
    'const DEV_BYPASS_ADMIN_AUTH = true;',
    'const DEV_BYPASS_ADMIN_AUTH = false;',
    'Disabling DEV_BYPASS_ADMIN_AUTH in middleware.ts'
  );

  // Step 2: Disable DEV_BYPASS in admin layout
  updateFile(
    'app/admin/layout.tsx',
    'const DEV_BYPASS_AUTH = true;',
    'const DEV_BYPASS_AUTH = false;',
    'Disabling DEV_BYPASS_AUTH in admin/layout.tsx'
  );

  // Step 3: Git add
  if (!runCommand('git add .', 'Staging all changes')) {
    process.exit(1);
  }

  // Step 4: Git commit
  if (!runCommand(`git commit -m "${commitMessage}"`, 'Committing changes')) {
    log('\n⚠️  Nothing to commit or commit failed. Continuing...', 'yellow');
  }

  // Step 5: Git push
  if (!runCommand('git push origin main', 'Pushing to origin main')) {
    process.exit(1);
  }

  log('\n' + '━'.repeat(50), 'green');
  log('🎉 Deploy completed successfully!', 'green');
  log('━'.repeat(50) + '\n', 'green');
}

// Run deploy
deploy().catch((error) => {
  log(`\n❌ Deploy failed: ${error.message}`, 'red');
  process.exit(1);
});

