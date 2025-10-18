const fs = require('fs');
const path = require('path');

// Get all HTML files in the root directory
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

const chatScript = `  <!-- Chat Support Widget -->
  <script src="chat-support.js"><\/script>`;

let updated = 0;
let skipped = 0;

console.log(`📋 Found ${htmlFiles.length} HTML files\n`);

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already has chat support
  if (content.includes('chat-support.js')) {
    console.log(`⏭️  ${file} - Already has chat support`);
    skipped++;
    return;
  }

  // Check if file has </body> tag
  if (!content.includes('</body>')) {
    console.log(`⚠️  ${file} - No </body> tag found`);
    skipped++;
    return;
  }

  // Add chat script before </body>
  const updated_content = content.replace('</body>', chatScript + '\n</body>');
  fs.writeFileSync(filePath, updated_content);
  
  console.log(`✅ ${file} - Chat support added`);
  updated++;
});

console.log(`\n📊 Summary:`);
console.log(`✅ Updated: ${updated}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`\n🎉 Done! Chat support is now on all pages!`);
