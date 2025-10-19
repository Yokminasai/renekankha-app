import fs from 'fs';
import crypto from 'crypto';

console.log('🔧 Starting seed phrase fix...\n');

// Step 1: Fix server.js - remove duplicate login endpoint
let serverContent = fs.readFileSync('server.js', 'utf8');

// Find the old duplicate endpoint at line 257
const duplicateStart = serverContent.indexOf("app.post('/api/auth/anonymous-login', (req, res) => {");
const duplicateEnd = serverContent.indexOf("app.get('/api/auth/me'");

if (duplicateStart !== -1 && duplicateEnd !== -1) {
  // Check if it's the second one (the broken one)
  const firstLoginIdx = serverContent.indexOf("app.post('/api/auth/anonymous-login'");
  const secondLoginIdx = serverContent.indexOf("app.post('/api/auth/anonymous-login'", firstLoginIdx + 1);
  
  if (secondLoginIdx !== -1) {
    const beforeDuplicate = serverContent.substring(0, secondLoginIdx);
    const afterDuplicate = serverContent.substring(duplicateEnd);
    serverContent = beforeDuplicate + '\n' + afterDuplicate;
    console.log('✅ Removed duplicate anonymous-login endpoint');
  }
}

fs.writeFileSync('server.js', serverContent);

// Step 2: Migrate old users - add seedSalt and seedHashVerify
console.log('\n📝 Migrating old users...');

let usersData = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));

usersData.users = usersData.users.map(user => {
  // If user doesn't have seedSalt/seedHashVerify, they need migration
  if (!user.seedSalt || !user.seedHashVerify) {
    console.log(`  ⚠️  Migrating user: ${user.id} (${user.name})`);
    // Mark as needs verification - we can't get the original seed phrase
    // So we mark it as "legacy" user
    user.legacy = true;
    user.seedSalt = 'LEGACY_NO_SALT';
    user.seedHashVerify = 'LEGACY_NO_VERIFY';
  }
  return user;
});

fs.writeFileSync('data/users.json', JSON.stringify(usersData, null, 2));
console.log(`\n✅ Migrated ${usersData.users.length} users`);

console.log('\n⚠️  IMPORTANT: Legacy users marked as "legacy": true');
console.log('   These users need to re-register with proper seed phrase verification');
console.log('   They will not be able to login until they register again\n');

console.log('✅ Seed phrase fix completed!');

