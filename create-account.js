// Script to create new account with the provided seed phrase
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const seedPhrase = 'awake action blast belt brother aware armed acoustic axis able bird beyond';
const userName = 'User'; // You can change this name
const usersFile = path.join(__dirname, 'data', 'users.json');
const sessionsFile = path.join(__dirname, 'data', 'sessions.json');

// Helper functions
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    return null;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error.message);
    return false;
  }
}

function setSessionCookie(res, sessionId) {
  res.cookie('session', sessionId, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
}

// Main function
async function createAccount() {
  console.log('🚀 Creating new account with seed phrase...');
  console.log('Seed Phrase:', seedPhrase);
  
  // Generate hash
  const hash = crypto.createHash('sha256').update(seedPhrase).digest('hex');
  console.log('Hash:', hash);
  
  // Validate seed phrase
  const words = seedPhrase.split(' ').filter(w => w.trim().length > 0);
  if (words.length !== 12) {
    console.error('❌ Invalid seed phrase format. Expected 12 words, got:', words.length);
    return;
  }
  
  // Read existing users
  const users = readJSON(usersFile) || { users: [] };
  
  // Check if seed phrase already exists
  if (users.users.some(u => u.seedPhraseHash === hash)) {
    console.error('❌ Seed phrase already registered');
    return;
  }
  
  // Generate salt and verification hash
  const seedSalt = crypto.randomBytes(16).toString('base64url');
  const seedHashVerify = crypto.pbkdf2Sync(seedPhrase, seedSalt, 100000, 32, 'sha256').toString('base64url');
  
  // Create new user
  const user = {
    id: nanoid(10),
    name: userName,
    seedPhraseHash: hash,
    seedSalt: seedSalt,
    seedHashVerify: seedHashVerify,
    role: 'user',
    anonymous: true,
    createdAt: new Date().toISOString(),
    legacy: false // This is a new account with proper verification
  };
  
  // Add user to database
  users.users.push(user);
  users.updatedAt = new Date().toISOString();
  
  // Save users
  if (writeJSON(usersFile, users)) {
    console.log('✅ User added to database');
  } else {
    console.error('❌ Failed to save user to database');
    return;
  }
  
  // Create session
  const sessions = readJSON(sessionsFile) || { sessions: [] };
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  
  sessions.sessions.push({
    id: sessionId,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt
  });
  sessions.updatedAt = new Date().toISOString();
  
  // Save sessions
  if (writeJSON(sessionsFile, sessions)) {
    console.log('✅ Session created');
  } else {
    console.error('❌ Failed to save session');
    return;
  }
  
  console.log('\n🎉 Account created successfully!');
  console.log('User ID:', user.id);
  console.log('Name:', user.name);
  console.log('Seed Phrase:', seedPhrase);
  console.log('Hash:', hash);
  console.log('Session ID:', sessionId);
  console.log('Expires:', expiresAt);
  
  console.log('\n📋 Next steps:');
  console.log('1. Go to login.html');
  console.log('2. Enter your seed phrase:');
  console.log('   ' + seedPhrase);
  console.log('3. Click "เข้าสู่ระบบ"');
  console.log('4. You should be able to login successfully!');
}

// Run the script
createAccount().catch(console.error);
