import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing chat-support.js paths...\n');

// List of HTML files to fix
const htmlFiles = [
  'login.html',
  'register.html',
  'pay-success.html',
  'pay-cancel.html',
  'test-2fa.html',
  'profit-calculator.html',
  'reports.html',
  'scammed-reports.html',
  'services-blacklist-dispute.html',
  'services-email-checker.html',
  'services-email.html',
  'services-garena.html',
  'services-google-removal.html',
  'services-private-id-check.html',
  'services-scam-reporting.html',
  'services-scammed-account.html',
  'services-twitter-checker.html',
  'services.html',
  'authenticator.html',
  'check.html',
  'dashboard.html',
  'home.html',
  'index.html',
  'orders.html'
];

let fixedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  ${file} - not found`);
      return;
    }
    
    // Read file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if needs fixing
    if (!content.includes('chat-support.js')) {
      console.log(`✓  ${file} - no chat-support script`);
      return;
    }
    
    // Check if already has correct path
    if (content.includes('./chat-support.js')) {
      console.log(`✓  ${file} - already fixed`);
      return;
    }
    
    // Fix the path
    const oldPath = 'src="chat-support.js"';
    const newPath = 'src="./chat-support.js"';
    
    if (content.includes(oldPath)) {
      content = content.replace(oldPath, newPath);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file} - fixed`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ ${file} - error: ${error.message}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🚀 All chat-support.js paths updated to use relative paths!');
